# Miravel — Boutique Stays CMS (Live Demo)

A small, self-contained **property-management CMS**: a public booking site plus an admin console for managing rooms, bookings and media. This repository is a **fully deployable demo** — open it on GitHub Pages and you can log into the backend, edit stays, and watch a booking submitted on the public form appear in the admin panel in real time.

## 🔗 Live pages

| Page | What it is | Link |
|------|------------|------|
| **Home** | Landing page | https://charles1812.github.io/CAMPUSUITE_site/ |
| **Stays** | All rooms, browsable | https://charles1812.github.io/CAMPUSUITE_site/rooms.html |
| **Stay detail** | A single room (gallery, specs, price) | https://charles1812.github.io/CAMPUSUITE_site/room.html?id=azzurra |
| **Contact** | Booking request form | https://charles1812.github.io/CAMPUSUITE_site/contact.html |
| **Admin console** | Password-gated backend | https://charles1812.github.io/CAMPUSUITE_site/admin.html |

> **Admin login:** `demo` / `demo123`
> **Try the loop:** submit a request on the [contact page](https://charles1812.github.io/CAMPUSUITE_site/contact.html), then open the [admin console](https://charles1812.github.io/CAMPUSUITE_site/admin.html) → **Bookings** and watch it appear.

---

## What it demonstrates

This is a compact, front-to-back reimplementation of a real production system I built and shipped for a client (see [*Production build*](#production-build-campusuite) below). It shows the full shape of a booking/lodging platform:

- **Public site** — landing page, browsable stays, a detail page per room, and a contact/booking form.
- **Admin console** — password-gated dashboard with full CRUD on rooms, a bookings inbox with status workflow, and a media library.
- **A closed loop** — a request submitted on the public contact form is persisted and shows up under **Bookings** in the console. That's the whole point of the demo: the two halves talk to each other.

### Feature list

**Public site**
- Responsive landing page with featured stays pulled from the data layer
- Stays grid + individual detail pages (gallery, specs, amenities, price)
- Availability badges driven by the same data the admin edits
- Booking request form with client-side validation

**Admin console**
- Login screen (demo credentials shown on the page)
- Dashboard with live counts (total stays, available, requests, unread)
- **Stays**: create / edit / delete, per-row toggles for *Visible on site* and *Available to book*, chip inputs for image URLs and amenities
- **Bookings**: inbox of incoming requests, open a request, change status (New to Confirmed / Declined), delete
- **Media**: image library you can add to and prune, referenced when editing a stay
- **Reset demo data** button to restore the original seed at any time

---

## Run it locally

No build step, no dependencies, no server. It's plain HTML/CSS/vanilla JS.

```bash
# any static server works, e.g.
python3 -m http.server 8080
# then open http://localhost:8080
```

**Demo login:** `demo` / `demo123`

Data is stored in your browser (`localStorage`), so your edits persist between visits on the same device and never leave it. Use **Reset demo data** in the sidebar to start fresh. Demo images are pulled from [picsum.photos](https://picsum.photos).

---

## Deploy it yourself

1. Push this folder to a repository.
2. **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**.
3. Open the URL GitHub gives you (`https://<username>.github.io/<repo>/`).

---

## How it's built

| Layer | This demo | Notes |
|------|-----------|-------|
| Markup / styles | Semantic HTML + a single hand-written CSS design system | No framework, no Tailwind |
| Logic | Vanilla JS (`data.js`, `site.js`, `admin.js`) | Zero dependencies |
| "Backend" | A `localStorage`-backed store that mimics a REST/CRUD API | Seeded on first load |
| Auth | Session-scoped flag (demo only) | Not real authentication |

```
├── index.html          Landing page
├── rooms.html          All stays
├── room.html           Stay detail (?id=…)
├── contact.html        Booking request form
├── admin.html          Admin console (renders from admin.js)
└── assets/
    ├── style.css       Design system (tokens, components)
    ├── data.js         Seed data + store + auth helpers
    ├── site.js         Public-site rendering
    └── admin.js        Admin console (dashboard, CRUD, bookings, media)
```

The data layer (`Store`) is deliberately written like a tiny API — `Store.rooms()`, `Store.saveRoom()`, `Store.addBooking()`, `Store.setBookingStatus()` — so the swap to a real PHP/SQL backend is a matter of changing those method bodies, not the UI.

---

## Production build (CampuSuite)

This demo is a sanitized, rebranded version of a real system I designed and deployed end-to-end for a student-housing operator in Milan:

**🔗 Live production site: [campusuite.it](https://campusuite.it)**

The production build is a different, hardened stack — the public demo here is intentionally static so it can live on GitHub Pages without exposing any server code, credentials or client data. The real system runs:

- **PHP 8 + MySQL** on managed hosting, database credentials kept outside the web root
- A private admin panel with **bcrypt** password hashing, **CSRF** protection on every form, **TOTP two-factor auth** (Google Authenticator), session hardening (HttpOnly / Secure / SameSite), and login rate-limiting
- Server-side upload validation (magic-byte checks), a full security-header / CSP layer, and HTTPS enforced end to end
- A **bilingual (IT / EN)** public site with automatic language detection

The Miravel demo mirrors the *product* — the room CMS, the bookings workflow, the media library, the public booking flow — without any of the production security surface, because none of that belongs in a public repo.

---

## License

Demo code released under the MIT License — use it, learn from it, build on it.
Demo imagery via picsum.photos. "Miravel" is a fictional brand created solely for this demo.
