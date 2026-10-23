
// Every construct supported by the grammar, in its shortest form (it compiles with "ilasm /dll features.il" of .NET Framework 4)
/* Block comment */

//#region PREPROCESSOR

#define CORLIB "mscorlib"
#undef CORLIB
#ifndef NEVER_DEFINED
#endif
#ifdef NEVER_DEFINED // Valid for the grammar, but not accepted by the ilasm of .NET Framework 4 (it skips them, but they still get highlighted)
#include "missing.il"
.mscorlib
.typelist { [mscorlib]System.Object, N.S }
.culture "en-US"
.export public N.Exported { .file Data.bin }
.assembly noappdomain noprocess nomachine Rejected { .permissionset demand = bytearray (2E 00) }
.method compilercontrolled static void Rejected<(class [mscorlib]System.IComparable) M>(int32 marshal(float) a, int32 marshal(native float) b, int32 marshal(wchar) c) native unmanaged optil
{
  .param constraint M, class [mscorlib]System.IComparable // Only with the ilasm of .NET Core
  .permission demand [mscorlib]System.Security.Permissions.SecurityPermissionAttribute('Unrestricted' = 'true') // Partition II
  .field static literal string Q = string('abc')
  no. 1
}
.method static pinvokeimpl(winapi platformapi) void NoDll() { }
#else
#endif

//#endregion

//#region MANIFEST

.module
.module extern kernel32.dll
.assembly extern mscorlib
{
  .publickeytoken = (B7 7A 5C 56 19 34 E0 89)
  .ver 4 : 0 : 0 : 0
}
.assembly extern retargetable System.Core as Core
{
  .publickey = (00 24)
  .hash = (01 02)
  .locale "en-US"
}
.assembly Features
{
  .custom instance void [mscorlib]System.CLSCompliantAttribute::.ctor(bool) = (01 00 01 00 00)
  .custom ([.module kernel32.dll]Owner) instance void [mscorlib]System.ObsoleteAttribute::.ctor() = "abc"
  .custom ([mscorlib]) instance void [mscorlib]System.ObsoleteAttribute::.ctor()
  .custom instance void [mscorlib]System.ObsoleteAttribute::.ctor(string, class [mscorlib]System.Type, int32[], object) = {string('abc') type(class 'System.String, mscorlib') int32[2](1 2) object(string(nullref)) property bool 'A' = bool(true) field type 'B' = type(N.S)}
  .permission reqopt [mscorlib]System.Security.Permissions.UIPermissionAttribute("A" = true, "B" = false, "C" = 1, "D" = "d", "E" = int32(1), "F" = [mscorlib]System.E(int8:1), "G" = [mscorlib]System.E(int16:1), "H" = [mscorlib]System.E(int32:1), "I" = [mscorlib]System.E(1))
  .permissionset reqmin = {[mscorlib]System.Security.Permissions.SecurityPermissionAttribute = {property bool 'A' = bool(true) field enum class 'System.E' 'B' = int32(8)}}
  .permissionset reqrefuse = (2E 00)
  .hash algorithm 0x00008004
  .locale = (65 00 6E 00)
  .ver 1:0:0:0
}
.file nometadata Data.bin .hash = (AA BB)
.file Code.dll
.file alignment 0x200
.imagebase 0x10000000
.stackreserve 0x100000
.subsystem 3
.corflags 1
.vtable = (01 00 00 06)
.vtfixup [1] int32 fromunmanaged at VT
.vtfixup [1] int64 callmostderived at VT64
.language '{3F5162F8-07C6-11D3-9053-00C04FA302A1}'
.language '{3F5162F8-07C6-11D3-9053-00C04FA302A1}', '{994B45C4-E6E9-11D2-903F-00C04FA302A1}', '{5A869D0B-6611-11D3-BD2A-0000F80849BD}'
.mresource public Data.bin
{
  .file Data.bin at 0
  .custom instance void [mscorlib]System.ObsoleteAttribute::.ctor() = (01 00 00 00)
}
.mresource private Other.bin
{
  .assembly extern mscorlib
}
.mresource Third.bin { .file Data.bin at 0 }
.class extern forwarder System.Action
{
  .assembly extern mscorlib
}
.class extern public N.Exported
{
  .file Data.bin
  .class 0x02000002
  .custom instance void [mscorlib]System.ObsoleteAttribute::.ctor() = (01 00 00 00)
}
.class extern private N.Hidden { .file Data.bin }
.class extern nested public Inner { .class extern N.Exported }
.class extern nested private Inner2 { .class extern N.Exported }
.class extern nested family Inner3 { .class extern N.Exported }
.class extern nested assembly Inner4 { .class extern N.Exported }
.class extern nested famandassem Inner5 { .class extern N.Exported }
.class extern nested famorassem Inner6 { .class extern N.Exported }

//#endregion

//#region GLOBAL

;
.data VT = int32(0)
.data VT64 = int64(0)
.data D = bytearray (01 02)
.data cil C = { int8(1), int16(2) [2], int32(3), int64(4), float32(1.5), float64(2.), char*("hi"), &(D), bytearray (03) }
.data tls T = { int8, int16 [2], int32 [4], int64, float32, float64 [2] }
.data int32(1)
.field static assembly int32 Global at D
.typedef [mscorlib]System.Object as Obj
.typedef method instance void [mscorlib]System.Object::.ctor() as ObjCtor
.typedef field int32 Global as GlobalField
.typedef .custom instance void [mscorlib]System.ObsoleteAttribute::.ctor() as Obsolete
.field static assembly int32 'value'
.method static void Global() cil managed
{
  ret
}
.method static void Intrinsics(void* a, refany b, typedref c, bool d, char e, wchar f, object g, string h, float32 i, float64 j, int8 k, int16 l, int32 m, int64 n, uint8 o, uint16 p, uint32 q, uint64 r, unsigned int8 s, unsigned int16 t, unsigned int32 u, unsigned int64 v, native int w, native unsigned int x) cil managed
{
  ret
}
.method static void NativeTypes(
  int32 marshal(), int32 marshal(custom("a", "b", "c", "d")), int32 marshal(custom("a", "b")), int32 marshal(fixed sysstring [5]), int32 marshal(fixed array [5]),
  int32 marshal(variant), int32 marshal(currency), int32 marshal(syschar), int32 marshal(void), int32 marshal(bool), int32 marshal(error),
  int32 marshal(int8), int32 marshal(int16), int32 marshal(int32), int32 marshal(int64), int32 marshal(float32), int32 marshal(float64),
  int32 marshal(unsigned int8), int32 marshal(unsigned int16), int32 marshal(unsigned int32), int32 marshal(unsigned int64), int32 marshal(int), int32 marshal(unsigned int),
  int32 marshal(int32*), int32 marshal(int32[]), int32 marshal(int32[5]), int32 marshal(int32[5 + 1]), int32 marshal(int32[+1]),
  int32 marshal(decimal), int32 marshal(date), int32 marshal(bstr), int32 marshal(lpstr), int32 marshal(lpwstr), int32 marshal(lptstr), int32 marshal(objectref),
  int32 marshal(iunknown), int32 marshal(iunknown(iidparam = 1)), int32 marshal(idispatch), int32 marshal(struct), int32 marshal(interface), int32 marshal(nested struct), int32 marshal(byvalstr),
  int32 marshal(ansi bstr), int32 marshal(tbstr), int32 marshal(variant bool), int32 marshal(method), int32 marshal(as any), int32 marshal(lpstruct),
  int32 marshal(safearray), int32 marshal(safearray int32, "s")
) cil managed
{
  ret
}
.method static void VariantTypes(
  int32 marshal(safearray null), int32 marshal(safearray variant), int32 marshal(safearray currency), int32 marshal(safearray void), int32 marshal(safearray bool),
  int32 marshal(safearray int8), int32 marshal(safearray int16), int32 marshal(safearray int32), int32 marshal(safearray int64), int32 marshal(safearray float32), int32 marshal(safearray float64),
  int32 marshal(safearray unsigned int8), int32 marshal(safearray unsigned int16), int32 marshal(safearray unsigned int32), int32 marshal(safearray unsigned int64),
  int32 marshal(safearray int), int32 marshal(safearray unsigned int),
  int32 marshal(safearray *), int32 marshal(safearray int32[]), int32 marshal(safearray int32 vector), int32 marshal(safearray int32&),
  int32 marshal(safearray decimal), int32 marshal(safearray date), int32 marshal(safearray bstr), int32 marshal(safearray lpstr), int32 marshal(safearray lpwstr),
  int32 marshal(safearray iunknown), int32 marshal(safearray idispatch), int32 marshal(safearray safearray), int32 marshal(safearray error), int32 marshal(safearray hresult),
  int32 marshal(safearray carray), int32 marshal(safearray userdefined), int32 marshal(safearray record), int32 marshal(safearray filetime), int32 marshal(safearray blob),
  int32 marshal(safearray stream), int32 marshal(safearray storage), int32 marshal(safearray streamed_object), int32 marshal(safearray stored_object),
  int32 marshal(safearray blob_object), int32 marshal(safearray cf), int32 marshal(safearray clsid)
) cil managed
{
  ret
}
.method static void Security() cil managed
{
  .permissionset request = (2E 00)
  .permissionset demand = (2E 00)
  .permissionset assert = (2E 00)
  .permissionset deny = (2E 00)
  .permissionset permitonly = (2E 00)
  .permissionset linkcheck = (2E 00)
  .permissionset inheritcheck = (2E 00)
  .permissionset reqmin = (2E 00)
  .permissionset reqopt = (2E 00)
  .permissionset reqrefuse = (2E 00)
  .permissionset prejitgrant = (2E 00)
  .permissionset prejitdeny = (2E 00)
  .permissionset noncasdemand = (2E 00)
  .permissionset noncaslinkdemand = (2E 00)
  .permissionset noncasinheritance = (2E 00)
  ret
}

//#endregion

//#region TYPES

.namespace N
{
  .class interface public abstract auto ansi I`2<+ T, - U>
  {
    .method public hidebysig newslot abstract virtual instance !T M<V>(!U u) cil managed
    {
    }
  }
  .class public sequential ansi sealed S
         extends [mscorlib]System.ValueType
  {
    .pack 1
    .size 8
  }
  .class public explicit ansi sealed X
         extends [mscorlib]System.ValueType
  {
    .field [0] public int32 A
    .field [0] public marshal(lpwstr) string B
  }
  .class public sealed Handler
         extends [mscorlib]System.MulticastDelegate
  {
  }
  .class value sealed autochar V extends [mscorlib]System.ValueType { }
  .class enum sealed E extends [mscorlib]System.Enum { .field public specialname rtspecialname int32 value__ }
  .class private sealed unicode import serializable specialname rtspecialname beforefieldinit Q extends [mscorlib]System.Object { }
  .class public Derived extends Obj
  {
    .method public specialname rtspecialname instance void .ctor() cil managed { ldarg.0 call instance void .base::.ctor() ldtoken .this pop ret }
    .class nested public Nested { .method static void M() cil managed { ldtoken .nester pop ret } }
  }

  //#region ATTRIBUTES

  .class public abstract Attributes extends [mscorlib]System.Object
  {
    .class nested public A { }
    .class nested private B { }
    .class nested family C { }
    .class nested assembly D { }
    .class nested famandassem E { }
    .class nested famorassem F { }

    .field family initonly int32 a
    .field assembly notserialized int32 b
    .field famandassem int32 c
    .field famorassem int32 d
    .field privatescope int32 e
    .field public specialname rtspecialname int32 f
    .field method default void *() g
    .field method instance explicit void *(int32) h
    .field method vararg void *() i
    .field method unmanaged stdcall void *() j
    .field method unmanaged thiscall void *() k
    .field method unmanaged fastcall void *() l

    .method family hidebysig strict virtual instance void A() cil managed synchronized { ret }
    .method assembly static void B() cil managed nooptimization { ret }
    .method famandassem static void C() cil managed aggressiveinlining { ret }
    .method famorassem static void D() cil managed forwardref { ret }
    .method privatescope static void E() cil managed { ret }
    .method public static void F() runtime managed { }
    .method public static void G() cil managed internalcall { }
    .method public static unmanagedexp reqsecobj void H() cil managed { ret }
    .method public abstract virtual instance void I() cil managed { }
    .method public static default void J() cil managed { ret }
    .method public instance explicit void K() cil managed { ret }
    .method public static pinvokeimpl("kernel32.dll" nomangle ansi cdecl) void L() { }
    .method public static pinvokeimpl("kernel32.dll" unicode stdcall) void M() { }
    .method public static pinvokeimpl("kernel32.dll" autochar thiscall) void N() { }
    .method public static pinvokeimpl("kernel32.dll" fastcall bestfit:on charmaperror:off) void O() { }
    .method public static [out] int32 marshal(int32) P() cil managed { ret }

    .property specialname rtspecialname instance explicit int32 P() { }
    .property default int32 Q() { }
  }

  //#endregion

  .class public auto ansi beforefieldinit C`1<class (class [mscorlib]System.IDisposable) T, valuetype .ctor V>
         extends [mscorlib]System.Object
         implements class N.I`2<!0, int32>, [mscorlib]System.IDisposable
  {
    .custom instance void [mscorlib]System.ObsoleteAttribute::.ctor() = (01 00 00 00)
    .permission demand [mscorlib]System.Security.Permissions.SecurityPermissionAttribute
    .interfaceimpl type [mscorlib]System.IDisposable  // Before ".param type", otherwise ILASM hangs
    .custom instance void [mscorlib]System.ObsoleteAttribute::.ctor() = (01 00 00 00)
    .param type T
    .custom instance void [mscorlib]System.ObsoleteAttribute::.ctor() = (01 00 00 00)
    .param type [1]
    .override method instance !0 class N.I`2<!0, int32>::M<[1]>(!1) with method instance !0 class N.C`1<!T, !V>::M<[1]>(int32)
    .override [mscorlib]System.Object::Finalize with instance void N.C`1::Finalize()
    .class nested private auto ansi Inner
    {
    }

    //#region FIELDS

    .field private static literal int8 I1 = int8(1)
    .field private static literal int16 I2 = int16(1)
    .field private static literal int32 L = int32(-1)
    .field private static literal int64 I8 = int64(1)
    .field private static literal float32 F = float32(1.5)
    .field private static literal float32 FI = float32(1)
    .field private static literal float64 G = float64(0x7FF8000000000000)
    .field private static literal bool B = bool(false)
    .field private static literal char Ch = char(65)
    .field private static literal string Str = "a" + "b\t\"\\\101"
    .field private static literal string Bytes = bytearray (41 00)
    .field private static literal object Null = nullref
    .field private int32 modreq([mscorlib]System.Runtime.CompilerServices.IsVolatile) Flag
    .field private int32 modopt(class [mscorlib]System.Object) Opt
    .field private method unmanaged cdecl void *(int32) Pointer
    .field private int32[,...,0...,0...5,5] Array
    .field private typedref* Ref
    .field private value class N.S Value
    .field private valuetype N.S& Byref
    .field private class N.C`1/Inner Nested
    .field private !T Generic
    .field private !0 GenericIndex
    .field private int32 $a@b?c`d
    .field private int32 'it\'s'

    //#endregion

    //#region MEMBERS

    .method public hidebysig specialname rtspecialname instance void .ctor() cil managed
    {
      ret
    }
    .method private hidebysig specialname rtspecialname static void .cctor() cil managed
    {
      ret
    }
    .method family hidebysig virtual instance void Finalize() cil managed
    {
      ret
    }
    .method public hidebysig newslot virtual final instance !T M<V>(int32 u) cil managed
    {
      .override N.I`2::M
      .override method instance !0 class N.I`2<!0, int32>::M<[1]>(!1)
      .param [0]
      .param [1] = int32(5)
      ret
    }
    .method public hidebysig newslot virtual final instance void Dispose() cil managed noinlining
    {
      .permission demand [mscorlib]System.Security.Permissions.SecurityPermissionAttribute("Unrestricted" = true)
      .permissionset assert = (2E 00)
      ret
    }
    .method public static !!T G<class (class [mscorlib]System.IDisposable) T, valuetype .ctor U>(!!T a, !!U& b) cil managed
    {
      .param type U
      ret
    }
    .method public static pinvokeimpl("kernel32.dll" as "Beep" winapi lasterr) bool marshal(bool) Beep([in] uint32 marshal(int32) f, [in][out] int32& d, [opt] int32 o, [1] int32 p) cil managed preservesig
    {
    }
    .method public static vararg void V(int32 a) cil managed
    {
      ret
    }
    .method public specialname instance int32 get_P(int32 i) cil managed
    {
      ret
    }
    .method public specialname instance void add_E(class N.Handler h) cil managed
    {
      ret
    }
    .property instance int32 P(int32) = int32(5)
    {
      .custom instance void [mscorlib]System.ObsoleteAttribute::.ctor() = (01 00 00 00)
      .get instance int32 N.C`1::get_P(int32)
      .set instance int32 N.C`1::get_P(int32)
      .other instance int32 N.C`1::get_P(int32)
    }
    .event specialname rtspecialname N.Handler E
    {
      .addon instance void N.C`1::add_E(class N.Handler)
      .removeon instance void N.C`1::add_E(class N.Handler)
      .fire instance void N.C`1::add_E(class N.Handler)
      .other instance void N.C`1::add_E(class N.Handler)
    }
    .event class N.Handler E2
    {
      .addon instance void N.C`1::add_E(class N.Handler)
      .removeon instance void N.C`1::add_E(class N.Handler)
    }
    .event E3
    {
      .addon void Global()
      .removeon void Global()
    }

    //#endregion

    //#region INSTRUCTIONS

    .method public static int32 Main(string[] args, int32 n) cil managed
    {
      .entrypoint
      .maxstack 8
      .zeroinit
      .vtentry 1 : 1
      .export [1] as Exported
      .locals init ([0] int32 i, [1] int32& pinned p)
      .locals (string s)
      .line 1
      .line 1 'features.cs'
      .line 1:2
      .line 1:2 'features.cs'
      .line 1,2 : 3,4 'features.cs'
      #line 5 "features.cs"
      .emitbyte 0x00
      .custom instance void [mscorlib]System.ObsoleteAttribute::.ctor() = (01 00 00 00)
      .custom (method instance void N.C`1::Dispose()) instance void [mscorlib]System.ObsoleteAttribute::.ctor() = (01 00 00 00)
      .custom (field int32 N.C`1::Flag) instance void [mscorlib]System.ObsoleteAttribute::.ctor() = (01 00 00 00)
      .custom (method void Global()) instance void [mscorlib]System.ObsoleteAttribute::.ctor()
      .custom (field int32 Global) instance void [mscorlib]System.ObsoleteAttribute::.ctor()
      ;

      // No operand
      Start: 'Quoted label': nop break dup pop ret ldnull ldlen arglist localloc cpblk initblk refanytype ckfinite throw rethrow endfinally endfault endfilter
      ldarg.0 ldarg.1 ldarg.2 ldarg.3 ldloc.0 ldloc.1 ldloc.2 ldloc.3 stloc.0 stloc.1 stloc.2 stloc.3
      ldc.i4.0 ldc.i4.1 ldc.i4.2 ldc.i4.3 ldc.i4.4 ldc.i4.5 ldc.i4.6 ldc.i4.7 ldc.i4.8 ldc.i4.m1 ldc.i4.M1
      add add.ovf add.ovf.un sub sub.ovf sub.ovf.un mul mul.ovf mul.ovf.un div div.un rem rem.un neg
      and or xor not shl shr shr.un
      ceq cgt cgt.un clt clt.un
      conv.i conv.i1 conv.i2 conv.i4 conv.i8 conv.u conv.u1 conv.u2 conv.u4 conv.u8 conv.r4 conv.r8 conv.r.un
      conv.ovf.i conv.ovf.i1 conv.ovf.i2 conv.ovf.i4 conv.ovf.i8 conv.ovf.u conv.ovf.u1 conv.ovf.u2 conv.ovf.u4 conv.ovf.u8
      conv.ovf.i.un conv.ovf.i1.un conv.ovf.i2.un conv.ovf.i4.un conv.ovf.i8.un conv.ovf.u.un conv.ovf.u1.un conv.ovf.u2.un conv.ovf.u4.un conv.ovf.u8.un
      ldind.i ldind.i1 ldind.i2 ldind.i4 ldind.i8 ldind.u1 ldind.u2 ldind.u4 ldind.u8 ldind.r4 ldind.r8 ldind.ref
      stind.i stind.i1 stind.i2 stind.i4 stind.i8 stind.r4 stind.r8 stind.ref
      ldelem.i ldelem.i1 ldelem.i2 ldelem.i4 ldelem.i8 ldelem.u1 ldelem.u2 ldelem.u4 ldelem.u8 ldelem.r4 ldelem.r8 ldelem.ref
      stelem.i stelem.i1 stelem.i2 stelem.i4 stelem.i8 stelem.r4 stelem.r8 stelem.ref
      tail. volatile. readonly.

      // Arguments and locals
      ldarg n ldarg.s 1 ldarga n ldarga.s 1 starg n starg.s 1
      ldloc i ldloc.s 0 ldloca i ldloca.s 0 stloc i stloc.s 0

      // Constants
      ldc.i4 0x10 ldc.i4 0X1F ldc.i4 03423 ldc.i4.s -1 ldc.i8 -0x7FFFFFFFFFFFFFFF unaligned. 1
      ldc.r4 1 ldc.r8 1. ldc.r8 -0.2323 ldc.r8 3435.34E-5 ldc.r8 1e10 ldc.r8 (00 00 00 00 00 00 F8 7F) ldc.r4 float32(0x3F800000)
      ldstr "a" + "b\n" ldstr bytearray (41 00)

      // Methods
      call !!0 class N.C`1<class [mscorlib]System.IDisposable, valuetype N.S>::G<class [mscorlib]System.IDisposable, valuetype N.S>(!!0, !!1&)
      call vararg void N.C`1::V(int32, ..., int32)
      call void Global()
      callvirt instance void N.C`1::Dispose()
      newobj instance void class N.C`1<class [mscorlib]System.IDisposable, valuetype N.S>::.ctor()
      jmp void N.C`1::.cctor()
      ldftn void N.C`1::.cctor()
      ldvirtftn instance void N.C`1::Dispose()
      calli unmanaged stdcall int32(int32)
      calli vararg void(int32, ..., int32)

      // Fields
      ldfld int32 class N.C`1<!T, !V>::Flag
      ldflda int32 N.C`1::Flag
      stfld int32 N.C`1::Flag
      ldsfld int32 Global
      ldsflda int32 Global
      stsfld int32 Global

      // Types
      box N.S unbox valuetype N.S unbox.any !T castclass class N.C`1/Inner isinst [mscorlib]System.String
      initobj N.S ldobj N.S stobj N.S cpobj N.S sizeof N.S
      newarr int32[] ldelem !T ldelema N.S stelem !T ldelem.any !T stelem.any !T
      mkrefany N.S refanyval N.S
      constrained. !T
      ldtoken N.C`1 ldtoken method instance void N.C`1::Dispose() ldtoken field int32 N.C`1::Flag
      ldtoken method void Global() ldtoken field int32 Global ldtoken [mscorlib] ldtoken [.module kernel32.dll]

      // Branches
      br Start br.s 0 br 'Quoted label' leave Start leave.s 0
      brfalse Start brfalse.s 0 brnull Start brnull.s 0 brzero Start brzero.s 0
      brtrue Start brtrue.s 0 brinst Start brinst.s 0
      beq Start beq.s 0 bne.un Start bne.un.s 0
      bge Start bge.s 0 bge.un Start bge.un.s 0 bgt Start bgt.s 0 bgt.un Start bgt.un.s 0
      ble Start ble.s 0 ble.un Start ble.un.s 0 blt Start blt.s 0 blt.un Start blt.un.s 0
      switch (Start, 0) switch ()

      // Exception handling
      .try
      {
        {
        }
      }
      catch [mscorlib]System.Exception
      {
      }
      .try
      {
      }
      filter
      {
        endfilter
      }
      {
      }
      .try
      {
      }
      finally
      {
      }
      .try
      {
      }
      fault
      {
      }
      Try: nop
      Filter: endfilter
      Handler: nop
      End:
      .try Try to Filter catch [mscorlib]System.Exception handler Handler to End
      .try Try to Filter filter Filter handler Handler to End
      .try Try to Filter finally handler Handler to End
      .try Try to Filter fault handler Handler to End
    }
    .method public static void Offsets() cil managed
    {
      nop
      endfilter
      nop
      ret
      .try 0 to 1 catch [mscorlib]System.Exception handler 1 to 3
      .try 0 to 1 filter 1 handler 3 to 4
    }

    //#endregion
  }
}

//#endregion
