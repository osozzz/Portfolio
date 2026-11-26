import { defineConfig, devices } from "@playwright/test";

const url = "http://localhost:4322";

// Humo y accesibilidad sobre el build real (pnpm build antes); solo Chromium en STANDARD (DOC-51 §32).
export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: url },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "pnpm start --port 4322", url, reuseExistingServer: !process.env.CI },
});
