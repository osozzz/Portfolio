---
id: ADR-003
title: "Currently Building Source-of-Truth Boundary"
record_type: adr
decision_status: APPROVED
date: 2026-09-15
scope: "Currently Building / managed-status authority through V1.x"
affects:
  - DOC-03
  - DOC-25
  - DOC-36
  - DOC-41
  - DOC-43
  - DOC-44
  - DOC-49
supersedes:
  - "earlier wording that implied V1.x Admin/runtime DB editing was already approved"
---

# ADR-003 — Currently Building Source-of-Truth Boundary

## Context

Product and Interface planning correctly separated `Currently Building` from canonical project lifecycle status, but some approved wording described it as runtime-managed/Admin-editable while Content Architecture also materialized a repository `managed-status` source. Technical Architecture never created the runtime table/service, producing two plausible authorities.

## Decision

1. In the approved **V1.x baseline**, `Currently Building` is **repository-authored managed status** under the governed content workflow.
2. It is build/deploy-updated and may reference canonical projects, but it is not the canonical project lifecycle status.
3. V1.2 Admin does **not** receive a runtime `Currently Building` editor under the current baseline.
4. If runtime Admin editing is still desired later, a new source-of-truth migration ADR must define the DB schema/service, migration, fallback, rollback, cache and authoring changes before implementation.
5. Two writable authorities are never allowed simultaneously.

## Consequences

- V1.0 Home/Widget Field can render `Currently Building` without runtime DB availability.
- No `managed_status` table or `UpdateCurrentlyBuilding` backend command exists today.
- Admin remains focused on moderation/runtime safety rather than becoming a partial CMS.
- A later migration remains possible without changing the visual/product concept.
