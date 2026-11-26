import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home has no detectable accessibility violations", async ({ page }) => {
  await page.goto("/");
  // WCAG 2.2 AA (DOC-11); axe detecta una parte, la revisión manual sigue siendo necesaria.
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations).toEqual([]);
});
