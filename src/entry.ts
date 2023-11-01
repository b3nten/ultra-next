import { createUltra, Ultra } from "./createUltra.ts";
import { debounce, defu } from "../deps.ts";
import { server as ultra_server } from "./ultra.ts";
import { UltraServer } from "./server.ts";
import {
  htmlMiddleware,
  staticMiddleware,
  ultraDirStaticMiddleware,
  vfsMiddleware,
} from "./middleware/middleware.ts";
import { writeTextFileRecursively } from "./fs.ts";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown> ? DeepPartial<T[P]>
    : T[P];
};
type UserConfig = DeepPartial<Ultra>;

export async function main(config?: UserConfig) {
  // Merge default config with user config
  const _ultra = createUltra({ mode: "dev" });
  const ultra = defu(config, _ultra) as Ultra;

  // Register custom modules
  for (const module of ultra.modules) {
    const mod = module();
    ultra[mod.name] = module();
    await mod.setup(ultra);
  }

  await ultra.hooks.call("ultra:addDefaultMiddleware");
  ultra.defaults.middleware.html && ultra.middleware.unshift({
    path: "*",
    handler: htmlMiddleware(ultra),
  });
  if (ultra.defaults.middleware.static) {
    ultra.middleware = [{
      path: "*",
      handler: staticMiddleware(ultra),
    }, {
      path: "*",
      handler: ultraDirStaticMiddleware(ultra),
    }, {
      path: "*",
      handler: vfsMiddleware(ultra),
    }, ...ultra.middleware];
  }

  // Create .ultra directory, write ultra.js
  await Deno.mkdir(ultra.dir, { recursive: true });
  await Deno.writeTextFile(ultra.dir + "/ultra.js", ultra_server);
  await ultra.hooks.call("ultra:create");

  // Write vfs to file system
  async function writeVFS() {
    for (const file of ultra.vfs) {
      if (!file.write) continue;
      await writeTextFileRecursively(
        ultra.dir + "/" + file.path,
        file.open() ?? "",
      );
    }
    await ultra.hooks.call("ultra:writeVFS");
  }
  await writeVFS();

  // Create server
  const server = new UltraServer(ultra);
  server.serve(ultra.middleware, ultra.handlers);

  await ultra.hooks.call("ultra:startServer");

  if (ultra.mode === "dev") {
    const rebuilder = debounce(async () => {
      await ultra.hooks.call("ultra:rebuild");
      await writeVFS();
      server.serve(ultra.middleware, ultra.handlers);
    }, 50);
    await ultra.hooks.call("ultra:devServer");
    for await (const event of Deno.watchFs("./")) {
      event.paths.every((p) => !p.includes(ultra.dir)) && rebuilder();
    }
  } else {
    // build complete hook.
    ultra.hooks.call("ultra:exit");
  }
}
