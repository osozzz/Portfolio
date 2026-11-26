// Validación de la documentación canónica (DOC-51 §28). Funciones puras: validate.ts lee los archivos.
import { parse } from "yaml";

export type Problem = { file: string; message: string };
export type DocFile = { path: string; text: string };

const DOCUMENT_STATUS = new Set(["DRAFT", "REVIEW", "APPROVED", "DEFERRED", "SUPERSEDED", "ARCHIVED"]);
const DECISION_STATUS = new Set(["PROPOSED", "APPROVED", "SUPERSEDED", "REJECTED"]);

// Valores de credenciales, no nombres de variables (un doc puede decir SUPABASE_SECRET_KEY).
const SECRET_VALUES = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /gh[pousr]_[A-Za-z0-9]{36}/,
  /sk_live_[A-Za-z0-9]{16,}/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./,
];

/** Devuelve el front matter YAML, o null si el archivo no tiene o no se puede leer. */
export function parseFrontMatter(text: string): Record<string, unknown> | null {
  const normalized = text.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return null;
  const end = normalized.indexOf("\n---", 4);
  if (end === -1) return null;
  try {
    // El esquema core deja las fechas como texto, igual que el manifiesto.
    const data: unknown = parse(normalized.slice(4, end), { schema: "core" });
    return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const recordId = (path: string) => /(DOC-\d{2}|ADR-\d{3})-/.exec(path.split("/").pop() ?? "")?.[1];

export function checkDocs(files: DocFile[]): Problem[] {
  const problems: Problem[] = [];
  const known = new Set(files.map((f) => recordId(f.path)).filter(Boolean));
  const seen = new Map<string, string>();

  for (const { path, text } of files) {
    const add = (message: string) => problems.push({ file: path, message });
    const id = recordId(path);

    if (id) {
      const fm = parseFrontMatter(text);
      if (!fm) {
        add("missing or unparseable front matter");
      } else {
        if (fm.id !== id) add(`front matter id ${String(fm.id)} does not match the file name`);
        if (seen.has(id)) add(`duplicate id ${id}`);
        seen.set(id, path);
        if (id.startsWith("DOC-") && !DOCUMENT_STATUS.has(String(fm.document_status))) {
          add(`invalid document_status ${String(fm.document_status)}`);
        }
        if (id.startsWith("ADR-") && !DECISION_STATUS.has(String(fm.decision_status))) {
          add(`invalid decision_status ${String(fm.decision_status)}`);
        }
      }
    }

    for (const ref of new Set(text.match(/\b(?:DOC-\d{2}|ADR-\d{3})\b/g) ?? [])) {
      if (!known.has(ref)) add(`${ref} is referenced but no file exists`);
    }
    if ((text.match(/^\s*```/gm) ?? []).length % 2 !== 0) add("unbalanced code fences");
    if (SECRET_VALUES.some((re) => re.test(text))) add("possible secret value");
  }
  return problems;
}
