// pnpm docs:validate — revisa la documentación canónica y que MANIFEST.json esté al día (DOC-51 §28).
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { checkDocs } from "./checks.ts";
import { manifestProblems, type Manifest } from "./manifest.ts";

const root = process.cwd();
const paths = readdirSync(join(root, "docs"), { withFileTypes: true, recursive: true })
  .filter((item) => item.isFile() && item.name.endsWith(".md"))
  .map((item) => relative(root, join(item.parentPath, item.name)).split(sep).join("/"))
  .concat("README.md")
  .sort();

const files = paths.map((path) => ({ path, text: readFileSync(join(root, path), "utf8") }));
const manifest = JSON.parse(readFileSync(join(root, "MANIFEST.json"), "utf8")) as Manifest;
const problems = [...checkDocs(files), ...manifestProblems(root, manifest)];

for (const { file, message } of problems) console.error(`${file}: ${message}`);
console.log(problems.length === 0 ? `docs: ${files.length} files OK` : `docs: ${problems.length} problem(s)`);
process.exitCode = problems.length === 0 ? 0 : 1;
