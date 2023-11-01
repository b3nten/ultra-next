import { Ultra } from "./createUltra.ts";

export function defineModule(config: UltraModule){
	return () => config;
}

export type UltraModule = {
  name: string;
  description?: string;
  version?: string;
  setup: (ultra: Ultra) => Promise<void>;
}