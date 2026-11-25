// @ts-check
import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Generado, línea base de docs y carpetas locales que no se suben.
  {
    ignores: [
      "dist/",
      ".astro/",
      ".vercel/",
      "docs/",
      "plans/",
      "references/",
      ".remember/",
      ".superpowers/",
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  {
    // Frontera servidor/cliente: el código que llega al navegador no importa src/lib/server.
    // El glob también cubre los scripts de cliente de un .astro, que ESLint ve como "Demo.astro/0_0.ts".
    files: ["src/{components,features,runtime}/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/lib/server/**"],
              message:
                "El código de servidor no se importa desde islas ni componentes de cliente (DOC-42, DOC-51 §89).",
            },
          ],
        },
      ],
    },
  },
);
