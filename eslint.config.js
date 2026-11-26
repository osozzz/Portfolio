// @ts-check
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

const BOUNDARY_MESSAGE =
  "El código de servidor no se importa desde islas ni componentes de cliente (DOC-42 §13, DOC-51 §89).";

export default defineConfig(
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  {
    // Las islas .jsx también se revisan; el parser de TypeScript entiende JSX.
    files: ["src/**/*.jsx"],
    languageOptions: { parser: tseslint.parser },
  },
  {
    // Frontera servidor/cliente (DOC-42 §13): lo que llega al navegador no importa código de servidor.
    // Los scripts de cliente de un .astro aparecen como archivos virtuales "Demo.astro/0_0.ts".
    // ponytail: lint revisa archivo por archivo; un barrel neutro que reexporte servidor se escapa.
    // Si hace falta garantía total, agregar un guard de resolveId en Vite para el entorno cliente.
    files: [
      "src/{components,features,runtime}/**/*.{ts,tsx,js,jsx,mts}",
      "src/{layouts,pages}/**/*.astro/*.{ts,js}",
    ],
    // DOC-42 §102: cada feature puede tener su propio código de servidor.
    ignores: ["src/features/*/server/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/lib/server", "**/lib/server/**", "**/lib/*/server", "**/lib/*/server/**"],
              message: BOUNDARY_MESSAGE,
            },
          ],
        },
      ],
      // no-restricted-imports no revisa import() dinámico.
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportExpression[source.value=/lib.(\\w+.)?server([^a-z]|$)/]",
          message: BOUNDARY_MESSAGE,
        },
      ],
    },
  },
);
