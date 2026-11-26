import { describe, expect, it } from "vitest";
import { serverBoundary } from "../../server-boundary.mjs";

// Simula el contexto que Vite le da al hook load en cada entorno.
function loadIn(consumer: "client" | "server", id: string) {
  const plugin = serverBoundary();
  const context = {
    environment: { config: { consumer } },
    error(message: string): never {
      throw new Error(message);
    },
  };
  return () => (plugin.load as (this: typeof context, id: string) => unknown).call(context, id);
}

describe("server/client boundary at build time", () => {
  it("fails the build when server code reaches the client bundle", () => {
    // Cubre lo que lint no ve: un barrel neutro que reexporta código de servidor.
    expect(loadIn("client", "/repo/src/lib/server/index.ts")).toThrow(/lib\/server/);
    expect(loadIn("client", "/repo/src/lib/content/server/query.ts?v=1")).toThrow();
  });

  it("allows server code on the server and client code on the client", () => {
    expect(loadIn("server", "/repo/src/lib/server/index.ts")()).toBeUndefined();
    expect(loadIn("client", "/repo/src/components/Card.tsx")()).toBeUndefined();
    expect(loadIn("client", "/repo/src/lib/serverless-note.ts")()).toBeUndefined();
  });
});
