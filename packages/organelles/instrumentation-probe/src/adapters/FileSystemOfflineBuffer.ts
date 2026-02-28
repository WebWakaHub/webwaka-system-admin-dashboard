/**
 * ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
 * FileSystem Offline Buffer Adapter (Node.js Environment)
 *
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: webwaka-organelle-universe#480 (P3-T02)
 *
 * Implements IOfflineBufferPort for Node.js environments using filesystem.
 * Supports Nigeria First / Offline First doctrines.
 */

import { IOfflineBufferPort } from '../ports';
import { BufferEntry } from '../types';
import { BufferOverflowError } from '../errors';
import * as fs from 'fs';
import * as path from 'path';

export class FileSystemOfflineBuffer implements IOfflineBufferPort {
  private maxSize: number;
  private readonly bufferDir: string;

  constructor(bufferDir: string, maxSize: number = 10 * 1024 * 1024) {
    this.bufferDir = bufferDir;
    this.maxSize = maxSize;

    // Ensure buffer directory exists
    if (!fs.existsSync(this.bufferDir)) {
      fs.mkdirSync(this.bufferDir, { recursive: true });
    }
  }

  async append(entry: BufferEntry): Promise<void> {
    const serialized = JSON.stringify(entry);
    const entrySize = Buffer.byteLength(serialized, 'utf-8');
    const currentSize = await this.getByteSize();

    if (currentSize + entrySize > this.maxSize) {
      await this.evictOldest(entrySize);
      const newSize = await this.getByteSize();
      if (newSize + entrySize > this.maxSize) {
        throw new BufferOverflowError(newSize + entrySize, this.maxSize);
      }
    }

    const filename = `${entry.timestamp}_${Math.random().toString(36).slice(2, 8)}.json`;
    const filepath = path.join(this.bufferDir, filename);
    await fs.promises.writeFile(filepath, serialized, 'utf-8');
  }

  async flush(batchSize: number): Promise<BufferEntry[]> {
    const files = await this.getOrderedFiles();
    const toFlush = files.slice(0, batchSize);
    const entries: BufferEntry[] = [];

    for (const file of toFlush) {
      const filepath = path.join(this.bufferDir, file);
      const content = await fs.promises.readFile(filepath, 'utf-8');
      entries.push(JSON.parse(content));
      await fs.promises.unlink(filepath);
    }

    return entries;
  }

  async getSize(): Promise<number> {
    const files = await fs.promises.readdir(this.bufferDir);
    return files.filter(f => f.endsWith('.json')).length;
  }

  async getByteSize(): Promise<number> {
    const files = await fs.promises.readdir(this.bufferDir);
    let totalSize = 0;

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const stat = await fs.promises.stat(path.join(this.bufferDir, file));
      totalSize += stat.size;
    }

    return totalSize;
  }

  async clear(): Promise<void> {
    const files = await fs.promises.readdir(this.bufferDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.promises.unlink(path.join(this.bufferDir, file));
      }
    }
  }

  setMaxSize(bytes: number): void {
    this.maxSize = bytes;
    // Trigger eviction if over limit
    this.getByteSize().then(currentSize => {
      if (currentSize > this.maxSize) {
        this.evictOldest(0).catch(() => {});
      }
    });
  }

  private async getOrderedFiles(): Promise<string[]> {
    const files = await fs.promises.readdir(this.bufferDir);
    return files
      .filter(f => f.endsWith('.json'))
      .sort(); // Timestamp prefix ensures chronological order
  }

  private async evictOldest(bytesNeeded: number): Promise<void> {
    const files = await this.getOrderedFiles();
    let currentSize = await this.getByteSize();

    for (const file of files) {
      if (currentSize + bytesNeeded <= this.maxSize) break;
      const filepath = path.join(this.bufferDir, file);
      const stat = await fs.promises.stat(filepath);
      await fs.promises.unlink(filepath);
      currentSize -= stat.size;
    }
  }
}
