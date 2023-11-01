import { HonoMiddlewareHandler } from "../../deps.ts";
import { Ultra } from "../createUltra.ts";

export const compilerMiddleware: (ultra: Ultra) => HonoMiddlewareHandler =
  (ultra: Ultra) => async (context, next) => {
    await next();
    if (context.res.headers.get("content-type")?.includes("text/html")) {
      // inject import map and ultra script into head
    }
  };