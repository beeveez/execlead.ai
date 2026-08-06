# EXECLEAD.AI — Brand Governance Standard™ v1.0

**Status:** Governance · **Priority:** High

EXECLEAD.AI teaches evidence-based leadership. Its own brand must evolve the same
way — by evidence, not opinion. This standard protects the brand from future
fragmentation.

---

## 1. Brand Source of Truth

**BrandRegistry™** (`src/lib/brandRegistry.js`) is the **only** approved source for:

- Mission · Vision · Positioning · Tagline · Category
- Value Proposition · Product Philosophy · Messaging Hierarchy
- SEO Description · Meta Description · Audience Messaging

All marketing surfaces **import** from `BrandRegistry`. They do not hardcode.

---

## 2. Prohibited

Do **not** hardcode any of the following without referencing `BrandRegistry`:

- Product descriptions
- Positioning statements
- Mission · Vision · Category · Tagline · Value Proposition
- Marketing headlines that duplicate canonical strings

---

## 3. Approved Terminology™

| Term | Usage |
|---|---|
| Executive Leadership Operating System™ | Primary category |
| Executive Readiness™ | Core measurable outcome |
| Leadership Intelligence Engine™ | Platform intelligence layer |
| Executive Journey™ | User development arc |
| Executive Identity™ | Verified leadership profile |
| Executive Outcomes™ | Measurable results |
| Evidence Engine™ | Evidence generation |
| EXEC™ | Product/cursor shorthand |
| Technology Leadership | Beachhead market (intentional) |

`Technology Leadership` is the **beachhead market** and is intentionally retained
where it describes market focus. It is **not** brand drift.

---

## 4. Brand Validation Engine™

`src/lib/brandValidationEngine.js` automatically scans surfaces for:

- Duplicate messaging (canonical strings hardcoded as literals)
- Hardcoded positioning
- Legacy phrases (`BrandRegistry.governance.legacyPhrases`)
- Brand drift
- Inconsistent terminology
- Approved-terminology coverage

It reports a **Brand Compliance %**. Terminology and legacy-phrase rules are
sourced from `BrandRegistry.governance` — the engine itself hardcodes nothing.

---

## 5. Change Management — Brand Review™

A **Brand Review™** is required before modifying any of:

- `mission` · `vision` · `headline` · `tagline`
- `positioning.category` · `positioning.valueProposition`
- `positioning.primaryStatement` · `positioning.philosophy`

These fields are listed in `BrandRegistry.governance.changeControlFields`.
Changes must be intentional, recorded, and propagated to every dependent
surface (they update automatically when sourced from the registry).

---

## 6. Success Criteria

- One consistent story across every entry point.
- Brand changes are intentional, measurable, and governed.
- `BrandRegistry` remains the single source of truth.

**One Leadership Journey. One AI Platform. One Brand Voice.**