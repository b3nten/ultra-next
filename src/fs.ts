import { path } from "../deps.ts";


export function readTextFileSafe(filepath: string){
	try{
		return Deno.readTextFile(filepath)
	} catch {
		return null;
	}
}
export async function writeTextFileRecursively(filepath: string, contents: string){
	await Deno.mkdir(path.dirname(filepath), { recursive: true });
	await Deno.writeTextFile(filepath, contents);
}