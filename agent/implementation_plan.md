# Development Plan
## CodeNova — B2B Hospitality Resource Exchange

**Project:** B2B Hospitality Resource Exchange (HackCelestial 3.0)
**Team:** CodeNova
**Document version:** 1.0
**Status:** Draft for review
**Based on:** PRD v1.0, System Architecture Document v1.0

---

## 1. Purpose

This plan converts the PRD's MVP scope and the Architecture Document's technical design into a sequenced, buildable roadmap. It exists so any team member can pick up a phase and start work without re-deriving decisions already made — every phase below maps directly to a feature in the PRD (§5–6) and a component in the Architecture doc (§3–6).

---

## 2. Guiding Principles

- **Build in dependency order, not feature-excitement order.** Auth and data models come before anything that depends on them, even though a nicer-looking Hero section is more fun to build first.
- **Server-side enforcement before UI polish.** A gate like `require_verified_provider` matters more, earlier, than animation on the Navbar.
- **MVP scope is fixed** to the PRD's Section 6 — nothing in Section 11 ("Out-of-Scope") gets built until every MVP milestone is done and demoed.
- **Every phase ends in something runnable**, even if incomplete — no phase should leave the project in a non-buildable state overnight.

---

## 3. Phase Roadmap

### Phase 0 — Project Setup
**Priority:** Critical (blocks everything) · **Dependencies:** None

- Initialize monorepo structure (`frontend/`, `backend/`) per Architecture §3.
- Scaffold Next.js app (TypeScript, Tailwind, App Router) and FastAPI app (routers/models/core folders).
- Set up PostgreSQL locally (Docker Compose recommended for parity with deployment).
- Create `.env.example` files for both halves (already defined in Architecture §9).
- Set up GitHub repo, branch protection on `main`, and a basic CI pipeline (lint + type-check on push).

**Definition of Done:** `npm run dev` boots the frontend, `uvicorn app.main:app --reload` boots the backend, `/health` returns `{"status": "ok"}`, and CI runs green on an empty commit.

---

### Phase 1 — Database & Core Models
**Priority:** Critical · **Dependencies:** Phase 0

- Implement SQLAlchemy models: `User`, `ProviderVerification`, `Resource`, `Booking` (Architecture §3.3, §6).
- Enforce the fixed five-category set (`VALID_CATEGORIES`) at the model/schema layer, not just the frontend dropdown (PRD §5.3).
- Write Pydantic schemas for every request/response shape (signup, login, verification, resource create, booking create).
- Add Alembic and generate the first migration (flagged in Architecture §11 as a gap to close before this phase is "done," not after).

**Definition of Done:** Tables create cleanly from a migration (not `create_all`), all foreign keys and enum constraints are enforced at the DB level, and a manual insert/query round-trip works for each model via a quick script or test.

---

### Phase 2 — Backend: Auth & Verification
**Priority:** Critical · **Dependencies:** Phase 1

- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout` — JWT in HTTP-only cookie (Architecture §5).
- `require_verified_provider` and `get_current_user` dependencies.
- `POST /api/verification/submit` (multipart with file upload, extension allow-list, UUID renaming per Architecture §8).
- `GET /api/verification/status`.
- Verification approval endpoint — **explicitly stub an admin-role check here**, don't defer it (closes the gap flagged in Architecture §11 before it becomes technical debt).

**Definition of Done:** A seeker can sign up and is immediately `verified`; a provider can sign up, is `unverified`, cannot access provider-only endpoints (verified by an automated test expecting 403), submits KYC, gets approved via the admin-gated endpoint, and can then access provider-only endpoints.

---

### Phase 3 — Backend: Resources & Search
**Priority:** High · **Dependencies:** Phase 2

- `POST /api/resources` (gated by `require_verified_provider`).
- `GET /api/resources` with category, radius (Haversine), price, and availability filtering (Architecture §4, §6.2).
- `GET /api/resources/mine`.
- Validate category against `VALID_CATEGORIES` at the Pydantic layer — reject anything else, including any residual "Audio"/"Gold Chain" values from old test data (PRD §5.3).

**Definition of Done:** An unverified provider gets 403 on create; a verified provider can create a resource in each of the five valid categories and gets a validation error on an invalid one; radius filtering returns correct results against at least 3 known-distance test fixtures.

---

### Phase 4 — Backend: Bookings, Deposits & Real-Time Engine
**Priority:** High · **Dependencies:** Phase 3

- `POST /api/bookings` — deposit hold, resource lock, WebSocket broadcast (Architecture §6.3).
- `POST /api/bookings/{id}/photo-audit` — deposit release/dispute, resource unlock, broadcast.
- `GET /api/bookings/mine`.
- `WebSocketManager` (connect/disconnect/broadcast) and the `/ws/resources` endpoint.
- Support both `planned` and `emergency` booking modes end-to-end (PRD §5.4).

**Definition of Done:** Booking a resource immediately removes it from a second, already-connected client's `GET /api/resources` results *and* pushes a live `resource.locked` event to that client without a refresh; approving a photo audit reverses both effects live.

---

### Phase 5 — Frontend: Auth & Onboarding Flows
**Priority:** Critical · **Dependencies:** Phase 2 (needs real endpoints to integrate against; can start on mock data in parallel with Phase 2)

- Login page, signup page (role selection), `AuthProvider` context.
- Verification (KYC) page — form + file upload, redirect-on-submit behavior.
- Wire real API calls, replacing the mock `login()` stub with actual `POST /api/auth/*` calls and cookie-based session checks.

**Definition of Done:** A real signup → KYC submission → verified-provider dashboard-access journey works against the live backend, not mock data.

---

### Phase 6 — Frontend: Discovery & Dashboard
**Priority:** High · **Dependencies:** Phase 3, Phase 5

- Hero with location + radius search (Architecture §3.1).
- `FilterPanel` (category, location, radius, date, price) with working Reset Filters.
- `ResourceCard` grid wired to real `GET /api/resources` results, not `mockData.ts`.
- Landing page category grid linking into the dashboard.

**Definition of Done:** Every filter combination reflects real backend query results; Reset Filters returns to the exact default state defined in `DEFAULT_FILTERS`.

---

### Phase 7 — Frontend: Real-Time & Booking Flow
**Priority:** High · **Dependencies:** Phase 4, Phase 6

- Replace the mock `useResourceSocket` initial data with a live fetch, keep the existing WebSocket reconciliation logic (it was written against the real event contract from the start).
- Wire the "Book / Request" and "4-Hour Emergency Dispatch" buttons to `POST /api/bookings`.
- Build a minimal booking confirmation state (replacing the placeholder `alert()`).

**Definition of Done:** Two browser sessions open on the dashboard at once; booking a resource in one session removes it from the other session's grid within ~1 second, with no manual refresh.

---

### Phase 8 — Integrations & Hardening
**Priority:** Medium · **Dependencies:** Phases 2–7 functionally complete

- Security headers middleware, CORS origin lock-down, HSTS (Architecture §8) — verify in a deployed-like environment, not just localhost.
- Rate limiting on auth endpoints (login/signup) to blunt brute-force attempts — smallest reasonable addition, not a full WAF.
- File upload validation hardening: confirm extension allow-list and size limits are actually enforced, not just declared.
- Swap local-disk file storage for S3-compatible storage if time allows (Architecture §7) — otherwise explicitly deferred, not silently skipped.

**Definition of Done:** A security checklist pass (headers present, cookies HttpOnly/Secure/SameSite, CORS scoped, file upload rejects bad extensions and oversized files) is completed and signed off by at least one other team member.

---

### Phase 9 — Testing
**Priority:** High · **Dependencies:** Runs alongside Phases 2–7, not after

- Backend: unit tests for category validation, radius filtering math, deposit state transitions, and the verified-provider gate (403 cases explicitly tested, not just happy paths).
- Frontend: at minimum, manual test scripts for the three end-to-end journeys (seeker search→book, provider signup→verify→list, live-lock across two sessions) — automated E2E (Playwright/Cypress) if time allows.
- Cross-browser smoke test of the dashboard (Chrome + at least one other).

**Definition of Done:** The three end-to-end journeys above pass manually or via automated test at least once before each deployment; backend unit tests cover every "Definition of Done" bullet listed in Phases 2–4.

---

### Phase 10 — Bug Fixing & Stabilization
**Priority:** High · **Dependencies:** Phase 9

- Triage all issues found in testing by severity: blocks a core journey (fix before demo) vs. cosmetic/edge case (log and defer).
- Re-run the three end-to-end journeys after each fix batch — don't declare stable on a single pass.

**Definition of Done:** Zero known issues that block any of the three core journeys; remaining known issues are logged with severity and explicitly deferred (not silently forgotten).

---

### Phase 11 — Deployment
**Priority:** Critical (for demo day) · **Dependencies:** Phase 10

- Provision managed PostgreSQL (Architecture §9).
- Deploy backend container to the chosen platform (Render/Railway/Fly.io) with real secrets set.
- Deploy frontend (Vercel or alongside backend).
- Point `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL` at the deployed backend; confirm CORS origin matches the deployed frontend URL exactly.
- Run the three end-to-end journeys against the deployed environment, not just localhost.

**Definition of Done:** All three core journeys work against the public deployed URL, over HTTPS, with no console errors and no CORS failures.

---

## 4. Milestones Summary

| Milestone | Phases included | Exit criteria |
|---|---|---|
| **M1 — Foundation** | 0, 1 | Project boots end-to-end; schema migrated and verified |
| **M2 — Core Backend** | 2, 3, 4 | All API endpoints from Architecture §4 functional and tested in isolation (e.g. via `/docs`) |
| **M3 — Core Frontend** | 5, 6, 7 | All three user journeys work locally against the live backend |
| **M4 — MVP Complete** | 8, 9, 10 | Security checklist passed; zero blocking bugs on core journeys |
| **M5 — Demo Ready** | 11 | Deployed, public, HTTPS, all three journeys verified live |

---

## 5. Dependency Graph (Summary)

```
Phase 0 (Setup)
   └─▶ Phase 1 (DB & Models)
          └─▶ Phase 2 (Auth & Verification) ──┬─▶ Phase 5 (Frontend Auth/Onboarding)
                 └─▶ Phase 3 (Resources) ──────┼─▶ Phase 6 (Frontend Discovery)
                        └─▶ Phase 4 (Bookings/Real-time) ─▶ Phase 7 (Frontend Real-time/Booking)
                                                                   └─▶ Phase 8 (Hardening)
                                                                          └─▶ Phase 9 (Testing)
                                                                                 └─▶ Phase 10 (Stabilization)
                                                                                        └─▶ Phase 11 (Deployment)
```
Phase 9 (Testing) should run continuously alongside Phases 2–7, not strictly after — the sequential arrow above reflects when it must be *complete*, not when it starts.

---

## 6. MVP Scope Recap

Matches PRD §6 exactly — restated here so this plan is self-contained:

**In:** role-based auth, provider KYC gating, five-category resource CRUD, location+radius+category+price search with Reset Filters, planned + emergency bookings, deposit hold→audit→release workflow, live WebSocket availability updates.

**Out (do not build until MVP milestones are done):** real payment gateway, admin KYC review dashboard, automated damage assessment, Seeker↔Provider messaging, multi-currency/region, native mobile apps.

---

## 7. Definition of Done (Project-Level)

The project is ready for demo/handoff when **all** of the following hold:

- [ ] Every phase-level Definition of Done above is satisfied.
- [ ] All three core user journeys work end-to-end on the deployed URL:
  1. Seeker searches (category + radius + price) and books a resource.
  2. Provider signs up, completes KYC, gets verified, lists a resource.
  3. A booking made in one browser session removes the resource live in a second, already-open session.
- [ ] Security checklist (Phase 8) signed off.
- [ ] No known bug blocks any of the three journeys.
- [ ] README accurately reflects what's wired vs. stubbed (no undocumented gaps).
- [ ] PRD, Architecture Document, and this Development Plan are all consistent with the shipped system — update any doc that's drifted, rather than letting code and docs disagree.

---

*End of document.*
