/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// Vitest usa la configuración de Vite de Astro para poder renderizar componentes .astro.
// Sin "include": el patrón por defecto encuentra pruebas en tests/ y junto al código (DOC-50 §80).
export default getViteConfig({ test: {} });
