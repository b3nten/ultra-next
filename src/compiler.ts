import { path } from "../deps.ts";
import esbuild from "npm:esbuild";
import { Ultra } from "./createUltra.ts";

export type Bundle = {
  path: string;
  content: string;
};

export type Transpile = {
  content: string;
  extension: string;
}

export interface Compiler {
  supports(filepath: string): boolean;
  bundle(filepath: string): Promise<Bundle[]>;
  transpile(code: string): Promise<Transpile>;
}

export class UltraCompiler implements Compiler {

  constructor(ultra: Ultra) {
    this.ultra = ultra;
  }

  ultra: Ultra;

  supports = (filepath: string) => {
    return [".ts", ".tsx", ".js", ".jsx"].includes(path.extname(filepath));
  };
  async bundle(filepath: string) {
    const result = await esbuild.build({
      bundle: true,
      splitting: true,
      entryPoints: [filepath],
      loader: {
        "tsx": "tsx",
        "ts": "ts",
      },
      write: false,
    });
    return result.outputFiles.map((file): Bundle => ({
      path: file.path,
      content: file.text,
    }));
  }
  async transpile(code: string) {
    const result = await esbuild.transform(code, {
      loader: "tsx",
    });
    return {
      content: result.code,
      extension: ".js",
    }
  }
}
