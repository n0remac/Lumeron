// lib/storage.ts
import { promises as fs } from "fs";
import path from "path";

const DEFAULT_STORAGE_DIR =
  process.env.FILE_STORAGE_DIR || path.join(process.cwd(), "uploads");

const DEFAULT_PUBLIC_PATH = "/uploads";

export const STORAGE_DIR = path.resolve(DEFAULT_STORAGE_DIR);

const configuredPublicPath =
  process.env.FILE_STORAGE_PUBLIC_PATH || DEFAULT_PUBLIC_PATH;

export const PUBLIC_STORAGE_PATH = configuredPublicPath.startsWith("/")
  ? configuredPublicPath.replace(/\/+$/, "") || DEFAULT_PUBLIC_PATH
  : `/${configuredPublicPath.replace(/\/+$/, "")}`;

function normalizeSegment(segment?: string) {
  if (!segment) {
    return undefined;
  }

  const cleaned = segment.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");

  return cleaned.length > 0 ? cleaned : undefined;
}

function buildPublicUrl(subdir: string | undefined, filename: string) {
  const normalizedSubdir = normalizeSegment(subdir);
  const base = PUBLIC_STORAGE_PATH.slice(1);
  const parts = [base];

  if (normalizedSubdir) {
    parts.push(normalizedSubdir);
  }

  parts.push(filename);

  return `/${parts.filter(Boolean).join("/")}`.replace(/\/+/g, "/");
}

function resolveAbsolutePathFromUrl(filepath: string): string | null {
  if (!filepath || /^(https?:)?\/\//i.test(filepath)) {
    return null;
  }

  const normalized = filepath.replace(/\\/g, "/");
  let relative = normalized;

  const normalizedBase = PUBLIC_STORAGE_PATH;

  if (relative.startsWith(normalizedBase)) {
    relative = relative.slice(normalizedBase.length);
  }

  if (relative.startsWith("/")) {
    relative = relative.slice(1);
  }

  const sanitized = normalizeSegment(relative);

  if (!sanitized) {
    return null;
  }

  const absolutePath = path.resolve(STORAGE_DIR, sanitized);

  if (!absolutePath.startsWith(STORAGE_DIR)) {
    return null;
  }

  return absolutePath;
}

export async function ensureStorageDir(subdir?: string) {
  const normalizedSubdir = normalizeSegment(subdir);

  const targetDir = normalizedSubdir
    ? path.join(STORAGE_DIR, normalizedSubdir)
    : STORAGE_DIR;

  await fs.mkdir(targetDir, { recursive: true });

  return targetDir;
}

export async function saveFile(
  buffer: Buffer,
  filename: string,
  subdir?: string
): Promise<string> {
  const dir = await ensureStorageDir(subdir);

  const filepath = path.join(dir, filename);
  await fs.writeFile(filepath, buffer);

  return buildPublicUrl(subdir, filename);
}

export async function deleteFile(filepath: string): Promise<void> {
  const fullPath = resolveAbsolutePathFromUrl(filepath);

  if (!fullPath) {
    return;
  }

  try {
    await fs.unlink(fullPath);
  } catch (error) {
    console.error("Failed to delete file:", error);
  }
}

export async function fileExists(filepath: string): Promise<boolean> {
  const fullPath = resolveAbsolutePathFromUrl(filepath);

  if (!fullPath) {
    return false;
  }

  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}
