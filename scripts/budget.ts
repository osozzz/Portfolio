// pnpm test:perf — presupuesto inicial por ruta sobre dist/ (DOC-49 §12–§13, POR-018, POR-020).
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

export type RouteBudget = { route: string; jsBytes: number; cssBytes: number; missing: string[] };

const KB = 1024;
const JS_WARN = 180 * KB; // objetivo blando
const JS_FAIL = 250 * KB; // revisión obligatoria: el check falla
const CSS_FAIL = 80 * KB;

const attr = (html: string, re: RegExp) => [...html.matchAll(re)].map((m) => m[1] ?? "");
const isLocal = (url: string) => url.startsWith("/") && !url.startsWith("//");
// import/export estáticos (también minificados); import() dinámico queda fuera: es carga diferida.
const STATIC_IMPORT = /(?:^|[^.\w$])(?:import|export)\s*(?:[^"'();]*?\bfrom\s*)?["']([^"']+)["']/g;

function routeOf(distDir: string, file: string): string {
  const rel = relative(distDir, file).split(sep).join("/");
  if (rel === "index.html") return "/";
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"index.html".length)}` : `/${rel}`;
}

/** JS inicial de cada página: scripts, modulepreload, islas (component/renderer/before-hydration),
 * módulos inline y todo lo que importan de forma estática. CSS: hojas de estilo enlazadas. */
export function measureRoutes(distDir: string): RouteBudget[] {
  const pages = readdirSync(distDir, { withFileTypes: true, recursive: true })
    .filter((item) => item.isFile() && item.name.endsWith(".html"))
    .map((item) => join(item.parentPath, item.name))
    .sort();

  return pages.map((page) => {
    const html = readFileSync(page, "utf8");
    const missing: string[] = [];
    const inline = attr(html, /<script\b[^>]*\btype="module"[^>]*>([\s\S]*?)<\/script>/g).filter(
      Boolean,
    );
    const entries = [
      ...attr(html, /<script\b[^>]*\bsrc="([^"]+)"/g),
      ...attr(html, /<link\b[^>]*\brel="modulepreload"[^>]*\bhref="([^"]+)"/g),
      ...attr(html, /\b(?:component|renderer|before-hydration)-url="([^"]+)"/g),
      ...inline.flatMap((code) => attr(code, STATIC_IMPORT)),
    ].filter(isLocal);

    // Recorre el grafo de imports estáticos sin contar dos veces el mismo chunk.
    const seen = new Set<string>();
    let jsBytes = inline.reduce((sum, code) => sum + gzipSync(code).length, 0);
    const queue = [...entries];
    while (queue.length > 0) {
      const url = queue.shift() ?? "";
      if (seen.has(url)) continue;
      seen.add(url);
      const file = join(distDir, url);
      if (!existsSync(file)) {
        missing.push(url);
        continue;
      }
      const code = readFileSync(file);
      jsBytes += gzipSync(code).length;
      for (const spec of attr(code.toString("utf8"), STATIC_IMPORT)) {
        if (spec.startsWith(".") || isLocal(spec))
          queue.push(new URL(spec, `http://dist${url}`).pathname);
      }
    }

    let cssBytes = 0;
    for (const href of attr(html, /<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g).filter(
      isLocal,
    )) {
      const file = join(distDir, href);
      if (existsSync(file)) cssBytes += gzipSync(readFileSync(file)).length;
      else missing.push(href);
    }
    return { route: routeOf(distDir, page), jsBytes, cssBytes, missing };
  });
}

export function checkBudgets(routes: RouteBudget[]): { failures: string[]; warnings: string[] } {
  if (routes.length === 0) return { failures: ["no HTML routes found in dist/"], warnings: [] };
  const failures: string[] = [];
  const warnings: string[] = [];
  const kb = (n: number) => `${(n / KB).toFixed(1)} KB`;
  for (const { route, jsBytes, cssBytes, missing } of routes) {
    // Un asset que no existe no puede contarse como 0: el build está mal o la medición no lo encuentra.
    for (const url of missing)
      failures.push(`${route}: referenced asset ${url} not found in dist/`);
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
