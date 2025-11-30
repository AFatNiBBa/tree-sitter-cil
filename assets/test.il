
//  Microsoft (R) .NET Framework IL Disassembler.  Version 4.8.3928.0
//  Copyright (c) Microsoft Corporation. Tutti i diritti riservati.



// Metadata version: v4.0.30319
.assembly extern System.Runtime
{
  .publickeytoken = (B0 3F 5F 7F 11 D5 0A 3A )                         // .?_....:
  .ver 8:0:0:0
}
.assembly A
{
  .custom instance void [System.Runtime]System.Runtime.CompilerServices.CompilationRelaxationsAttribute::.ctor(int32) = ( 01 00 08 00 00 00 00 00 ) 
  .custom instance void [System.Runtime]System.Runtime.CompilerServices.RuntimeCompatibilityAttribute::.ctor() = ( 01 00 01 00 54 02 16 57 72 61 70 4E 6F 6E 45 78   // ....T..WrapNonEx
                                                                                                                   63 65 70 74 69 6F 6E 54 68 72 6F 77 73 01 )       // ceptionThrows.

  // --- The following custom attribute is added automatically, do not uncomment -------
  //  .custom instance void [System.Runtime]System.Diagnostics.DebuggableAttribute::.ctor(valuetype [System.Runtime]System.Diagnostics.DebuggableAttribute/DebuggingModes) = ( 01 00 07 01 00 00 00 00 ) 

  .custom instance void [System.Runtime]System.Runtime.Versioning.TargetFrameworkAttribute::.ctor(string) = ( 01 00 18 2E 4E 45 54 43 6F 72 65 41 70 70 2C 56   // ....NETCoreApp,V
                                                                                                              65 72 73 69 6F 6E 3D 76 38 2E 30 01 00 54 0E 14   // ersion=v8.0..T..
                                                                                                              46 72 61 6D 65 77 6F 72 6B 44 69 73 70 6C 61 79   // FrameworkDisplay
                                                                                                              4E 61 6D 65 08 2E 4E 45 54 20 38 2E 30 )          // Name..NET 8.0
  .custom instance void [System.Runtime]System.Reflection.AssemblyCompanyAttribute::.ctor(string) = ( 01 00 01 41 00 00 )                               // ...A..
  .custom instance void [System.Runtime]System.Reflection.AssemblyConfigurationAttribute::.ctor(string) = ( 01 00 05 44 65 62 75 67 00 00 )                   // ...Debug..
  .custom instance void [System.Runtime]System.Reflection.AssemblyFileVersionAttribute::.ctor(string) = ( 01 00 07 31 2E 30 2E 30 2E 30 00 00 )             // ...1.0.0.0..
  .custom instance void [System.Runtime]System.Reflection.AssemblyInformationalVersionAttribute::.ctor(string) = ( 01 00 05 31 2E 30 2E 30 00 00 )                   // ...1.0.0..
  .custom instance void [System.Runtime]System.Reflection.AssemblyProductAttribute::.ctor(string) = ( 01 00 01 41 00 00 )                               // ...A..
  .custom instance void [System.Runtime]System.Reflection.AssemblyTitleAttribute::.ctor(string) = ( 01 00 01 41 00 00 )                               // ...A..
  .hash algorithm 0x00008004
  .ver 1:0:0:0
}
.module A.dll
// MVID: {FC119553-7646-45A7-97C0-D88961C3B8F6}
.custom instance void [System.Runtime]System.Runtime.CompilerServices.RefSafetyRulesAttribute::.ctor(int32) = ( 01 00 0B 00 00 00 00 00 ) 
.imagebase 0x00400000
.file alignment 0x00000200
.stackreserve 0x00100000
.subsystem 0x0003       // WINDOWS_CUI
.corflags 0x00000001    //  ILONLY
// Image base: 0x00000229C07D0000


// =============== CLASS MEMBERS DECLARATION ===================

.class private auto ansi beforefieldinit Program
       extends [System.Runtime]System.Object
{
  .custom instance void [System.Runtime]System.Runtime.CompilerServices.CompilerGeneratedAttribute::.ctor() = ( 01 00 00 00 ) 
  .method private hidebysig static void  '<Main>$'(string[] args) cil managed
  {
    .entrypoint
    // Code size       9 (0x9)
    .maxstack  2
    .locals init (char V_0,
             char V_1)
    IL_0000:  ldc.i4.s   97
    IL_0002:  stloc.0
    IL_0003:  ldloc.0
    IL_0004:  ldc.i4.1
    IL_0005:  add
    IL_0006:  conv.u2
    IL_0007:  stloc.1
    IL_0008:  ret
  } // end of method Program::'<Main>$'

  .method public hidebysig specialname rtspecialname 
          instance void  .ctor() cil managed
  {
    // Code size       8 (0x8)
    .maxstack  8
    IL_0000:  ldarg.0
    IL_0001:  call       instance void [System.Runtime]System.Object::.ctor()
    IL_0006:  nop
    IL_0007:  ret
  } // end of method Program::.ctor

} // end of class Program

.class public auto ansi beforefieldinit 'AProgramΣ'
       
{
  .method public hidebysig specialname rtspecialname 
          instance void  .ctor(int32 ' b c') cil managed
  {
    // Code size       8 (0x8)
    .maxstack  8
    IL_0000:  ldarg.0
    IL_0001:  call       instance void [System.Runtime]System.Object::.ctor()
    IL_0006:  nop
    IL_0007:  ret
  } // end of method 'AProgramΣ'::.ctor

} // end of class 'AProgramΣ'

.class public sequential ansi sealed beforefieldinit B
       extends [System.Runtime]System.ValueType
{
  .pack 0
  .size 1
  .class sequential ansi sealed nested private beforefieldinit BC
         extends [System.Runtime]System.ValueType
  {
    .pack 0
    .size 1
  } // end of class BC

  .class sequential ansi sealed nested assembly beforefieldinit BCa
         extends [System.Runtime]System.ValueType
  {
    .pack 0
    .size 1
  } // end of class BCa

  .class auto ansi nested public beforefieldinit BD
         extends 'AProgramΣ'
  {
    .method public hidebysig specialname rtspecialname 
            instance void  .ctor() cil managed
    {
      // Code size       8 (0x8)
      .maxstack  8
      .locals init (int32[6...,,...,0...9])
      br 'IL_ 0001'
      IL_0000:  ldarg.0
      'IL_ 0001':  call       instance void 'AProgramΣ'::.ctor(int32 f)
      IL_0006:  nop
      IL_0007:  ret
    } // end of method BD::.ctor

  } // end of class BD

} // end of class B

.class interface private abstract auto ansi beforefieldinit I
{
} // end of class I


// =============================================================

// *********** DISASSEMBLY COMPLETE ***********************
// AVVISO: creato file di risorse Win32 a.res.
