import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { FileSystem, FileInfo, FileStat } from './types';

interface HmacDB extends DBSchema {
  files: {
    key: string; // path
    value: {
      path: string;
      name: string;
      type: 'file' | 'directory';
      content?: Uint8Array; // Only for files
      mimeType?: string;
      size: number;
      createdAt: Date;
      updatedAt: Date;
      parentPath?: string; // Added for indexing
    };
    indexes: { 'by-parent': string }; // Parent directory path
  };
}

const DB_NAME = 'hmac-fs';
const DB_VERSION = 1;

class IDBFileSystem implements FileSystem {
  private dbPromise: Promise<IDBPDatabase<HmacDB>>;

  constructor() {
    this.dbPromise = openDB<HmacDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('files', { keyPath: 'path' });
        store.createIndex('by-parent', 'parentPath');
      },
    });
  }

  private getParentPath(path: string): string {
    if (path === '/') return '/';
    const parts = path.split('/');
    parts.pop();
    return parts.join('/') || '/';
  }

  private normalizePath(path: string): string {
    if (!path.startsWith('/')) path = '/' + path;
    if (path.endsWith('/') && path !== '/') path = path.slice(0, -1);
    return path;
  }

  async init() {
    const db = await this.dbPromise;
    // Ensure root exists
    const root = await db.get('files', '/');
    if (!root) {
      await db.put('files', {
        path: '/',
        name: '',
        type: 'directory',
        size: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  async read(path: string): Promise<Uint8Array> {
    const db = await this.dbPromise;
    const file = await db.get('files', this.normalizePath(path));
    if (!file || file.type !== 'file') throw new Error(`File not found: ${path}`);
    return file.content || new Uint8Array();
  }

  async readText(path: string): Promise<string> {
    const content = await this.read(path);
    return new TextDecoder().decode(content);
  }

  async write(path: string, data: Uint8Array | string): Promise<void> {
    const db = await this.dbPromise;
    const normalizedPath = this.normalizePath(path);
    const parentPath = this.getParentPath(normalizedPath);
    const name = normalizedPath.split('/').pop() || '';

    // Check parent exists
    const parent = await db.get('files', parentPath);
    if (!parent || parent.type !== 'directory') {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }

    const content = typeof data === 'string' ? new TextEncoder().encode(data) : data;

    await db.put('files', {
      path: normalizedPath,
      name,
      type: 'file',
      content,
      size: content.length,
      createdAt: new Date(), // Should preserve if exists, simplified for now
      updatedAt: new Date(),
      parentPath,
    });
  }

  async list(path: string): Promise<FileInfo[]> {
    const db = await this.dbPromise;
    const normalizedPath = this.normalizePath(path);
    const files = await db.getAllFromIndex('files', 'by-parent', normalizedPath);
    return files.map(f => ({
      path: f.path,
      name: f.name,
      type: f.type,
      size: f.size,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      mimeType: f.mimeType
    }));
  }

  async mkdir(path: string): Promise<void> {
    const db = await this.dbPromise;
    const normalizedPath = this.normalizePath(path);
    const parentPath = this.getParentPath(normalizedPath);
    const name = normalizedPath.split('/').pop() || '';

    // Check parent exists
    const parent = await db.get('files', parentPath);
    if (!parent || parent.type !== 'directory') {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }

    await db.put('files', {
      path: normalizedPath,
      name,
      type: 'directory',
      size: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentPath,
    });
  }

  async remove(path: string, recursive: boolean = false): Promise<void> {
    const db = await this.dbPromise;
    const normalizedPath = this.normalizePath(path);
    
    const file = await db.get('files', normalizedPath);
    if (!file) return;

    if (file.type === 'directory') {
      const children = await this.list(normalizedPath);
      if (children.length > 0) {
        if (!recursive) throw new Error('Directory not empty');
        for (const child of children) {
          await this.remove(child.path, true);
        }
      }
    }

    await db.delete('files', normalizedPath);
  }

  async exists(path: string): Promise<boolean> {
    const db = await this.dbPromise;
    const file = await db.get('files', this.normalizePath(path));
    return !!file;
  }

  async stat(path: string): Promise<FileStat> {
    const db = await this.dbPromise;
    const file = await db.get('files', this.normalizePath(path));
    if (!file) throw new Error(`File not found: ${path}`);
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      mimeType: file.mimeType
    };
  }
}

export const fs = new IDBFileSystem();
