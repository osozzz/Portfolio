import { randomBytes } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { afterEach, describe, expect, it } from "vitest";
import { checkBudgets, measureRoutes } from "../../scripts/budget.ts";

const KB = 1024;
const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

// Bytes aleatorios en base64: gzip casi no los comprime, así el tamaño es predecible.
const noise = (bytes: number) => randomBytes(bytes).toString("base64");
const gz = (text: string) => gzipSync(text).length;

function dist(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "dist-"));
  dirs.push(root);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}
const page = (head: string, body = "") => `<html><head>${head}</head><body>${body}</body></html>`;

describe("route budgets (DOC-49)", () => {
  it("measures zero for a route without assets", () => {
    expect(measureRoutes(dist({ "index.html": page("") }))).toEqual([
      { route: "/", jsBytes: 0, cssBytes: 0, missing: [] },
    ]);
  });

  it("fails a route over 250 KB of compressed JS", () => {
    const d = dist({
      "index.html": page('<script type="module" src="/_astro/app.js"></script>'),
      "_astro/app.js": noise(260 * KB),
    });
    const result = checkBudgets(measureRoutes(d));
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toContain("JS");
  });

  it("warns between 180 and 250 KB of compressed JS", () => {
    const d = dist({
      "index.html": page('<script type="module" src="/_astro/app.js"></script>'),
      "_astro/app.js": noise(200 * KB),
    });
    const result = checkBudgets(measureRoutes(d));
    expect(result.failures).toEqual([]);
    expect(result.warnings).toHaveLength(1);
  });

  it("fails CSS over 80 KB compressed", () => {
    const d = dist({
      "index.html": page('<link rel="stylesheet" href="/_astro/app.css">'),
      "_astro/app.css": noise(90 * KB),
    });
    expect(checkBudgets(measureRoutes(d)).failures[0]).toContain("CSS");
  });

  it("counts island code, its static imports and inline module scripts, but not lazy imports", () => {
    const island = `import{a}from"./dep.js";import("./lazy.js");${noise(10 * KB)}`;
    const inline = `import "/_astro/boot.js";${noise(KB)}`;
    const d = dist({
      "index.html": page(
        `<script type="module">${inline}</script>`,
        '<astro-island component-url="/_astro/Island.js" renderer-url="/_astro/client.js"></astro-island>',
      ),
      "_astro/Island.js": island,
      "_astro/dep.js": noise(20 * KB),
      "_astro/client.js": noise(30 * KB),
      "_astro/boot.js": noise(5 * KB),
      "_astro/lazy.js": noise(100 * KB),
    });
    const [route] = measureRoutes(d);
    const files = ["Island.js", "dep.js", "client.js", "boot.js"].map(
      (f) => gzipSync(readText(d, `_astro/${f}`)).length,
    );
    expect(route?.jsBytes).toBe(files.reduce((a, b) => a + b, 0) + gz(inline));
  });

  it("fails when a referenced local asset is missing", () => {
    const d = dist({ "index.html": page('<script type="module" src="/_astro/gone.js"></script>') });
    expect(checkBudgets(measureRoutes(d)).failures[0]).toContain("/_astro/gone.js");
  });

  it("fails when the build has no routes", () => {
    expect(checkBudgets(measureRoutes(dist({ "x.txt": "" }))).failures).toEqual([
      "no HTML routes found in dist/",
    ]);
  });
});

function readText(root: string, path: string) {
  return readFileSync(join(root, path), "utf8");
}
