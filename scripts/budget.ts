// pnpm test:perf — presupuesto inicial por ruta sobre dist/ (DOC-49 §12–§13, POR-018, POR-020).
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

export type RouteBudget = { route: string; jsBytes: number; cssBytes: number };

const KB = 1024;
const JS_WARN = 180 * KB; // objetivo blando
const JS_FAIL = 250 * KB; // revisión obligatoria: el check falla
const CSS_FAIL = 80 * KB;

const gzipped = (file: string) => (existsSync(file) ? gzipSync(readFileSync(file)).length : 0);

/** Suma el peso gzip de los scripts y hojas de estilo locales que referencia cada index.html. */
export function measureRoutes(distDir: string): RouteBudget[] {
  const pages = readdirSync(distDir, { withFileTypes: true, recursive: true })
    .filter((item) => item.isFile() && item.name === "index.html")
    .map((item) => join(item.parentPath, item.name))
    .sort();

  return pages.map((page) => {
    const html = readFileSync(page, "utf8");
    const local = (re: RegExp) =>
      [...html.matchAll(re)]
        .map((m) => m[1] ?? "")
        .filter((src) => src.startsWith("/") && !src.startsWith("//"));
    const scripts = local(/<script\b[^>]*\bsrc="([^"]+)"/g);
    const styles = local(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g);
    const size = (srcs: string[]) =>
      srcs.reduce((sum, src) => sum + gzipped(join(distDir, src)), 0);
    const dir = relative(distDir, dirname(page)).split(sep).join("/");
    return { route: dir ? `/${dir}/` : "/", jsBytes: size(scripts), cssBytes: size(styles) };
  });
}

export function checkBudgets(routes: RouteBudget[]): { failures: string[]; warnings: string[] } {
  const failures: string[] = [];
  const warnings: string[] = [];
  const kb = (n: number) => `${(n / KB).toFixed(1)} KB`;
  for (const { route, jsBytes, cssBytes } of routes) {
    if (jsBytes > JS_FAIL) failures.push(`${route}: JS ${kb(jsBytes)} exceeds 250 KB`);
    else if (jsBytes > JS_WARN)
      warnings.push(`${route}: JS ${kb(jsBytes)} exceeds the 180 KB target`);
    if (cssBytes > CSS_FAIL) failures.push(`${route}: CSS ${kb(cssBytes)} exceeds 80 KB`);
  }
  return { failures, warnings };
}

// CLI: node scripts/budget.ts (requiere un pnpm build previo).
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const dist = join(process.cwd(), "dist");
  if (!existsSync(dist)) {
    console.error("dist/ not found: run pnpm build first");
    process.exit(1);
  }
  const routes = measureRoutes(dist);
  console.table(
    routes.map((r) => ({ route: r.route, "JS (gzip)": r.jsBytes, "CSS (gzip)": r.cssBytes })),
  );
  const { failures, warnings } = checkBudgets(routes);
  for (const w of warnings) console.warn(`warning: ${w}`);
  for (const f of failures) console.error(`failure: ${f}`);
  process.exitCode = failures.length > 0 ? 1 : 0;
}
