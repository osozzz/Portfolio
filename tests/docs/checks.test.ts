import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { checkDocs, parseFrontMatter } from "../../scripts/docs/checks.ts";
import { buildManifest, manifestProblems, type Manifest } from "../../scripts/docs/manifest.ts";

const doc = (id: string, extra = "", body = "Body.\n") =>
  `---\nid: ${id}\ntitle: "T"\ndocument_status: APPROVED\n${extra}---\n\n# ${id}\n\n${body}`;
const file = (path: string, text: string) => ({ path, text });

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));
function tree(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "manifest-"));
  dirs.push(root);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}
const emptyManifest = (): Manifest => ({
  summary: { files_hashed: 0, total_hashed_bytes: 0 },
  files: [],
});

describe("docs checks", () => {
  it("parses front matter and keeps dates as text", () => {
    expect(parseFrontMatter("---\nid: DOC-01\nlast_updated: 2026-11-25\n---\n")).toEqual({
      id: "DOC-01",
      last_updated: "2026-11-25",
    });
  });

  it("treats empty front matter as empty, not as the next block", () => {
    expect(parseFrontMatter("---\n---\n\n# Title\n\n---\nnot: yaml\n")).toEqual({});
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

  it("does not flag a secret variable name", () => {
    expect(checkDocs([file("docs/a/DOC-01-a.md", doc("DOC-01", "", "Set SUPABASE_SECRET_KEY.\n"))])).toEqual([]);
  });

  it.each([
    ["GitHub classic", `ghp_${"a".repeat(36)}`],
    ["GitHub fine-grained", `github_pat_${"a".repeat(60)}`],
    ["AWS", "AKIAABCDEFGHIJKLMNOP"],
    ["private key", "-----BEGIN RSA PRIVATE KEY-----"],
    ["Stripe test", `sk_test_${"a".repeat(24)}`],
    ["Supabase secret", `sb_secret_${"a".repeat(32)}`],
    ["JWT", `eyJ${"a".repeat(24)}.${"b".repeat(24)}.c`],
  ])("flags a %s value", (_name, value) => {
    const problems = checkDocs([file("docs/a/DOC-01-a.md", doc("DOC-01", "", `${value}\n`))]);
    expect(problems.map((p) => p.message)).toContain("possible secret value");
  });

  it("rejects a decision family declared by two documents", () => {
    const fam = "decision_families:\n  - MSG\n";
    const problems = checkDocs([
      file("docs/a/DOC-01-a.md", doc("DOC-01", fam)),
      file("docs/a/DOC-02-b.md", doc("DOC-02", fam)),
    ]);
    expect(problems.map((p) => p.message)).toContain("decision family MSG is also declared by DOC-01");
  });

  it("requires each folder README to list its documents with their status", () => {
    const readme = "| ID | Document | Status |\n|---|---|---|\n| DOC-01 | A | **APPROVED** |\n";
    const ok = checkDocs([file("docs/a/DOC-01-a.md", doc("DOC-01")), file("docs/a/README.md", readme)]);
    expect(ok).toEqual([]);
    const stale = checkDocs([
      file("docs/a/DOC-01-a.md", doc("DOC-01").replace("APPROVED", "DRAFT")),
      file("docs/a/DOC-02-b.md", doc("DOC-02")),
      file("docs/a/README.md", readme),
    ]).map((p) => p.message);
    expect(stale).toContain("README lists DOC-01 as APPROVED but the document is DRAFT");
    expect(stale).toContain("DOC-02 is not listed in the folder README");
  });

  it("accepts bullet lists and ranges in a folder README", () => {
    const docs = [file("docs/a/DOC-01-a.md", doc("DOC-01")), file("docs/a/DOC-02-b.md", doc("DOC-02"))];
    const bullets = "- DOC-01 — A — **APPROVED**\n- DOC-02 — B — **APPROVED**\n";
    expect(checkDocs([...docs, file("docs/a/README.md", bullets)])).toEqual([]);
    const range = "DOC-01 through DOC-02 are the approved package.\n";
    expect(checkDocs([...docs, file("docs/a/README.md", range)])).toEqual([]);
  });
});

describe("manifest", () => {
  it("derives the summary counts from the files", () => {
    const root = tree({
      "docs/a/DOC-01-a.md": doc("DOC-01"),
      "docs/a/DOC-02-b.md": doc("DOC-02").replace("APPROVED", "DRAFT"),
      "docs/decisions/ADR-001-x.md": "---\nid: ADR-001\nrecord_type: adr\ndecision_status: APPROVED\n---\n",
      "docs/reviews/REVIEW-X-001.md": "---\nid: REVIEW-X-001\nrecord_type: review\n---\n",
      "docs/reviews/AMENDMENT-X-001.md": "---\nid: AMENDMENT-X-001\nrecord_type: amendment\n---\n",
      "docs/reviews/evidence/E.json": "{}\n",
    });
    const { summary, files } = buildManifest(root, emptyManifest());
    expect(summary).toMatchObject({
      numbered_documents: 2,
      approved_numbered_documents: 1,
      draft_numbered_documents: 1,
      approved_adrs: 1,
      review_records: 2,
      files_hashed: 6,
    });
    // La evidencia JSON nueva también se registra.
    expect(files.map((f) => f.path)).toContain("docs/reviews/evidence/E.json");
  });

  it("drops deleted files and hashes CRLF files like their LF form", () => {
    const lf = tree({ "docs/a/DOC-01-a.md": doc("DOC-01") });
    const crlf = tree({ "docs/a/DOC-01-a.md": doc("DOC-01").replace(/\n/g, "\r\n") });
    expect(buildManifest(crlf, emptyManifest()).files[0]?.sha256).toBe(
      buildManifest(lf, emptyManifest()).files[0]?.sha256,
    );
    const gone = buildManifest(lf, {
      ...emptyManifest(),
      files: [{ path: "docs/a/old.md", bytes: 1, sha256: "x" }],
    });
    expect(gone.files.map((f) => f.path)).toEqual(["docs/a/DOC-01-a.md"]);
  });

  it("reports manifest drift with the regenerate command", () => {
    const root = tree({ "docs/a/DOC-01-a.md": doc("DOC-01") });
    const current = buildManifest(root, {
      ...emptyManifest(),
      files: [{ path: "docs/a/DOC-01-a.md", bytes: 0, sha256: "", record_id: "DOC-01", title: "" }],
    });
    expect(manifestProblems(root, current)).toEqual([]);

    // Un byte distinto en el doc deja el manifiesto viejo.
    writeFileSync(join(root, "docs", "a", "DOC-01-a.md"), doc("DOC-01") + "\n");
    const messages = manifestProblems(root, current).map((p) => p.message);
    expect(messages).toContain("MANIFEST.json is out of date: run pnpm docs:manifest");
  });
});
