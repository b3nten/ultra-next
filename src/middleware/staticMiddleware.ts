import { Context, Next } from "../../deps.ts";
import { getFilePath } from "./filepath.ts";
import { getMimeType } from "../mimetypes.ts";
import { MiddlewareFactory } from "./middleware.ts";

export const staticMiddleware: MiddlewareFactory =
  (ultra) => async (context, next) => {
    if (context.finalized) {
      await next();
      return;
    }

    const url = new URL(context.req.url);
    const filename = decodeURI(url.pathname);
    let path = getFilePath({
      filename,
      root: "static",
    });
    if (!path) return await next();
    const potentialFilePaths = [
      `./${path}`,
      `./${path}` + ".html",
      "./.ultra/" + path,
      "./.ultra/" + path + ".html",
    ];
    path = `./${path}`;

    let file;

    for (const potentialFilePath of potentialFilePaths) {
      try {
        file = await Deno.open(potentialFilePath);
        break;
      } catch (e) {
        //
      }
    }

    if (!file) {
      for (const potentialFilePath of potentialFilePaths) {
        if (ultra.vfs.has(potentialFilePath)) {
          file = ultra.vfs.get(potentialFilePath)?.open();
          break;
        }
      }
    }

    if (file) {
      const mimeType = getMimeType(path);
      if (mimeType) {
        context.header("Content-Type", mimeType);
      }
      // Return Response object with stream
      return context.body(typeof file === "string" ? file : file.readable);
    } else {
      await next();
    }

    return;
  };

export type ServeStaticOptions = {
  root?: string;
  path?: string;
  rewriteRequestPath?: (path: string) => string;
};

function serveStatic(options: ServeStaticOptions = { root: "" }) {
  return async (c: Context, next: Next) => {
    // Do nothing if Response is already set
    if (c.finalized) {
      await next();
      return;
    }

    const url = new URL(c.req.url);

    const filename = options.path ?? decodeURI(url.pathname);
    let path = getFilePath({
      filename: options.rewriteRequestPath
        ? options.rewriteRequestPath(filename)
        : filename,
      root: options.root,
    });

    console.log(path);

    if (!path) return await next();

    path = `./${path}`;

    let file;

    try {
      file = await Deno.open(path);
    } catch (e) {
      //
    }

    if (file) {
      const mimeType = getMimeType(path);
      if (mimeType) {
        c.header("Content-Type", mimeType);
      }
      // Return Response object with stream
      return c.body(file.readable);
    } else {
      await next();
    }
    return;
  };
}
