// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";

// Salida estática por defecto; el adaptador queda listo para rutas bajo demanda (ADR-004).
export default defineConfig({
  site: "https://alejosorno.dev",
  integrations: [react()],
  adapter: vercel(),
});
