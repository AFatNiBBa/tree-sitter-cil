# tree-sitter-cil

Grammatica tree-sitter per il CIL di .NET (il linguaggio intermedio dei file `.il`, come quelli prodotti da ILDASM), pubblicata su npm come `@seanalunni/tree-sitter-cil`.
Copre solo il sottoinsieme di CIL che è servito finora e cresce un pezzo alla volta: **niente overengineering**, soluzioni minime e coerenti con ciò che c'è già.

## Stack e comandi
- **tree-sitter-cli 0.27**, grammatica in `grammar.js` (ESM, `// @ts-check` con i tipi del DSL)
- `npm run generate` → rigenera `src/` (`parser.c`, `grammar.json`, `node-types.json`, `tree_sitter/*`): sono generati ma **versionati**, non modificarli a mano
- `npm run build` → `generate` + `tree-sitter build --wasm` (produce `tree-sitter-cil.wasm`, ignorato da git)
- `npm test` → `tree-sitter test` sui casi in `test/corpus/cil.txt`
- `npm start` → build + `tree-sitter playground`
- `npm run save` → build + `npm publish` (va fatto solo su richiesta). Il nome non può essere `tree-sitter-cil` perché npm lo considera troppo simile a `tree-sitter-cli` (vedi `readMe.md`)
- `npm run ssl` → corregge su Windows l'errore di revoca dei certificati di curl quando la CLI scarica qualcosa
- Il pacchetto pubblica solo `queries/*` e `*.wasm` (`files` di `package.json`): i binding nativi sono tutti disattivati in `tree-sitter.json`

## Chi la usa
- L'estensione VS Code `vscode-lang-cil`, nel repo vicino `../vscode-tree-sitter` (`package/vscode-lang-cil`): carica il `.wasm` con `web-tree-sitter` e importa `queries/highlights.scm` per produrre i **token semantici** di VS Code
- Per questo i nomi delle capture in `highlights.scm` non sono quelli standard di tree-sitter/Helix (`@function.method`, `@variable.parameter`, ...) ma i tipi di token di VS Code (`@method`, `@parameter`, `@property`, `@macro`, `@regexp`, ...), che devono esistere in `TOKEN_TYPES` di `legend.ts` dell'estensione. La parte dopo il punto diventa un modificatore (`@string.escape` → `string` + `escape`, dichiarato come modificatore personalizzato)
- Le scelte di colore sono "semantiche" a modo loro: `@regexp` per gli assembly, `@macro` per modificatori e tipi intrinseci, `@function` per le istruzioni. Sono volute per distinguere bene i pezzi a colpo d'occhio
- Le query usano anche i modificatori della legenda: `declaration` sui nomi nelle definizioni (`def_*`, `generics_item`, le locali e i parametri dichiarati, le etichette prima dei `:`), più `@variable` per le locali e `@event` per gli eventi. `static`, `readonly` e simili non si possono esprimere senza catturare due volte lo stesso nodo (non c'è modo di dire "senza il modificatore `static`"), quindi non ci sono
- Ogni nodo deve essere catturato da un solo pattern: per questo gli identificatori sono elencati per genitore (`(def_method (id_method ...))`, `(ref_method (id_method ...))`, ...) invece che con un pattern generico. Quando si aggiunge un genitore nuovo ad un `id_*` va aggiunto anche il suo pattern, altrimenti resta senza colore
- I predicati (`#match?`, `#eq?`) funzionano anche in `web-tree-sitter`: si usano per distinguere gli operandi di `ldarg` & co. (`@parameter`) da quelli di `ldloc` & co. (`@variable`). La capture di appoggio si chiama `@_qualcosa`: non è un tipo della legenda, quindi l'estensione la scarta
- Cambiare il nome di un nodo o di un alias rompe le query: dopo una modifica alla grammatica va ricontrollato `highlights.scm` (oltre ai test)

## Grammatica
- Copre la grammatica completa dell'annesso C di Partition VI (VI.C.3 in `assets/cil.pdf`), più le forme di Partition II che ILDASM produce (`.param type` / `constraint`, `.line a,b : c,d`, `.permissionset ... = { ... }`, `.class extern forwarder`). Restano fuori solo:
  - le etichette senza istruzione (`L: }`), perché con `repeat(seq($.id_label, ":"))` dentro `statement` diventerebbero ambigue
  - gli attributi dei parametri (`[in]`, ...) prima del tipo di ritorno di un metodo
  - gli attributi personalizzati in forma verbosa (`.custom ... = { string('a') }`, opzione `/CAVERBAL` di ILDASM)
  - le direttive non standard di ILASM 2.0 (`.typedef`, `.typelist`, `.mscorlib`, `.this`) e le istruzioni `INSTR_RVA` / `INSTR_PHI` dell'annesso
- Regole raggruppate con `//#region` per prefisso: `id_*` (identificatori nelle definizioni), `ref_*` (riferimenti ad assembly, classi, membri, metodi), `def_*` (definizioni con un corpo tra graffe, più `.data`), `block*` (blocchi `.try`, gestori e blocchi `{ }` dentro i metodi), `option_*` (direttive dentro un corpo), `type*`, `string*`, token
  - Le direttive valide in più contesti hanno una regola propria invece di stare in quella del contesto: `option_param` (classi e metodi), `option_security` (`.permission`, `.permissionset`), `option_source` (`.line`, `#line`, `.language`), `option_manifest` (il corpo di `.mresource`, `.class extern` ed `.export`)
- Le liste di quello che può stare nel modulo / in un `.namespace` e nel corpo di un metodo / in un `block` sono le funzioni `moduleDecls` e `methodDecls` in cima al file, insieme a `callConv` (convenzione di chiamata, alias di parole letterali su `$.modifier`) e `target` (etichetta o offset)
- Le parole chiave non sono nodi propri: si usa `alias("...", $.keyword)`, `alias(..., $.modifier)` e `alias(..., $.instruction)`, così le query hanno pochi nodi da colorare. Le direttive di più parole (`.locals init`, `.hash algorithm`) sono un unico alias su `seq(...)`
- **Niente `field()`**: sono stati tolti tutti (insieme a `body`) perché non servivano. Le query distinguono i nodi tramite il loro tipo (`id_class`, `id_member`, ...), non tramite i campi
- I modificatori sono `$.word` generiche (`repeat($.modifier)`), non un elenco chiuso
- Le istruzioni sono elencate a mano in `statement`, raggruppate per tipo di operando (metodo, campo, intero, argomento o locale, etichetta, tipo, stringa, nessuno), ognuna con un'unica `seq` su un `alias(choice(...), $.instruction)`. Trovare un modo per non definirle a mano è un TODO
  - Ci sono tutte quelle dell'annesso tranne `INSTR_RVA` / `INSTR_PHI`. `ldtoken` accetta un tipo, una classe, `method` + metodo o `field` + campo, ma in `todo.ppath` c'è ancora una domanda aperta
  - Gli operandi di tipo (`box`, `newarr`, `isinst`, ...) accettano `choice($.type, $.ref_class)`, perché lì `class` / `valuetype` si possono omettere (ILDASM li omette)
  - Le locali non hanno un nodo proprio: sono dichiarate con `args` in `.locals`, quindi sia lì che negli operandi di `ldloc` & co. sono `id_parameter`
  - I prefissi (`tail.`, `volatile.`, `unaligned.`, ...) sono istruzioni a sé, quindi un `statement` separato da quella che modificano
- Generici: `generics` / `generics_item` sono la dichiarazione dei parametri (dopo il nome della classe o del metodo, con varianza, vincoli speciali e vincoli di tipo tra parentesi), `type_args` l'istanza (`class Foo`1<int32>`, `Bar<!!0>(...)`), `type_parameter` il riferimento (`!0`, `!!0`, `!T`; la forma numerica è un token unico, così nelle query non si sovrappone a `integer`)
- Dove un tipo può essere il "proprietario" di un membro (`ref_member`, `ref_method`, `.override`), una base (`extends`, `implements`, `catch`) o un vincolo, si accetta `choice($.ref_class, $.type)`: lì c'è una classe nuda o un tipo completo (per esempio un generico istanziato)
- ILDASM mette tra apici gli identificatori che coincidono con parole chiave di ILASM (`'value'`, `'method'`): per questo le parole letterali della grammatica (istruzioni, `class`, `marshal`, ...) non vanno in conflitto con `word`, che accetta anche `` ` ``, `$`, `@` e `?` (`List`1`)
- `id_method` accetta `.ctor` / `.cctor` come `keyword` (in `todo.ppath` è chiamata "tappabucata": prima o poi va tolta)
- Le stringhe sono `string_single` concatenate con `+`; `string_content` e `string_escape` sono token separati (`token.immediate`) solo per poterli colorare diversamente. `string_content` ha `prec(1)`, altrimenti un `//` dentro la stringa diventa un commento (ILDASM spezza le stringhe lunghe su più righe, quindi un frammento può iniziare con degli spazi)
- Il tipo nativo di `marshal(...)` è volutamente un insieme libero di parole, numeri, stringhe e simboli, invece della grammatica `nativeType` dell'annesso. Per via del `+` libero, `string` è `prec.right`
- `.line` è `prec.right`: un nome tra apici dopo la posizione appartiene alla direttiva, anche se potrebbe essere l'etichetta dell'istruzione successiva
- In `.field` il `marshal` sta tra i modificatori (prima del tipo), in `.method` e nei parametri dopo il tipo, come nella specifica
- `;` è ammesso come elemento vuoto nel modulo e nei corpi delle definizioni

## Test e file di prova
- Le query si possono provare con lo stesso motore dell'estensione, caricando il `.wasm` con il `web-tree-sitter` di `../vscode-tree-sitter/node_modules`: i conteggi delle capture devono coincidere con quelli di `tree-sitter query`
- La grammatica parsa senza errori `../eu.il` e `../gegfu.il` (due assembly reali disassemblati con ILDASM, circa 33k righe l'uno): sono il banco di prova per le modifiche. Oltre a cercare `ERROR` / `MISSING` nell'output di `tree-sitter parse`, conviene confrontare il numero di nodi (`def_method`, `statement`, `block_try`, ...) con quello delle righe corrispondenti nel sorgente
- Ogni volta che si aggiunge un costrutto va aggiunto (o aggiornato) un caso in `test/corpus/cil.txt`. L'albero atteso si può rigenerare con `tree-sitter test --update`, ma va poi riletto, perché accetta qualunque cosa la grammatica produca
- `assets/` contiene materiale di riferimento, non usato dal codice: la specifica (`cil.pdf`), l'elenco di direttive e istruzioni (`il.json`), un file reale da parsare (`test.il`), le query della grammatica di C# come esempio (`c#-*.scm`), configurazione e temi di Helix delle prime prove (`languages.toml`, `*.toml`, ferma ad un commit vecchio). `test.log` è l'output di un parse vecchio, con nomi di nodi che non esistono più (`part_keyword`, `part_body`)

## Stile
- 2 spazi di indentazione (`.vscode/settings.json`), doppi apici, punto e virgola
- In `grammar.js` commenti e JSDoc sono **in inglese**; i messaggi di commit e `todo.ppath` sono in italiano
- Riga vuota all'inizio di `grammar.js` e di `highlights.scm`
- In `highlights.scm` si raggruppano con `[ ... ]` le capture che condividono il nome, e i pattern dello stesso tipo di nodo con genitori diversi. L'estensione unisce le capture sovrapposte solo dentro la stessa match: due pattern diversi non devono catturare lo stesso nodo (o nodi uno dentro l'altro), per questo per esempio `id_generic` non viene catturato dentro `type_parameter`, che è già colorato per intero
- Imitare lo stile del codice circostante anche quando è insolito; nel dubbio, chiedere

## Come lavorare
- `todo.ppath`: appunti personali in un formato libero (catene con `>`, identificatori tra doppi apici), da leggere come contesto e da non riformattare. Si modifica solo su richiesta
- Dopo ogni modifica a `grammar.js`: `npm run generate` (così `src/` resta allineata, visto che è versionata) e `npm test`
- La versione pubblicata è quella di `package.json` (e di `package-lock.json`); quella in `tree-sitter.json` è rimasta a `0.1.0` e non viene tenuta allineata
- Git lo gestisce l'utente: niente commit, cambi di branch, merge o pubblicazioni su npm se non richiesti
- I fine riga li gestisce git (`.gitattributes`): non serve preoccuparsene
- **Aggiorna questo file** ogni volta che scopri qualcosa di non ovvio sul progetto che non è già scritto qui: convenzioni, scelte volute, spiegazioni dell'utente, trappole. Tienilo conciso e nello stesso formato
