/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";
import { configDefaults } from "vitest/config";

// Vitest usa la configuración de Vite de Astro para poder renderizar componentes .astro.
// Las pruebas de tests/e2e son de Playwright y corren con pnpm test:e2e / test:a11y.
export default getViteConfig({ test: { exclude: [...configDefaults.exclude, "tests/e2e/**"] } });
