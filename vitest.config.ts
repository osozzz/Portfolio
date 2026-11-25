/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// Vitest usa la configuración de Vite de Astro para poder renderizar componentes .astro.
export default getViteConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
