// juli.ts — JuliJS Runtime Library
// @module julijs
// @title JuliJS Runtime
// @description DSL-extensible runtime for Julk-compiled JSON

// --- 📦 Types & Interfaces ---

/**
 * A native function callable from Julk.
 */
export type NativeFn = () => void;

/**
 * A compiled instruction from Julk code.
 */
export interface JulkCall {
  type: string;
  name: string;
  args?: Record<string, unknown>;
  code?: number;
}

/**
 * Represents an exported Julk module.
 */
export interface JuliModule {
  functions: Record<string, NativeFn>;
  script: string;
}

// --- 🧱 Module Class ---

/**
 * The core module class used to define Julk functions and scripts.
 */
export class Module {
  functions: Record<string, NativeFn> = {};
  script: string = "";

  /**
   * Define a callable function for the module.
   */
  function(name: string, fn: NativeFn) {
    this.functions[name] = fn;
  }

  /**
   * Inject native code — typically Julk macros or shorthand.
   */
  nativeFn(code: string) {
    if (code.includes("println(")) {
      const content = code.match(/println\((.*?)\)/)?.[1];
      if (content) console.log(content.replace(/["']/g, ""));
    }
  }

  /**
   * Run a function by name from the module.
   */
  run(name: string) {
    const fn = this.functions[name];
    if (fn) fn();
    else console.warn(`[JuliJS] Unknown function: ${name}`);
  }

  /**
   * Export this module’s script and function registry.
   */
  export(): JuliModule {
    return {
      functions: this.functions,
      script: this.script
    };
  }
}

// --- 🌐 Global Runtime State ---

const __julkModules__: Record<string, JuliModule> = {};
let currentModule: Module | null = null;

// --- 🔧 Runtime Registration API ---

/**
 * Register a new module instance as the current working module.
 */
export function module(mod: Module): void {
  currentModule = mod;
}

/**
 * Define initialization logic for the module.
 */
export function init(mod: Module, fn: () => void): void {
  currentModule = mod;
  fn();
}

/**
 * Define a Julk source script to be attached to the module.
 */
export function jscript(fn: () => string): void {
  if (currentModule) {
    currentModule.script = fn().trim();
  }
}

/**
 * Export a module under a given name.
 */
export function exportJulk(fn: () => void, name: string): void {
  fn();
  if (currentModule) {
    __julkModules__[name] = currentModule.export();
  }
}

// --- 🔁 Runtime Utilities ---

/**
 * Import a registered Julk module by name.
 */
export function jimport(name: string): JuliModule | undefined {
  return __julkModules__[name];
}

/**
 * Call a function from a registered module.
 */
export function jcall(moduleName: string, fnName: string): void {
  const mod = jimport(moduleName);
  mod?.functions[fnName]?.();
}

/**
 * Exit the JuliJS process (via Deno).
 */
export function jexit(code: number = 0): never {
  console.log(`[JuliJS] Exiting with code ${code}`);
  Deno.exit(code);
}

// --- 🧪 Execution Engine ---

/**
 * Run a compiled Julk JSON program.
 */
export function runJulkJSON(program: JulkCall[]): void {
  for (const instr of program) {
    switch (instr.type) {
      case "call": {
        const [modName, fnName] = instr.name.split(".");
        jcall(modName, fnName);
        break;
      }
      case "jexit": {
        jexit(instr.code ?? 0);
      }
      default: {
        console.warn(`[JuliJS] Unknown instruction: ${instr.type}`);
      }
    }
  }
}
