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
- Cambiare il nome di un nodo o di un alias rompe le query: dopo una modifica alla grammatica va ricontrollato `highlights.scm` (oltre ai test)

## Grammatica
- Regole raggruppate con `//#region` per prefisso: `id_*` (identificatori nelle definizioni), `ref_*` (riferimenti ad assembly, classi, membri, metodi), `def_*` (definizioni con un corpo tra graffe), `option_*` (direttive dentro un corpo), `type*`, `string*`, token
- Le parole chiave non sono nodi propri: si usa `alias("...", $.keyword)`, `alias(..., $.modifier)` e `alias(..., $.instruction)`, così le query hanno pochi nodi da colorare. Le direttive di più parole (`.locals init`, `.hash algorithm`) sono un unico alias su `seq(...)`
- **Niente `field()`**: sono stati tolti tutti (insieme a `body`) perché non servivano. Le query distinguono i nodi tramite il loro tipo (`id_class`, `id_member`, ...), non tramite i campi
- I modificatori sono `$.word` generiche (`repeat($.modifier)`), non un elenco chiuso
- Le istruzioni sono elencate a mano in `statement`, raggruppate per tipo di operando (metodo, campo, intero, argomento o locale, etichetta, tipo, stringa, nessuno), ognuna con un'unica `seq` su un `alias(choice(...), $.instruction)`. Trovare un modo per non definirle a mano è un TODO
  - Mancano quelle che richiedono nodi che ancora non esistono: `ldc.r4` / `ldc.r8` (numeri decimali), `calli` (firma senza nome), `ldtoken` (domanda aperta in `todo.ppath`), oltre ai numeri negativi in generale (`integer` non ha il segno)
  - Gli operandi di tipo (`box`, `newarr`, `isinst`, ...) accettano `choice($.type, $.ref_class)`, perché lì `class` / `valuetype` si possono omettere (ILDASM li omette)
  - Le locali non hanno un nodo proprio: sono dichiarate con `args` in `.locals`, quindi sia lì che negli operandi di `ldloc` & co. sono `id_parameter`
  - I prefissi (`tail.`, `volatile.`, `unaligned.`, ...) sono istruzioni a sé, quindi un `statement` separato da quella che modificano
- `id_method` accetta `.ctor` / `.cctor` come `keyword` (in `todo.ppath` è chiamata "tappabucata": prima o poi va tolta)
- Le stringhe sono `string_single` concatenate con `+`; `string_content` e `string_escape` sono token separati (`token.immediate`) solo per poterli colorare diversamente
- `;` è ammesso come elemento vuoto nel modulo e nei corpi delle definizioni

## Test e file di prova
- Ogni volta che si aggiunge un costrutto va aggiunto (o aggiornato) un caso in `test/corpus/cil.txt`. L'albero atteso si può rigenerare con `tree-sitter test --update`, ma va poi riletto, perché accetta qualunque cosa la grammatica produca
- `assets/` contiene materiale di riferimento, non usato dal codice: la specifica (`cil.pdf`), l'elenco di direttive e istruzioni (`il.json`), un file reale da parsare (`test.il`), le query della grammatica di C# come esempio (`c#-*.scm`), configurazione e temi di Helix delle prime prove (`languages.toml`, `*.toml`, ferma ad un commit vecchio). `test.log` è l'output di un parse vecchio, con nomi di nodi che non esistono più (`part_keyword`, `part_body`)

## Stile
- 2 spazi di indentazione (`.vscode/settings.json`), doppi apici, punto e virgola
- In `grammar.js` commenti e JSDoc sono **in inglese**; i messaggi di commit e `todo.ppath` sono in italiano
- Riga vuota all'inizio di `highlights.scm` (`grammar.js` inizia invece con `// @ts-check`)
- In `highlights.scm` si raggruppano le capture con `[ ... ]` quando condividono il nome
- Imitare lo stile del codice circostante anche quando è insolito; nel dubbio, chiedere

## Come lavorare
- `todo.ppath`: appunti personali in un formato libero (catene con `>`, identificatori tra doppi apici), da leggere come contesto e da non riformattare. Si modifica solo su richiesta
- Dopo ogni modifica a `grammar.js`: `npm run generate` (così `src/` resta allineata, visto che è versionata) e `npm test`
- La versione pubblicata è quella di `package.json` (e di `package-lock.json`); quella in `tree-sitter.json` è rimasta a `0.1.0` e non viene tenuta allineata
- Git lo gestisce l'utente: niente commit, cambi di branch, merge o pubblicazioni su npm se non richiesti
- I fine riga li gestisce git (`.gitattributes`): non serve preoccuparsene
- **Aggiorna questo file** ogni volta che scopri qualcosa di non ovvio sul progetto che non è già scritto qui: convenzioni, scelte volute, spiegazioni dell'utente, trappole. Tienilo conciso e nello stesso formato
