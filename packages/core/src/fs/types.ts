export interface FileStat {
  name: string;
  type: 'file' | 'directory';
  size: number;
  createdAt: Date;
  updatedAt: Date;
  mimeType?: string;
}

export interface FileInfo extends FileStat {
  path: string;
}

export interface FileSystem {
  read(path: string): Promise<Uint8Array>;
  readText(path: string): Promise<string>;
  write(path: string, data: Uint8Array | string): Promise<void>;
  list(path: string): Promise<FileInfo[]>;
  mkdir(path: string): Promise<void>;
  remove(path: string, recursive?: boolean): Promise<void>;
  exists(path: string): Promise<boolean>;
  stat(path: string): Promise<FileStat>;
}
