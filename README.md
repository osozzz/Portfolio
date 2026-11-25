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

## Desarrollo local

Requisitos:

- Node 26, según `.nvmrc`. fnm, nvm o cualquier gestor que lea `.nvmrc` lo cambia al entrar a la carpeta.
- pnpm 12.23.0, según `packageManager` en `package.json`. Sirve con `corepack enable` o con pnpm instalado aparte.

Primeros pasos:

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

El sitio queda en `http://localhost:4321`. El arranque no necesita variables de entorno; `.env.example` lista las que vaya pidiendo cada integración.

| Script | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo con recarga |
| `pnpm build` | Construye el sitio estático y la salida para Vercel |
| `pnpm preview` | Sirve localmente lo que dejó `build` |
| `pnpm typecheck` | Revisa tipos de TypeScript y Astro (`astro check`) |
| `pnpm lint` | ESLint, incluida la frontera entre servidor y cliente |
| `pnpm format` | Formatea con Prettier |
| `pnpm format:check` | Comprueba el formato sin cambiar archivos |
| `pnpm test` | Pruebas con Vitest |

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
