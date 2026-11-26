import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkDocs, parseFrontMatter } from "../../scripts/docs/checks.ts";
import { buildManifest, manifestProblems } from "../../scripts/docs/manifest.ts";

const doc = (id: string, extra = "", body = "Body.\n") =>
  `---\nid: ${id}\ntitle: "T"\ndocument_status: APPROVED\n${extra}---\n\n# ${id}\n\n${body}`;
const file = (path: string, text: string) => ({ path, text });

describe("docs checks", () => {
  it("parses front matter and keeps dates as text", () => {
    expect(parseFrontMatter("---\nid: DOC-01\nlast_updated: 2026-11-25\n---\n")).toEqual({
      id: "DOC-01",
      last_updated: "2026-11-25",
    });
  });

  it("rejects a duplicate id", () => {
    const problems = checkDocs([
      file("docs/a/DOC-01-a.md", doc("DOC-01")),
      file("docs/a/DOC-01-b.md", doc("DOC-01")),
    ]);
    expect(problems.map((p) => p.message)).toContain("duplicate id DOC-01");
  });

  it("rejects an unknown document_status", () => {
    const text = doc("DOC-01").replace("APPROVED", "FINAL");
    expect(checkDocs([file("docs/a/DOC-01-a.md", text)]).map((p) => p.message)).toContain(
      "invalid document_status FINAL",
    );
  });

  it("rejects a reference to a missing ADR", () => {
    const problems = checkDocs([file("docs/a/DOC-01-a.md", doc("DOC-01", "", "See ADR-042.\n"))]);
    expect(problems.map((p) => p.message)).toContain("ADR-042 is referenced but no file exists");
  });

  it("rejects an odd number of code fences", () => {
    const problems = checkDocs([file("docs/a/DOC-01-a.md", doc("DOC-01", "", "```text\nopen\n"))]);
    expect(problems.map((p) => p.message)).toContain("unbalanced code fences");
  });

  it("flags a secret value but not a secret variable name", () => {
    const named = checkDocs([file("docs/a/DOC-01-a.md", doc("DOC-01", "", "Set SUPABASE_SECRET_KEY.\n"))]);
    expect(named).toEqual([]);
    const leaked = checkDocs([
      file("docs/a/DOC-01-a.md", doc("DOC-01", "", "token ghp_abcdefghijklmnopqrstuvwxyz0123456789\n")),
    ]);
    expect(leaked.map((p) => p.message)).toContain("possible secret value");
  });
});

describe("manifest", () => {
  it("reports manifest drift with the regenerate command", () => {
    const root = mkdtempSync(join(tmpdir(), "manifest-"));
    mkdirSync(join(root, "docs", "a"), { recursive: true });
    writeFileSync(join(root, "docs", "a", "DOC-01-a.md"), doc("DOC-01"));
    const current = buildManifest(root, {
      summary: { files_hashed: 0, total_hashed_bytes: 0 },
      files: [{ path: "docs/a/DOC-01-a.md", bytes: 0, sha256: "", record_id: "DOC-01", title: "" }],
    });
    expect(manifestProblems(root, current)).toEqual([]);

    // Un byte distinto en el doc deja el manifiesto viejo.
    writeFileSync(join(root, "docs", "a", "DOC-01-a.md"), doc("DOC-01") + "\n");
    const messages = manifestProblems(root, current).map((p) => p.message);
    expect(messages).toContain("MANIFEST.json is out of date: run pnpm docs:manifest");
  });
});
