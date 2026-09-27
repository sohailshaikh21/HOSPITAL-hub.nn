# Product Requirements Document
## CodeNova — B2B Hospitality Resource Exchange

**Project:** B2B Hospitality Resource Exchange (HackCelestial 3.0)
**Team:** CodeNova
**Document version:** 1.0
**Status:** Draft for review

---

## 1. Overview

CodeNova is building a B2B marketplace that lets hospitality businesses — hotels, caterers, event venues, and event managers — list, discover, rent, negotiate, and share underutilized physical assets (commercial kitchens, banquet halls, catering equipment, refrigerated transport, furniture/decor) with real-time availability tracking, refundable security deposits, and verified-business onboarding.

The platform's core insight: hospitality businesses routinely own expensive equipment and space that sits idle most of the year (a banquet hall on a weekday, a walk-in freezer truck between events, extra chafing dishes). A trusted, verified B2B exchange turns this idle capacity into revenue for owners and cheaper short-term access for renters — without the fraud and no-show risk of an open consumer classifieds site.

---

## 2. Problem Statement

Hospitality businesses face two related problems:

1. **Underutilized assets tie up capital.** Venues, kitchens, catering equipment, and transport are expensive to own but are only in active use for a fraction of the year. There is no efficient, trustworthy channel to rent this capacity out to peers.
2. **Renting is high-friction and high-risk.** A caterer who needs a walk-in fridge truck for one weekend event, or an event manager who needs a banquet hall on short notice, has no verified marketplace to find one. Existing options (personal networks, generic classifieds, phone calls) are slow, unverifiable, and carry no protection against damage, no-shows, or fraud on either side.

Both problems compound in emergencies (e.g., a caterer's equipment breaks down 4 hours before an event) where speed and trust matter more than price.

---

## 3. Target Users

| User type | Description | Primary need |
|---|---|---|
| **Resource Provider** | Hotels, venues, caterers, or equipment owners with underutilized assets | List assets, verify their business once, manage bookings/inventory, get paid, get deposits released promptly |
| **Resource Seeker** | Caterers, event managers, hoteliers, or venues needing short-term assets | Quickly find verified, available assets nearby, book with confidence, get transparent pricing and deposit terms |
| **Platform Admin** (post-MVP) | CodeNova operations | Review provider KYC submissions, resolve deposit/damage disputes |

Both Providers and Seekers are businesses (B2B), not individual consumers — this shapes the verification and trust requirements throughout.

---

## 4. Goals

### Business goals
- Validate demand for a B2B rental exchange in the hospitality vertical.
- Establish trust as the platform's core differentiator via mandatory business verification and a deposit/audit workflow.
- Demonstrate a working, demoable product for HackCelestial 3.0 judging.

### User goals
- **Providers:** Turn idle assets into revenue with minimal listing friction, once verified.
- **Seekers:** Find and book a verified, available asset near them in minutes — including under time pressure (emergency dispatch).

### Non-goals (for MVP)
- Cross-border or multi-currency support.
- Consumer-to-consumer (non-business) rentals.
- Automated damage assessment (photo audit is manually reviewed in MVP).

---

## 5. Core Features

### 5.1 Authentication & Provider Verification (KYC)
- Unified login/signup for both Seekers and Providers, with role selection.
- Providers are gated: an unverified Provider is redirected to a verification screen before they can access asset creation/inventory tools.
- Verification form collects: business name, tax ID / registration number, identity proof upload, and address verification.
- Once approved, Providers unlock the asset creation & inventory management panel.

### 5.2 Security & Deposits
- Platform-wide security: enforced HTTPS/TLS, HTTP-only session cookies, input sanitization on all API endpoints.
- Every resource listing carries a customizable **Security Deposit Amount** set by the Provider.
- Deposit workflow:
  1. Deposit is authorized/held at the time of booking payment (token payment).
  2. Held/locked until a post-event **photo audit** confirms condition on return.
  3. Automatically released to the Seeker upon successful audit approval.

### 5.3 Discovery: Hero, Search & Location
- Hero section uses real-world hospitality imagery (commercial kitchens, banquet halls, transport trucks) rather than generic vector art.
- Location search with autocomplete and **radius filtering** (e.g., within 10 km, 25 km).
- Filter panel headed "Find exactly what your business needs," with category, location, date range, and price filters.
- A prominent **Reset Filters** button restores all filters to default in one action.
- **Category set is fixed to five valid hospitality categories** (no unrelated categories):
  - Commercial Kitchens
  - Banquet & Event Spaces
  - Heavy Catering Equipment
  - Refrigerated & Local Transport
  - Tables, Seating & Decor

### 5.4 Dynamic Inventory & Availability Engine
- Real-time calendar lock: when an asset is booked/locked for given dates, the change is pushed live via WebSockets.
- Pre-booked assets automatically disappear from the public "Resource Ready / Available Now" listing for the overlapping time slots, for every connected client.
- Two booking modes are supported:
  - **Planned Rentals** — standard advance booking.
  - **4-Hour Emergency Dispatch** — expedited booking for urgent, short-notice needs.

---

## 6. MVP Scope

**In scope for MVP:**
- Seeker/Provider auth, role-based access control.
- Provider KYC verification flow (submission + gating; manual/simple approval, no full admin review UI required).
- Resource listing CRUD for verified Providers (five fixed categories only).
- Search/filter with location + radius, category, date range, price, and Reset Filters.
- Booking flow with security deposit hold at time of booking.
- Real-time availability updates via WebSocket (booked assets vanish from listings live).
- Planned vs. Emergency Dispatch booking modes.
- Deposit release upon (manually triggered, in MVP) photo audit approval.

**Explicitly out of scope for MVP** (see Section 9):
- Real payment gateway integration (token/deposit flows are stubbed/simulated).
- Automated/AI photo damage assessment.
- Admin dashboard for KYC review (verification can be approved via a simplified/manual path for MVP demo).
- In-app negotiation/messaging between Seeker and Provider.
- Multi-currency, multi-language, or cross-border support.
- Native mobile apps.

---

## 7. User Stories

**Authentication & Verification**
- As a new user, I can sign up and choose whether I'm a Resource Seeker or a Resource Provider.
- As an unverified Provider, I am redirected to a verification form when I try to list a resource or access my dashboard.
- As a Provider, I can submit my business name, tax ID, ID proof, and address to get verified.
- As a verified Provider, I can access the asset creation and inventory panel.

**Discovery & Search**
- As a Seeker, I can search for resources by location and radius (e.g., within 10 km).
- As a Seeker, I can filter by category, date range, and price.
- As a Seeker, I can reset all filters back to default with one click.
- As a Seeker, I only see the five valid hospitality categories — no irrelevant listings.

**Booking & Deposits**
- As a Seeker, I can book an available resource for planned dates or request emergency (4-hour) dispatch.
- As a Seeker, I understand the security deposit amount before I book.
- As a Seeker, my deposit is automatically released once the post-event photo audit is approved.
- As a Provider, once my asset is booked for specific dates, it no longer appears as available for those dates to other Seekers, instantly.

**Trust & Security**
- As any user, I expect my session and data to be protected via HTTPS, secure cookies, and sanitized inputs.
- As a Provider, I know my deposit-holding assets are protected until an audited return.

---

## 8. Success Metrics

| Metric | Target signal for MVP/demo |
|---|---|
| Provider verification completion rate | % of Providers who start KYC and complete it |
| Time-to-first-listing | Time from verification approval to first asset listed |
| Search-to-booking conversion | % of searches that result in a booking request |
| Real-time accuracy | 0 instances of a booked/locked asset shown as "available" to another user during testing |
| Emergency Dispatch usage | # of bookings made via 4-Hour Emergency Dispatch mode vs. Planned |
| Deposit workflow completion | % of bookings where deposit hold → audit → release completes without manual intervention |

---

## 9. Assumptions

- Providers and Seekers are legitimate registered businesses; KYC documents are assumed genuine for MVP (no third-party ID verification API integrated yet).
- A "photo audit" for deposit release is assumed sufficient for MVP trust needs; deeper fraud/damage-assessment tooling is a later-phase concern.
- Real-time features (WebSocket calendar lock) are assumed to run on a single-region deployment for the MVP/demo; multi-region scaling is out of scope.
- Users have a modern browser and stable internet; no offline mode is assumed.
- Payment processing is simulated/stubbed for the MVP demo, not connected to a live payment gateway.

---

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Fake or fraudulent KYC submissions | Untrustworthy Providers list unsafe/nonexistent assets | Manual review gate before "verified" status; flag for post-MVP identity-verification API |
| Deposit disputes (damage claims) | Seeker/Provider trust breakdown, disputes | Photo audit requirement; clear dispute-resolution path (post-MVP: admin arbitration) |
| Real-time sync failures under load | Double-booking of the same asset | WebSocket-driven locking tested under concurrent booking attempts; server-side booking validation as source of truth, not just client state |
| Low initial supply (few Providers) | Seekers find nothing to book, poor demo/first impression | Seed initial listings; prioritize Provider onboarding before public Seeker launch |
| Emergency Dispatch abuse (used for non-urgent bookings) | Degrades trust in the "4-hour" promise | Consider rate-limiting or flagging repeated emergency-mode use for review (post-MVP) |
| Scope creep during hackathon build | MVP not completed on time | Strict adherence to Section 6 MVP scope; defer all "out of scope" items |

---

## 11. Out-of-Scope Features (Post-MVP Roadmap)

- Admin verification review dashboard.
- Live payment gateway integration for deposits and rental fees.
- In-app negotiation/chat between Seeker and Provider.
- Automated (AI-assisted) photo damage detection for deposit audits.
- Ratings & reviews for Providers/Seekers.
- Multi-currency and multi-region support.
- Native mobile applications.
- Advanced analytics dashboard for Providers (utilization rates, earnings forecasts).

---

## 12. Acceptance Criteria (MVP)

- [ ] A user can sign up, log in, and select a role (Seeker or Provider).
- [ ] An unverified Provider cannot access asset listing/creation and is redirected to the KYC form.
- [ ] Submitting the KYC form (business name, tax ID, ID proof, address) moves the Provider to a "pending/verified" state.
- [ ] A verified Provider can create, edit, and manage resource listings across exactly the five defined categories (no others available).
- [ ] A Seeker can search/filter listings by category, location + radius, date range, and price.
- [ ] Clicking "Reset Filters" restores all filter fields to their default values in one action.
- [ ] Booking a resource for specific dates immediately removes it from the "Resource Ready / Available Now" list for those dates, for all connected clients (verified via WebSocket update, not page refresh).
- [ ] A booking can be created as either "Planned Rental" or "4-Hour Emergency Dispatch."
- [ ] Booking a resource authorizes/holds the listed security deposit amount.
- [ ] Approving the post-event photo audit releases the held deposit; the booking/deposit state reflects this change.
- [ ] All API traffic is served over HTTPS with HTTP-only session cookies; all form inputs are validated/sanitized server-side.

---

*End of document.*
