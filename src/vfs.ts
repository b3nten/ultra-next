export type VFileConstructor = {
  path: string;
  name?: string;
  write?: boolean;
  contents?: string | (() => string);
}

export class VFile {
  constructor(file: VFileConstructor) {
    if (!file.path) throw new Error("File must have a path");
    if (!file.name) file.name = file.path;
    this.path = file.path;
    this.name = file.name;
    this.write = file.write;
    this.contents = file.contents;
  }
  path: string;
  name?: string;
  write?: boolean;
  contents?: string | (() => string);
  open = () => {
    if (typeof this.contents === "string") return this.contents;
    return this.contents?.();
  };
}

export class UltraVFS {
  files = new Map<string, VFile>();
  add = (file: VFileConstructor): void => {
    if(file instanceof VFile){
      this.files.set(file.path, file);
      return;
    } 
    if (!file.path) throw new Error("File must have a path");
    if (!file.name) file.name = file.path;
    this.files.set(file.path, new VFile(file));
  };
  get = (path: string): VFile | undefined => {
    return this.files.get(path);
  };
  delete = (path: string): void => {
    this.files.delete(path);
  };
  has = (path: string): boolean => {
    return this.files.has(path);
  };
  [Symbol.iterator](): IterableIterator<VFile> {
    return this.files.values();
  }
}
