import { HonoMiddlewareHandler, path } from "../../deps.ts";
import { Ultra } from "../createUltra.ts";
import { getMimeType } from "../mimetypes.ts";

export const compilerMiddleware: (ultra: Ultra) => HonoMiddlewareHandler =
  (ultra: Ultra) => async (context, next) => {
    const method = context.req.method;
    if (method !== "GET") return next();

    const requestPathname = decodeURIComponent(
      new URL(context.req.url).pathname,
    );

    const pathname = requestPathname.replace(
      `${ultra.compiler.directories[0]}/`,
      "",
    );

    const isRemoteSource = pathname.startsWith("https://") ||
      pathname.startsWith("http://");
    const reqpath = !isRemoteSource
      ? path.join(Deno.cwd() + "/client/", pathname)
      : pathname;
    const url = !isRemoteSource ? path.toFileUrl(reqpath) : new URL(pathname);
    const compiler = ultra.compiler.compilers.find((compiler) =>
      compiler.supports(reqpath)
    );
    if (!compiler) return next();
    const file = await fetch(url).then((res) => res.text()).catch(() => {});
    if (!file) return next();
    const transpiled = await compiler.transpile(file);
    return new Response(transpiled.content, {
      headers: {
        "Content-Type": getMimeType(transpiled.extension) ?? "js",
      },
    });
  };
