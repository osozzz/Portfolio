# 02 — Interface Architecture

DOC-20 through DOC-32 are the approved Interface Architecture package. DOC-32 is the master for **interface behavior**, not a blanket override of later color/content/CV or future technical domains.

## Canonical major spaces

`Home → Achievements → Arcade → Channel → Social → Contact`

Projects, Experience, Education and Certifications live inside Home. All six major destinations exist from V1.0; ADR-002 governs pre-release Coming Soon behavior.

## Personal Widget Field amendment

ADR-001 makes the central Personal Widget Field a signature structure. V1.0 supports controlled pin/unpin, logical reorder, supported S/M/L sizes, local versioned persistence and reset. Arbitrary pixel placement, overlaps and a freeform desktop remain out of scope.

## Reading rule

For interface work, follow DOC-19's task-aware order: governing ADRs → DOC-00 → DOC-32/interface owner → relevant DOC-20–DOC-31 detail → applicable visual/content/product constraints → existing code.

## Consistency status

`REVIEW-CROSS-DOCUMENT-CONSISTENCY-002`: **PASS**. Interface Architecture is synchronized with the approved visual/content baseline and release amendments.
