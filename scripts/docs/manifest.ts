// Regenera MANIFEST.json desde los archivos: bytes, sha256 y el subconjunto de front matter que ya guarda cada entrada.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { parseFrontMatter, type Problem } from "./checks.ts";

export type Entry = { path: string; bytes: number; sha256: string; [key: string]: unknown };
export type Manifest = {
  summary: { files_hashed: number; total_hashed_bytes: number; [key: string]: unknown };
  files: Entry[];
  [key: string]: unknown;
};

const FIXED = new Set(["path", "bytes", "sha256"]);

function markdownUnder(root: string, dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(join(root, dir))) return out;
  for (const item of readdirSync(join(root, dir), { withFileTypes: true, recursive: true })) {
    if (item.isFile() && item.name.endsWith(".md")) {
      out.push(relative(root, join(item.parentPath, item.name)).split(sep).join("/"));
    }
  }
  return out.sort();
}

function entryFor(root: string, path: string, keysFrom: Entry | undefined, old: Entry | undefined): Entry {
  const raw = readFileSync(join(root, path));
  const entry: Entry = { path, bytes: raw.length, sha256: createHash("sha256").update(raw).digest("hex") };
  const fm = path.endsWith(".md") ? parseFrontMatter(raw.toString("utf8")) : null;
  const meta: Record<string, unknown> =
    fm?.id ? { record_id: fm.id, record_type: fm.record_type ?? "document", ...fm } : {};
  for (const key of Object.keys(keysFrom ?? {})) {
    if (FIXED.has(key)) continue;
    // Sin front matter (README, evidencia JSON) se conserva el valor que ya tenía la entrada.
    if (key in meta) entry[key] = meta[key];
    else if (old && key in old) entry[key] = old[key];
  }
  return entry;
}

/** Entrada vecina más completa (misma carpeta y prefijo) para dar forma a un archivo nuevo. */
function template(path: string, current: Entry[]): Entry | undefined {
  const folder = path.slice(0, path.lastIndexOf("/"));
  const prefix = path.slice(folder.length + 1).split("-")[0] ?? "";
  const same = current.filter((e) => {
    const name = e.path.slice(e.path.lastIndexOf("/") + 1);
    return e.path.startsWith(`${folder}/`) && name.startsWith(prefix);
  });
  return same.sort((a, b) => Object.keys(b).length - Object.keys(a).length)[0];
}

export function buildManifest(root: string, current: Manifest): Manifest {
  const known = new Map(current.files.map((e) => [e.path, e]));
  const kept = current.files.map((e) => e.path).filter((p) => existsSync(join(root, p)));
  const added = markdownUnder(root, "docs").filter((p) => !known.has(p));
  const files = [
    ...kept.map((p) => entryFor(root, p, known.get(p), known.get(p))),
    ...added.map((p) => entryFor(root, p, template(p, current.files), undefined)),
  ];
  return {
    ...current,
    summary: {
      ...current.summary,
      files_hashed: files.length,
      total_hashed_bytes: files.reduce((sum, e) => sum + e.bytes, 0),
    },
    files,
  };
}

export function manifestProblems(root: string, current: Manifest): Problem[] {
  const fresh = buildManifest(root, current);
  if (JSON.stringify(fresh) === JSON.stringify(current)) return [];
  const before = new Map(current.files.map((e) => [e.path, JSON.stringify(e)]));
  const changed = fresh.files.filter((e) => before.get(e.path) !== JSON.stringify(e)).map((e) => e.path);
  return [
    { file: "MANIFEST.json", message: "MANIFEST.json is out of date: run pnpm docs:manifest" },
    ...changed.map((file) => ({ file, message: "entry differs from the file on disk" })),
  ];
}

export const serialize = (manifest: Manifest) => `${JSON.stringify(manifest, null, 2)}\n`;

// CLI: node scripts/docs/manifest.ts reescribe MANIFEST.json en la raíz del repositorio.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const root = process.cwd();
  const path = join(root, "MANIFEST.json");
  const manifest = buildManifest(root, JSON.parse(readFileSync(path, "utf8")) as Manifest);
  writeFileSync(path, serialize(manifest));
  console.log(`MANIFEST.json: ${manifest.files.length} files`);
}
