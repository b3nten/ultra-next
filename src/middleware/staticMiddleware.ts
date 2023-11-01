import { Context, Next } from "../../deps.ts";
import { getFilePath } from "./filepath.ts";
import { getMimeType } from "../mimetypes.ts";
import { MiddlewareFactory } from "./middleware.ts";

const DEFAULT_DOCUMENT = "index.html";
const { open } = Deno;

export const staticMiddleware: MiddlewareFactory = (ultra) =>
  serveStatic({
    path: "./static",
  });

export const vfsMiddleware: MiddlewareFactory =
  (ultra) => async (context, next) => {
    const pathname = new URL(context.req.url).pathname;
    const filename = pathname === "/" ? "/static/index.html" : "/static" + pathname;
    const potentialVFile = ultra.vfs.get(filename)
    const content = potentialVFile?.open();
    if (potentialVFile && content) {
      context.header("Content-Type", getMimeType(potentialVFile.path));
      return context.body(content);
    }
    return await next();
  };

export const ultraDirStaticMiddleware: MiddlewareFactory = (ultra) =>
  serveStatic({
    path: ultra.dir + "/static",
  });

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
      defaultDocument: DEFAULT_DOCUMENT,
    });

    if (!path) return await next();

    path = `./${path}`;

    let file;

    try {
      file = await open(path);
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
