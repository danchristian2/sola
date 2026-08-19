export interface StoredFile {
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface FileStorage {
  save(input: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }): Promise<StoredFile>;
  delete(key: string): Promise<void>;
}
