import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import IndexPage from "../../src/pages/index.astro";

describe("home page", () => {
  it("renders the home page as static HTML", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(IndexPage);

    expect(html).toContain("<h1");
    expect(html).toContain("Alejandro Osorno");
    expect(html).toMatch(/<html[^>]*lang="es"/);
    // Cero JavaScript en el navegador: ni islas ni scripts en el arranque.
    expect(html).not.toContain("astro-island");
    expect(html).not.toContain("<script");
  });
});
