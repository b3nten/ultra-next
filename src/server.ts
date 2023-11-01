import { type HonoHandler, Hono, HonoMiddlewareHandler } from "../deps.ts";
import { Ultra } from "./createUltra.ts";

export type Handler = {
  method: "get" | "post" | "put" | "delete" | "patch" | "all"
  path: string;
  handler: HonoHandler;
};

export type Middleware = {
  path: string;
  handler: HonoMiddlewareHandler;
};

export class UltraServer {
  constructor(ultra: Ultra) {
    this.ultra = ultra;
  }

  ultra: Ultra;

  abortController?: AbortController;
  server?: Deno.Server;

  hono?: Hono;

  serve = async (middlewares: Middleware[], handlers: Handler[]) => {
    this.hono = new Hono();
    for (const middleware of middlewares) {
      this.hono.use(middleware.path, middleware.handler);
    }
    for (const handler of handlers) {
			this.hono[handler.method](handler.path, handler.handler);
    }
    if (this.abortController) this.abortController.abort();
		await this.server?.finished
    this.abortController = new AbortController();
    this.server = Deno.serve({
      port: this.ultra.port,
      signal: this.abortController.signal,
    }, this.hono.fetch);
  }
}
