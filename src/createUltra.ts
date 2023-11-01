import { Compiler } from "./compiler.ts";
import { Hooks } from "./hooks.ts";
import { UltraModule } from "./modules.ts";
import { Handler, Middleware } from "./server.ts";
import { UltraVFS, VFile } from "./vfs.ts";

type UltraHooks = {
  "ultra:create": undefined;
  "ultra:writeVFS": undefined;
  "ultra:startServer": undefined;
  "ultra:rebuild": undefined;
  "ultra:addMiddlewares": undefined;
  "ultra:addHandlers": undefined;
  "ultra:exit": undefined;
  "ultra:devServer": undefined;
}

export type Ultra = {
  mode: "dev" | "prod";
  port: number;
  devport: number;
  vfs: UltraVFS;
	dir: string;
  modules: Array<() => UltraModule>;
  hooks: Hooks<UltraHooks>;
  handlers: Array<Handler>;
  middleware: Array<Middleware>;
  compiler: {
    directories: Array<string>;
    compilers: Array<Compiler>;
  }
  defaults: {
    middleware: {
      static: boolean;
      html: boolean;
      compiler: boolean;
    },
    compiler: boolean;
  }
} & {
  [key: string]: any;
}

export function createUltra(config: {
  mode?: Ultra["mode"];
	dir?: string;
}): Ultra {
  return {
    mode: config.mode ?? "dev",
    port: 8000,
    devport: 8000,
		vfs: new UltraVFS(),
		dir: `./${config.dir ?? ".ultra"}`,
    modules: [],
    hooks: new Hooks(),
    handlers: [],
    middleware: [],
    compiler: {
      directories: ["/client"],
      compilers: [],
    },
    defaults: {
      middleware: {
        static: true,
        html: true,
        compiler: true,
      },
      compiler: true,
    }
  };
}
