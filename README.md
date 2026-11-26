# Alejandro Osorno — Portfolio

Interactive personal portfolio for **alejosorno.dev**.

The site is designed as a responsive personal-computing environment: project-first, bilingual, accessible, performance-conscious, and intentionally more like software to explore than a conventional portfolio page.

## Inspiration

This portfolio is inspired by **iiSU's spatial navigation, widget-centric layouts, and soft console-like interaction model**. The visual system, components, code, assets, and implementation in this repository are original to this project, and the portfolio is not affiliated with iiSU.

## Project status

**Current phase:** V0 — Repository & Project Bootstrap

The product, interface, visual system, technical architecture, security model, testing strategy, and delivery workflow have been specified and audited before implementation.

## Product spaces

The global navigation is organized around six spaces:

- Home
- Achievements
- Arcade
- Channel
- Social
- Contact

The professional core includes Projects, Experience, Education, Certifications, CV, bilingual content, responsive behavior, theme controls, accessibility preferences, and the personalizable Widget Field.

## Documentation

The canonical, versioned project documentation lives in [`/docs`](./docs/README.md).

Start with:

- [`DOC-00 — Master Guide`](./docs/00-project/DOC-00-master-guide.md)
- [`DOC-02 — Scope & Release Boundaries`](./docs/00-project/DOC-02-scope-release-boundaries.md)
- [`DOC-32 — Interface Architecture Master Specification`](./docs/02-interface-architecture/DOC-32-interface-master-spec.md)
- [`DOC-41 — Technical Architecture Master Blueprint`](./docs/04-technical-architecture/DOC-41-technical-architecture-master-blueprint.md)
- [`DOC-51 — Repository, CI/CD & Developer Experience`](./docs/04-technical-architecture/DOC-51-repository-cicd-developer-experience-implementation.md)

Architectural decisions live in [`/docs/decisions`](./docs/decisions/README.md).

The GitHub Wiki is intentionally a lighter navigation/help layer with summaries, quickstarts, useful links, troubleshooting, and references. It does **not** replace `/docs` as the source of truth.

## Release roadmap

- **V0** — Foundation and implementation bootstrap
- **V1.0** — Professional core
- **V1.1** — Personality and discovery
- **V1.2** — Community and moderation
- **V1.3** — Arcade
- **V1.4** — Live integrations

## Local development

Requirements:

- Node 26, as pinned in `.nvmrc`. We use [fnm](https://github.com/Schniz/fnm) with `--use-on-cd`, which switches to that version when you enter the folder.
- pnpm 12.23.0, as pinned in `packageManager` in `package.json`.

Getting started:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
cp .env.example .env.local
pnpm dev
```

The site runs at `http://localhost:4321`. The bootstrap needs no environment variables; `.env.example` lists the ones each integration adds.

| Script | What it does |
|---|---|
| `pnpm dev` | Development server with hot reload |
| `pnpm build` | Builds the static site and the Vercel output |
| `pnpm start` | Serves the output of `build` locally |
| `pnpm typecheck` | Type-checks TypeScript and Astro (`astro check`) |
| `pnpm lint` | ESLint, including the server/client boundary |
| `pnpm format` | Formats with Prettier |
| `pnpm format:check` | Checks formatting without changing files |
| `pnpm test:unit` | Unit, architecture, content and docs-tooling tests with Vitest |
| `pnpm test:e2e` | Chromium smoke test against the built site (Playwright; run `pnpm build` first) |
| `pnpm test:a11y` | axe accessibility check (WCAG 2.2 AA tags) against the built site |
| `pnpm test:perf` | Initial JS/CSS budget per route over `dist/` (DOC-49) |
| `pnpm content:validate` | Validates content collections such as the audio license register |
| `pnpm docs:validate` | Checks docs front matter, IDs, references, fences, secret values and `MANIFEST.json` |
| `pnpm docs:manifest` | Regenerates `MANIFEST.json` after a docs change |
| `pnpm verify:fast` | Everything the `quality / fast` CI check runs |
| `pnpm verify:standard` | FAST plus build, budgets, smoke and accessibility (`quality / standard`) |

`lint` and `format` cover `src/`, `tests/`, `scripts/`, `.github/` and the root config files. When a new code folder appears (for example `supabase/`), add it to both scripts in `package.json`.

The server/client boundary (DOC-42 §13) is enforced twice. ESLint rejects client imports of `src/lib/server` and `src/lib/*/server`, and the build fails if any of that code reaches the browser bundle.

## Development workflow

The repository follows trunk-based development:

1. Work starts from an Issue.
2. Create a short-lived branch from `main`.
3. Implement and validate the scoped change.
4. Open a Pull Request.
5. Required checks and review criteria must pass.
6. Squash merge into `main`.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the operational workflow.

## Ownership and reuse

Project owner and maintainer: **Alejandro Osorno** (`@osozzz`).

This repository is public for transparency, portfolio review, and educational inspection. **No open-source license is granted at this time.** Unless a specific file or dependency states otherwise, the source code, portfolio content, visual identity, artwork, and original project materials remain copyright © Alejandro Osorno. Reuse, redistribution, or derivative works are not authorized by the repository's public visibility alone.
