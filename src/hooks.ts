type Hook = string;
type HookFn = () => Promise<void>;

export class Hooks<T extends Record<Hook, any>> {
  hooks = new Map<Hook, Set<HookFn>>();

  add = (hook: keyof T, fn: HookFn) => {
    this.hooks.has(hook) || this.hooks.set(hook, new Set());
    this.hooks.get(hook)?.add(fn);
  };
  call = async (hook: keyof T | string & {}, ...args: any[]) => {
    for (const fn of this.hooks.get(hook) ?? []) await fn(...args);
  };
}
