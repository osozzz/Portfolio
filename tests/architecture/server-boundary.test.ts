import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

// Una sola instancia, anclada a la raíz del repo, sin importar desde dónde corra Vitest.
const eslint = new ESLint({ cwd: fileURLToPath(new URL("../..", import.meta.url)) });

const BOUNDARY_RULES = new Set(["no-restricted-imports", "no-restricted-syntax"]);

async function boundaryErrors(filePath: string, code: string): Promise<number> {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).filter((m) => m.ruleId && BOUNDARY_RULES.has(m.ruleId)).length;
}

const importing = (source: string) => `import db from "${source}";\nexport default db;\n`;
const astroScript = (source: string) =>
  `<script>\n  import db from "${source}";\n  console.log(db);\n</script>\n`;

describe("server/client boundary", () => {
  it("rejects server imports from client code", async () => {
    expect(await boundaryErrors("src/components/Demo.tsx", importing("../lib/server/db"))).toBe(1);
    // El servidor sí puede importar su propio código.
    expect(await boundaryErrors("src/pages/api/demo.ts", importing("../lib/server/db"))).toBe(0);
  });

  it.each([
    ["a barrel import", "src/components/Demo.tsx", importing("../lib/server")],
    ["an alias barrel import", "src/components/Demo.tsx", importing("@/lib/server")],
    [
      "a nested server folder (DOC-42 §13)",
      "src/runtime/x.ts",
      importing("../lib/content/server/q"),
    ],
    [
      "a dynamic import",
      "src/components/Demo.tsx",
      `export const db = import("../lib/server/db");\n`,
    ],
    ["a .jsx island", "src/components/Demo.jsx", importing("../lib/server/db")],
  ])("rejects %s from client code", async (_case, filePath, code) => {
    expect(await boundaryErrors(filePath, code)).toBe(1);
  });

  it.each([
    ["a component", "src/components/Demo.astro"],
    ["a layout", "src/layouts/Base.astro"],
    ["a page", "src/pages/index.astro"],
  ])("rejects server imports from the client script of %s", async (_case, filePath) => {
    expect(await boundaryErrors(filePath, astroScript("../lib/server/db"))).toBe(1);
  });

  it("allows server imports from Astro frontmatter and feature server modules", async () => {
    const frontmatter = `---\nimport db from "../lib/server/db";\n---\n<p>{String(db)}</p>\n`;
    // El frontmatter corre en el servidor.
    expect(await boundaryErrors("src/components/Demo.astro", frontmatter)).toBe(0);
    // DOC-42 §102: cada feature puede tener su propia carpeta server/.
    const featureServer = "src/features/projects/server/get-project.ts";
    expect(await boundaryErrors(featureServer, importing("../../../lib/server/db"))).toBe(0);
  });
});
