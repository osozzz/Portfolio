import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const root = new URL("../../", import.meta.url);
const publicDir = fileURLToPath(new URL("public/", root));
const MAX_TRACK_BYTES = 3 * 1024 * 1024; // DOC-49: ≤ 3 MB por pista

describe("audio license register", () => {
  it("registers every shipped music file and keeps each under budget", () => {
    // getCollection no carga datos dentro de Vitest; el esquema ya lo valida astro sync/check.
    type Track = { status: string; assets?: string[] };
    const tracks = parse(
      readFileSync(new URL("content/audio/licenses.yaml", root), "utf8"),
    ) as Track[];
    const declared = tracks.filter((t) => t.status === "shipped").flatMap((t) => t.assets ?? []);
    const onDisk = readdirSync(`${publicDir}audio/music`).map((name) => `audio/music/${name}`);

    // ADR-005 / DOC-19: ninguna pista entra al sitio sin su entrada en el registro.
    expect(onDisk.sort()).toEqual([...declared].sort());
    for (const asset of declared) {
      expect(statSync(`${publicDir}${asset}`).size, asset).toBeLessThanOrEqual(MAX_TRACK_BYTES);
    }
  });
});
