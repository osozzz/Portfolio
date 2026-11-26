import { randomBytes } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkBudgets, measureRoutes } from "../../scripts/budget.ts";

const KB = 1024;

// Bytes aleatorios: gzip casi no los comprime, así el tamaño comprimido es predecible.
function distWith(assets: { js?: number; css?: number }) {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  mkdirSync(join(dist, "_astro"));
  const tags: string[] = [];
  if (assets.js) {
    writeFileSync(join(dist, "_astro", "app.js"), randomBytes(assets.js).toString("base64"));
    tags.push('<script type="module" src="/_astro/app.js"></script>');
  }
  if (assets.css) {
    writeFileSync(join(dist, "_astro", "app.css"), randomBytes(assets.css).toString("base64"));
    tags.push('<link rel="stylesheet" href="/_astro/app.css">');
  }
  writeFileSync(
    join(dist, "index.html"),
    `<html><head>${tags.join("")}</head><body></body></html>`,
  );
  return dist;
}

describe("route budgets (DOC-49)", () => {
  it("measures zero for a route without assets", () => {
    expect(measureRoutes(distWith({}))).toEqual([{ route: "/", jsBytes: 0, cssBytes: 0 }]);
  });

  it("fails a route over 250 KB of compressed JS", () => {
    const result = checkBudgets(measureRoutes(distWith({ js: 260 * KB })));
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toContain("JS");
  });

  it("warns between 180 and 250 KB of compressed JS", () => {
    const result = checkBudgets(measureRoutes(distWith({ js: 200 * KB })));
    expect(result.failures).toEqual([]);
    expect(result.warnings).toHaveLength(1);
  });

  it("fails CSS over 80 KB compressed", () => {
    const result = checkBudgets(measureRoutes(distWith({ css: 90 * KB })));
    expect(result.failures[0]).toContain("CSS");
  });
});
