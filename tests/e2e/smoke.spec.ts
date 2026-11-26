import { expect, test } from "@playwright/test";

test("home renders the owner name", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Alejandro Osorno");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});
