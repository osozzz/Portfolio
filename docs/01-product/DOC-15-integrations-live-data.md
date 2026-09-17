---
id: DOC-15
title: "External Integrations & Live-Data Requirements"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-08
  - DOC-12
decision_families:
  - INT
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-15 — External Integrations & Live-Data Requirements

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Integration philosophy

External services enhance the system but do not own the professional core. Browser components generally consume the portfolio's normalized server/data layer rather than provider secrets or provider-specific response shapes directly.

## 2. GitHub

Potential uses: recent public commits/releases/repository activity and repository links. Requirements:

- only public-safe repository data;
- server/cache normalization where needed;
- provider rate limits respected;
- commit count is not treated as productivity or project completion;
- private work stays private unless an intentional aggregate is authored separately;
- feed failure degrades locally.

## 3. Tech Pulse/news

The product should use curated external technology sources rather than scraping arbitrary web content on every visitor request. Server-side refresh/cache normalizes source, title, link, date/category/summary where legally appropriate. UI attributes source and links externally.

Exact provider/source list is deferred and should be selected for reliability, terms and API/licensing constraints.

## 4. Contact email

Contact submission calls server-side delivery provider (candidate Resend). Credentials remain server-side. Delivery success should be based on provider/server acceptance; retries/idempotency and bounce/error handling are considered in detailed architecture.

## 5. Anti-bot

Candidate Cloudflare Turnstile or equivalent can protect high-abuse public writes. Use only where needed; challenge failure must be accessible and recoverable.

## 6. Database/Auth/Storage

Candidate Supabase/PostgreSQL/Auth/Storage. Public client access is constrained by RLS/explicit policies. Service role is server-only. Exact schema and auth configuration belong to Data/Security Architecture.

## 7. Analytics/error monitoring

Candidate privacy-friendly analytics and Sentry-style error monitoring. Instrument events through centralized wrappers, not direct vendor calls in every feature. Do not send sensitive message/drawing/terminal payloads.

## 8. RenderCV

RenderCV is a build/content tool integration, not a runtime dependency for every visitor. Structured EN/ES source is validated and rendered during local/CI build; generated PDFs/previews are public static artifacts.

## 9. Dynamic Open Graph

Project-specific OG images may use server/build generation. They should derive from canonical project metadata and never block the normal route if generation fails.

## 10. Failure isolation

Each integration defines: timeout, cache/stale strategy, empty/error UI, retry policy, rate-limit behavior and what remains functional during outage. There is no full-page spinner while GitHub/news loads.

## 11. Webhooks/idempotency

Current portfolio has no payment webhooks. If any provider uses webhooks later (email events, content pipeline, etc.), validate signatures where available, deduplicate/idempotently process retries and store only necessary metadata.

## 12. Provider abstraction rule

Do not build elaborate provider-abstraction frameworks preemptively. Wrap integrations at sensible service boundaries so a provider can be replaced without leaking secrets/response shapes through UI.

## 13. Decisions

- **INT-001** External feeds are enhancement layers; portfolio core remains independent.
- **INT-002** Provider credentials never belong in public browser code.
- **INT-003** GitHub activity is contextual evidence, not an automated progress metric.
- **INT-004** Tech Pulse visibly attributes original sources.
- **INT-005** RenderCV generation runs outside the runtime visitor path.
- **INT-006** External integration failure is localized and cache-aware.
