import { type HonoMiddlewareHandler } from "../../deps.ts";
import { type Ultra } from "../createUltra.ts";

export { staticMiddleware, ultraDirStaticMiddleware, vfsMiddleware } from "./staticMiddleware.ts"
export { compilerMiddleware } from "./compilerMiddleware.ts"

export type MiddlewareFactory = (ultra: Ultra) => HonoMiddlewareHandler;

export const headerMiddleware: (ultra: Ultra) => HonoMiddlewareHandler =
  (ultra: Ultra) => async (context, next) => {
    await next();
    context.header("x-ultra-version", "ultra-3");
  };

export const htmlMiddleware: (ultra: Ultra) => HonoMiddlewareHandler =
  (ultra: Ultra) => async (context, next) => {
    await next();
    if (context.res.headers.get("content-type")?.includes("text/html")) {
      // inject import map and ultra script into head
    }
  };

