import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export type MediaAsset = {
  name: string;
  url: string;
  size: number;
  createdAt: string;
};

const uploadRoot = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
const coversDir = path.join(uploadRoot, "covers");
const publicPrefix = "/uploads/covers";
const maxUploadBytes = 10 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg"
};

function slugifyName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "cover";
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image payload");
  const mimeType = match[1];
  const extension = allowedTypes[mimeType];
  if (!extension) throw new Error("Only JPG, PNG, WEBP, and SVG images are allowed");
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length) throw new Error("Image is empty");
  if (buffer.length > maxUploadBytes) throw new Error("Image is larger than 10MB");
  return { buffer, extension };
}

async function ensureCoversDir() {
  await fs.mkdir(coversDir, { recursive: true });
}

export async function listCoverImages(): Promise<MediaAsset[]> {
  await ensureCoversDir();
  const entries = await fs.readdir(coversDir, { withFileTypes: true });
  const assets = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const stat = await fs.stat(path.join(coversDir, entry.name));
        return {
          name: entry.name,
          url: publicPrefix + "/" + entry.name,
          size: stat.size,
          createdAt: stat.birthtime.toISOString()
        };
      })
  );
  return assets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveCoverImage(input: { fileName?: string; dataUrl?: string }): Promise<MediaAsset> {
  await ensureCoversDir();
  const { buffer, extension } = parseDataUrl(String(input.dataUrl ?? ""));
  const baseName = slugifyName(String(input.fileName ?? "cover"));
  const name = baseName + "-" + crypto.randomUUID().slice(0, 8) + "." + extension;
  const filePath = path.join(coversDir, name);
  await fs.writeFile(filePath, buffer, { flag: "wx" });
  const stat = await fs.stat(filePath);
  return { name, url: publicPrefix + "/" + name, size: stat.size, createdAt: stat.birthtime.toISOString() };
}

export async function deleteCoverImage(name: string) {
  const safeName = path.basename(name);
  await fs.rm(path.join(coversDir, safeName), { force: true });
}

export async function pickRandomCoverImage(): Promise<string | null> {
  const covers = await listCoverImages();
  if (!covers.length) return null;
  return covers[Math.floor(Math.random() * covers.length)].url;
}
