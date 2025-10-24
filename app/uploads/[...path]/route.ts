import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { PUBLIC_STORAGE_PATH, STORAGE_DIR } from "@/lib/storage";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

function normalizeRelativePath(segments: string[]): string | null {
  if (!segments.length) {
    return null;
  }

  const joined = segments.join("/");
  const normalized = path
    .normalize(joined)
    .replace(/\\/g, "/")
    .replace(/^(\.\.\/|\/)+/, "");

  return normalized.length > 0 ? normalized : null;
}

export async function GET(
  _request: Request,
  context: { params: { path: string[] } }
) {
  const relativePath = normalizeRelativePath(context.params.path);

  if (!relativePath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const absolutePath = path.resolve(STORAGE_DIR, relativePath);

  if (!absolutePath.startsWith(STORAGE_DIR)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const file = await fs.readFile(absolutePath);
    const extension = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Served-From": PUBLIC_STORAGE_PATH,
      },
    });
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      console.error("Failed to read stored file:", error);
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
