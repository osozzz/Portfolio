// @ts-check

// Código de servidor según DOC-42 §13: src/lib/server/** y src/lib/<área>/server/**.
const SERVER_ONLY = /\/src\/lib\/(?:[^/]+\/)?server\//;

/**
 * Plugin de Vite: si un módulo de servidor termina en el bundle del navegador, el build falla.
 * Cubre lo que ESLint no ve archivo por archivo, como un barrel neutro que reexporta servidor.
 * @returns {import("vite").Plugin}
 */
export function serverBoundary() {
  return {
    name: "server-boundary",
    load(/** @type {string} */ id) {
      if (this.environment.config.consumer !== "client") return;
      if (SERVER_ONLY.test(id.replaceAll("\\", "/"))) {
        this.error(
          `${id} es código de servidor y no puede llegar al navegador (DOC-42 §13, DOC-51 §89).`,
        );
      }
    },
  };
}
