import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const serverImport = "import db from '../lib/server/db';\nexport default db;\n";

async function boundaryErrors(filePath: string, code = serverImport): Promise<number> {
  const eslint = new ESLint();
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).filter((m) => m.ruleId === "no-restricted-imports").length;
}

describe("server/client boundary", () => {
  it("rejects server imports from client code", async () => {
    expect(await boundaryErrors("src/components/Demo.tsx")).toBe(1);
    // El servidor sí puede importar su propio código.
    expect(await boundaryErrors("src/pages/api/demo.ts")).toBe(0);
  });

  it("rejects server imports from an Astro client script but not from its frontmatter", async () => {
    const clientScript = `<script>
  import db from "../lib/server/db";
  console.log(db);
</script>
`;
    const frontmatter = `---
import db from "../lib/server/db";
---
<p>{String(db)}</p>
`;

    expect(await boundaryErrors("src/components/Demo.astro", clientScript)).toBe(1);
    // El frontmatter corre en el servidor, así que puede importar src/lib/server.
    expect(await boundaryErrors("src/components/Demo.astro", frontmatter)).toBe(0);
  });
});
