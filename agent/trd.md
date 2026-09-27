# System Architecture Document
## CodeNova — B2B Hospitality Resource Exchange

**Project:** B2B Hospitality Resource Exchange (HackCelestial 3.0)
**Team:** CodeNova
**Document version:** 1.0
**Status:** Draft for review

---

## 1. Overview

This document describes the practical, MVP-appropriate architecture for a B2B marketplace where hospitality businesses (hotels, caterers, venues, event managers) list, discover, rent, and share underutilized assets — commercial kitchens, banquet halls, catering equipment, refrigerated transport, and event furniture — with verified onboarding, real-time availability, and deposit-protected bookings.

The architecture favors a small number of well-understood, boring technologies over a distributed/microservices approach. A single frontend app, a single backend service, one relational database, and one real-time channel are sufficient for the MVP's actual load and team size; splitting further would add operational overhead without a corresponding benefit at this stage.

---

## 2. Recommended Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion | Fast to build a polished UI; server/client components handle both the marketing landing page and the interactive dashboard well; Tailwind + shadcn avoid design-system busywork |
| Backend | FastAPI (Python) | Async-native (needed for WebSockets), automatic OpenAPI docs, Pydantic validation matches the "strict category / strict schema" requirements directly |
| Database | PostgreSQL | Relational integrity matters here (bookings ↔ resources ↔ users ↔ deposits); JSON columns available if flexible fields are needed later |
| Cache / real-time backing store | Redis | Session/rate-limit support now; becomes the pub/sub backbone if WebSocket delivery needs to scale beyond one process (see §12) |
| Real-time transport | Native WebSockets (FastAPI) | Direct fit for "resource locked/released, pushed live" — no need for a heavier message broker at MVP scale |
| Auth | JWT in HTTP-only cookies | Avoids storing tokens in localStorage (XSS-safer); stateless verification on the backend |
| File storage (KYC docs, resource images) | Local disk (MVP) → S3-compatible object storage (production) | Local disk is fine for a hackathon demo; the interface is written so swapping to S3 is a config change, not a rewrite |
| Deployment | Single VM or container platform (e.g., Docker Compose → Render/Railway/Fly.io) | No Kubernetes needed at this scale; a container platform gives easy rollbacks and env-var secrets management |

---

## 3. High-Level System Components

```
┌─────────────────────┐      HTTPS (REST)       ┌──────────────────────┐
│   Next.js Frontend   │ ───────────────────────▶│   FastAPI Backend    │
│  (Vercel / Node host)│ ◀───────────────────────│  (Docker container)  │
└─────────┬────────────┘      WSS (WebSocket)     └──────────┬───────────┘
          │                                                   │
          │                                                   ▼
          │                                        ┌─────────────────────┐
          │                                        │     PostgreSQL       │
          │                                        │ (users, resources,   │
          │                                        │  bookings, KYC)      │
          │                                        └─────────────────────┘
          │                                                   │
          │                                                   ▼
          │                                        ┌─────────────────────┐
          └───────────────────────────────────────▶│   Object Storage /   │
                                                     │   Local Disk (KYC,   │
                                                     │   resource images)   │
                                                     └─────────────────────┘
                                                                │
                                                                ▼
                                                     ┌─────────────────────┐
                                                     │   Redis (sessions,   │
                                                     │   rate limiting,      │
                                                     │   pub/sub — phase 2)  │
                                                     └─────────────────────┘
```

### 3.1 Frontend
- Next.js App Router serving the public landing page, auth pages (login/signup), the KYC verification form, and the authenticated dashboard.
- Client components handle interactive state (filters, live resource grid); server components handle static/marketing content.
- A single WebSocket hook (`useResourceSocket`) maintains one live connection per browser tab and reconciles incoming lock/release events into local state.

### 3.2 Backend (FastAPI)
Organized as one service with clearly separated routers, not separate microservices:
- `auth` — signup, login, logout, JWT cookie issuance.
- `verification` — KYC submission, status check, approval.
- `resources` — listing, radius/category/price search, verified-provider-gated creation.
- `bookings` — booking creation (deposit hold + calendar lock), photo-audit review (deposit release).
- `ws` — the WebSocket endpoint that pushes `resource.locked` / `resource.released` events.

A shared `core` module holds cross-cutting concerns: database session management, JWT/password utilities, the auth dependency (`require_verified_provider`), and the WebSocket connection manager.

### 3.3 Database (PostgreSQL)
Core tables: `users`, `provider_verifications`, `resources`, `bookings`. Relationships are enforced with foreign keys (a booking always references a valid resource and seeker; a resource always references a valid provider) so the database — not just application code — guarantees referential integrity.

### 3.4 File storage
KYC identity documents and resource images are stored outside the database (large binary data doesn't belong in Postgres rows). MVP uses local disk under an `uploads/` directory; the storage access is behind a small interface so it can be swapped for S3/Cloud Storage without touching router logic.

---

## 4. APIs

All endpoints are versioned implicitly under `/api/*` for now; a `/api/v1/*` prefix is a one-line change if a breaking v2 is ever needed.

| Method | Endpoint | Purpose | Auth required |
|---|---|---|---|
| POST | `/api/auth/signup` | Create account (seeker or provider) | No |
| POST | `/api/auth/login` | Authenticate, set session cookie | No |
| POST | `/api/auth/logout` | Clear session cookie | Yes |
| POST | `/api/verification/submit` | Submit KYC (business name, tax ID, ID upload, address) | Yes (provider) |
| GET | `/api/verification/status` | Check own verification status | Yes |
| POST | `/api/verification/{user_id}/approve` | Approve a provider's KYC (admin-only in production) | Yes (admin) |
| GET | `/api/resources` | Search/list resources (category, radius, price, availability filters) | No |
| POST | `/api/resources` | Create a resource listing | Yes (verified provider) |
| GET | `/api/resources/mine` | List the current provider's own resources | Yes (verified provider) |
| POST | `/api/bookings` | Create a booking; holds deposit, locks calendar, broadcasts lock | Yes |
| POST | `/api/bookings/{id}/photo-audit` | Approve/dispute post-event photo audit; releases deposit, broadcasts release | Yes (provider/admin) |
| GET | `/api/bookings/mine` | List the current seeker's bookings | Yes |
| WS | `/ws/resources` | Real-time push of lock/release events | No (public read channel) |

REST is sufficient here — the domain doesn't need GraphQL's flexible querying, and REST keeps the OpenAPI docs FastAPI generates automatically useful and simple.

---

## 5. Authentication & Authorization

- **Mechanism:** JWT, signed with a server-side secret, delivered via an `HttpOnly`, `Secure`, `SameSite=Lax` cookie — never exposed to client-side JavaScript, which closes off the most common token-theft vector (XSS reading localStorage).
- **Roles:** `seeker` and `provider`, stored on the `User` row. A `verification_status` field (`unverified` → `pending` → `verified` / `rejected`) gates provider-only actions.
- **Enforcement is server-side, not just UI-side.** The frontend redirects an unverified provider to the KYC screen for UX, but the actual protection is the `require_verified_provider` FastAPI dependency on resource-creation endpoints — a direct API call from an unverified provider is rejected with 403 regardless of what the UI shows.
- **Admin actions** (KYC approval) are a separate concern from provider/seeker auth; production should add an explicit `admin` role and gate `/api/verification/{user_id}/approve` behind it (flagged as a known gap — see §11).

---

## 6. Data Flow

### 6.1 Provider onboarding
1. Provider signs up → `unverified` status, redirected to `/verify`.
2. Submits KYC form (multipart: business name, tax ID, address, ID file) → file saved to storage, `ProviderVerification` row created, status → `pending`.
3. Admin (or auto-check, post-MVP) approves → status → `verified`.
4. Provider can now call `POST /api/resources`.

### 6.2 Search & discovery
1. Seeker's frontend calls `GET /api/resources` with category/location/radius/price query params.
2. Backend filters at the SQL layer (category, price, availability) then applies Haversine distance filtering in-process for radius.
3. Results render as cards; "Reset Filters" simply clears query params back to defaults and re-fetches.

### 6.3 Booking & deposit lifecycle
1. Seeker requests a booking (`planned` or `emergency` mode) → backend verifies the resource is still available, creates a `Booking` row with `deposit_status = held`, flips `resource.is_pre_booked = True`.
2. Backend broadcasts `resource.locked` over the WebSocket → every connected client's dashboard removes that resource from "Available Now" instantly, without polling.
3. After the rental period, a photo audit is reviewed (`POST /bookings/{id}/photo-audit`).
4. On approval: `deposit_status = released`, `resource.is_pre_booked = False`, and a `resource.released` event is broadcast so the resource reappears live.
5. On rejection: `deposit_status = disputed`, held for manual resolution (dispute-handling UI is out of scope for MVP — see PRD).

---

## 7. Storage

| Data type | Where | Notes |
|---|---|---|
| Structured data (users, resources, bookings, verification records) | PostgreSQL | Source of truth; all business rules (uniqueness, foreign keys, valid categories) enforced here and re-validated at the API layer |
| KYC identity documents | Local disk (MVP) / S3-compatible bucket (production) | Never served directly to the public; access should be signed-URL or backend-proxied, not a public static path |
| Resource images | Local disk (MVP) / S3-compatible bucket + CDN (production) | Public-facing, so a CDN in front of object storage is the right upgrade path once traffic justifies it |
| Session state | JWT (stateless) | No server-side session store needed for MVP; Redis session storage is a phase-2 upgrade only if token revocation-before-expiry becomes a requirement |

---

## 8. Security

- **Transport:** HTTPS/TLS enforced everywhere in production; HSTS header set (`Strict-Transport-Security`) so browsers refuse to downgrade to plain HTTP after first visit.
- **Session security:** HTTP-only, Secure, SameSite cookies for JWTs — mitigates XSS-based token theft and most CSRF vectors (SameSite=Lax) without needing a separate CSRF token scheme at MVP scale.
- **Input validation:** Every request body is a Pydantic model with explicit types and constraints (e.g., `category` must be one of the five valid values, `daily_rate > 0`) — invalid input is rejected before it reaches business logic, not sanitized after the fact.
- **Password storage:** Bcrypt via `passlib`, never plaintext or reversible encryption.
- **File upload safety:** KYC uploads are restricted to an allow-list of extensions (`.pdf`, `.jpg`, `.jpeg`, `.png`) and renamed to a generated UUID on save, so the original filename (and any path-traversal attempt in it) never reaches the filesystem.
- **CORS:** Restricted to the known frontend origin, with `allow_credentials=True` only for that origin — not a wildcard.
- **Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` applied on every response.
- **Authorization gates enforced server-side**, per §5 — the UI redirect is a convenience, not the security boundary.
- **Known gap (flagged, not hidden):** the KYC-approval endpoint needs a real admin-role check before this goes past a demo; documented in §11.

---

## 9. Deployment

MVP-appropriate, not over-engineered:

- **Frontend:** deployed to a Node-friendly host (e.g., Vercel) or as a container alongside the backend — either works; Vercel is simplest if the team wants zero-ops frontend hosting.
- **Backend:** single Docker container running `uvicorn`, deployed to a container platform (Render, Railway, Fly.io) or a single VM behind a reverse proxy (Caddy/Nginx) for TLS termination.
- **Database:** managed PostgreSQL (e.g., the platform's built-in Postgres add-on, or Supabase/Neon) rather than self-hosting — removes backup/patching burden for a small team.
- **Environment/secrets:** `.env` files locally, platform-native secret managers in deployed environments; secrets are never committed (see `.env.example` files in the repo).
- **CI:** a single pipeline (GitHub Actions is sufficient) running lint + type-check + basic tests on push; deploy-on-merge-to-main is enough at this stage — no blue/green or canary complexity needed yet.

No container orchestration platform (Kubernetes, ECS, etc.) is recommended at MVP scale — it solves problems (multi-node scheduling, complex rollout strategies) this project doesn't have yet, at a real cost in operational complexity.

---

## 10. Monitoring

Kept minimal and practical for MVP:

- **Health check:** `/health` endpoint already implemented — wire it into the deployment platform's built-in uptime monitor.
- **Application logs:** structured logging (request method/path/status/latency) shipped to the platform's built-in log viewer; no dedicated log-aggregation stack needed until traffic justifies it.
- **Error tracking:** a lightweight APM/error tool (e.g., Sentry) on both frontend and backend — highest value-per-effort addition for catching real user-facing errors early.
- **WebSocket health:** track active-connection count and broadcast failures in logs; the frontend already reconnects with backoff on drop, which covers the common failure mode.
- **Database:** rely on the managed Postgres provider's built-in metrics (connections, slow queries) rather than standing up custom monitoring.

---

## 11. Known Gaps / Explicitly Deferred

Matches the PRD's out-of-scope list — called out here so the architecture doesn't silently assume they exist:

- Real payment gateway integration for deposit authorization/charge (currently a stubbed no-op at the booking step).
- Admin role and admin review dashboard for KYC (a functional but ungated approval endpoint exists for demo purposes only).
- Real geocoding/autocomplete provider for location search (radius filtering math is real; the location input itself is a plain text field).
- Database migrations via Alembic (tables are created via `Base.metadata.create_all` for the demo; production needs versioned migrations before the schema changes again).
- Seeker–Provider negotiation/messaging channel.
- Multi-region deployment or horizontal WebSocket scaling (see §12 for the upgrade path if this becomes necessary).

---

## 12. Scalability

The MVP architecture is intentionally single-instance and should stay that way until real usage demands otherwise. If/when scale requires it:

- **Backend horizontal scaling:** FastAPI is stateless per-request (auth is JWT, not server-side sessions), so adding more backend instances behind a load balancer is straightforward — *except* for the WebSocket connection manager, which currently holds connections in-process. Scaling beyond one backend instance requires moving WebSocket broadcast to Redis pub/sub (each instance subscribes and re-broadcasts to its own connected clients) — this is the reason Redis is already in the recommended stack, ready for that upgrade without a rewrite.
- **Database scaling:** read replicas for the search-heavy `GET /api/resources` path if read load grows; the write path (bookings, verification) is naturally low-volume relative to search traffic.
- **Caching:** category/location search results are a natural candidate for short-TTL Redis caching if search volume grows faster than listing volume.
- **File storage:** local disk → S3-compatible storage + CDN is the first infrastructure upgrade to make, before any compute scaling — it's also a prerequisite for running more than one backend instance (local disk isn't shared across instances).
- **Explicitly avoid premature scaling work:** no microservices split, no message queue, no multi-region deployment until a specific, measured bottleneck justifies the added operational cost.

---

*End of document.*
