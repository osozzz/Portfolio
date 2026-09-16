# Contributing

This repository currently has a single human project owner and maintainer: **Alejandro Osorno (`@osozzz`)**.

## Source of truth

Before changing product behavior, architecture, interface rules, security boundaries, data ownership, or release scope, read the relevant documents in `/docs` and applicable ADRs in `/docs/decisions`.

Authority order:

1. approved ADRs;
2. canonical domain specification;
3. dependent approved specifications;
4. implementation notes;
5. existing code.

Existing code does not override an approved specification.

## Workflow

1. Start from an assigned GitHub Issue.
2. Confirm acceptance criteria and dependencies.
3. Branch from the latest `main` using a short-lived branch.
4. Keep the change scoped to the Issue.
5. Add or update tests required by the affected contract.
6. Update canonical documentation when behavior or architecture changes.
7. Open a Pull Request and complete its checklist.
8. Resolve review findings and required checks.
9. Squash merge after the PR is ready.

Do not create permanent `develop`, `staging`, or release branches.

## Branch naming

Use a concise intent prefix, for example:

- `feat/...`
- `fix/...`
- `chore/...`
- `docs/...`
- `test/...`
- `refactor/...`
- `security/...`

## Commit and authorship policy

Commit messages should describe the actual change clearly. The human project owner remains the author responsible for project work.

Automated tools must not add authorship or co-authorship trailers, credit notices, generated-by notices, promotional attribution, badges, or equivalent provenance metadata unless the project owner explicitly requests it for a specific external dependency or legal requirement.

## Pull Requests

A PR should include:

- linked Issue;
- concise summary;
- tests/verification performed;
- screenshots or recordings when visual behavior changes;
- documentation/ADR impact;
- migration impact;
- security/privacy impact;
- known limitations.

## Architecture changes

Do not silently change an approved architecture decision. If an implementation uncovers a genuine conflict, stop and raise a decision proposal or ADR before changing the contract.

## Security

Do not commit secrets, credentials, private tokens, production data, or sensitive user content. Follow `SECURITY.md` and the security architecture in `/docs`.
