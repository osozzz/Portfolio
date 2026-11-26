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
  /github_pat_[A-Za-z0-9_]{50,}/,
  /(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}/,
  /sb_secret_[A-Za-z0-9_-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./,
];

/** Devuelve el front matter YAML ({} si está vacío), o null si no hay o no se puede leer. */
export function parseFrontMatter(text: string): Record<string, unknown> | null {
  const normalized = text.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return null;
  if (normalized.startsWith("---\n---\n")) return {};
  const end = normalized.indexOf("\n---\n", 3);
  if (end === -1) return null;
  try {
    // El esquema core deja las fechas como texto, igual que el manifiesto.
    const data: unknown = parse(normalized.slice(4, end), { schema: "core" });
    return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const recordId = (path: string) => /(DOC-\d{2}|ADR-\d{3})-/.exec(path.split("/").pop() ?? "")?.[1];
const folderOf = (path: string) => path.slice(0, path.lastIndexOf("/"));

const STATUS_WORD = new RegExp(`\\b(${[...DOCUMENT_STATUS].join("|")})\\b`);
const RANGE = /DOC-(\d{2})\s*(?:–|—|-|through|to)\s*DOC-(\d{2})/g;

/** Cada carpeta con DOC-NN y README debe nombrarlos (solos o en un rango) y, si la línea dice un
 * estado en mayúsculas, debe ser el real (DOC-51 §28). Acepta tablas, viñetas y rangos. */
function indexProblems(files: DocFile[], statusById: Map<string, string>): Problem[] {
  const problems: Problem[] = [];
  for (const readme of files.filter((f) => f.path.endsWith("/README.md"))) {
    const folder = folderOf(readme.path);
    const lines = readme.text.split("\n");
    for (const f of files.filter((d) => folderOf(d.path) === folder)) {
      const id = recordId(f.path);
      if (!id?.startsWith("DOC-")) continue;
      const n = Number(id.slice(4));
      const own = lines.filter((line) => line.includes(id));
      const inRange = lines.some((line) =>
        [...line.matchAll(RANGE)].some((m) => Number(m[1]) <= n && n <= Number(m[2])),
      );
      const actual = statusById.get(id);
      const listedStatus = own.map((line) => STATUS_WORD.exec(line)?.[1]).find(Boolean);
      if (own.length === 0 && !inRange) {
        problems.push({ file: readme.path, message: `${id} is not listed in the folder README` });
      } else if (listedStatus && listedStatus !== actual) {
        problems.push({
          file: readme.path,
          message: `README lists ${id} as ${listedStatus} but the document is ${actual}`,
        });
      }
    }
  }
  return problems;
}

export function checkDocs(files: DocFile[]): Problem[] {
  const problems: Problem[] = [];
  const known = new Set(files.map((f) => recordId(f.path)).filter(Boolean));
  const seen = new Set<string>();
  const families = new Map<string, string>();
  const statusById = new Map<string, string>();

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
        seen.add(id);
        statusById.set(id, String(fm.document_status ?? fm.decision_status));
        if (id.startsWith("DOC-") && !DOCUMENT_STATUS.has(String(fm.document_status))) {
          add(`invalid document_status ${String(fm.document_status)}`);
        }
        if (id.startsWith("ADR-") && !DECISION_STATUS.has(String(fm.decision_status))) {
          add(`invalid decision_status ${String(fm.decision_status)}`);
        }
        // Cada familia de decisiones tiene un solo documento dueño.
        for (const family of Array.isArray(fm.decision_families) ? fm.decision_families : []) {
          const owner = families.get(String(family));
          if (owner && owner !== id) add(`decision family ${String(family)} is also declared by ${owner}`);
          else families.set(String(family), id);
        }
      }
    }

    for (const ref of new Set(text.match(/\b(?:DOC-\d{2}|ADR-\d{3})\b/g) ?? [])) {
      if (!known.has(ref)) add(`${ref} is referenced but no file exists`);
    }
    if ((text.match(/^\s*```/gm) ?? []).length % 2 !== 0) add("unbalanced code fences");
    // Nunca se imprime el valor: solo que hay uno.
    if (SECRET_VALUES.some((re) => re.test(text))) add("possible secret value");
  }
  return [...problems, ...indexProblems(files, statusById)];
}
