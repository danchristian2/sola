import fs from "node:fs/promises";
import path from "node:path";
import { randomToken } from "../utils/crypto.js";
import type { FileStorage, StoredFile } from "./FileStorage.js";

export class LocalFileStorage implements FileStorage {
  constructor(private readonly rootDir: string) {}

  async save(input: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }): Promise<StoredFile> {
    await fs.mkdir(this.rootDir, { recursive: true });
    const safeName = path.basename(input.filename).replace(/[^\w.\-]+/g, "_");
    const key = `${Date.now()}-${randomToken(8)}-${safeName}`;
    const fullPath = path.join(this.rootDir, key);
    await fs.writeFile(fullPath, input.buffer);
    return {
      key,
      url: `/uploads/${key}`,
      mimeType: input.mimeType,
      size: input.buffer.length
    };
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.join(this.rootDir, path.basename(key));
    await fs.rm(fullPath, { force: true });
  }
}

export function createFileStorage(provider: "local", rootDir: string): FileStorage {
  if (provider !== "local") {
    throw new Error(`Unsupported file storage provider: ${provider}`);
  }
  return new LocalFileStorage(rootDir);
}
