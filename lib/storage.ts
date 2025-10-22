// lib/storage.ts
import { promises as fs } from "fs";
import path from "path";

const STORAGE_DIR = process.env.FILE_STORAGE_DIR || "./uploads";

export async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

export async function saveFile(
  buffer: Buffer,
  filename: string,
  subdir?: string
): Promise<string> {
  await ensureStorageDir();

  const dir = subdir ? path.join(STORAGE_DIR, subdir) : STORAGE_DIR;
  await fs.mkdir(dir, { recursive: true });

  const filepath = path.join(dir, filename);
  await fs.writeFile(filepath, buffer);

  // Return relative URL path
  return subdir ? `/uploads/${subdir}/${filename}` : `/uploads/${filename}`;
}

export async function deleteFile(filepath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), filepath);
  try {
    await fs.unlink(fullPath);
  } catch (error) {
    console.error("Failed to delete file:", error);
  }
}

export async function fileExists(filepath: string): Promise<boolean> {
  const fullPath = path.join(process.cwd(), filepath);
  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}
