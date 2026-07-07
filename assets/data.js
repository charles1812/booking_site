/* ============================================================
   MIRAVEL — data layer (client-side simulated backend)
   Persists to localStorage so the admin + public site share state.
   ============================================================ */

const DB_KEY = "miravel_db_v1";
const AUTH_KEY = "miravel_auth_v1";

/* Demo credentials (shown on the login screen) */
const DEMO_USER = "demo";
const DEMO_PASS = "demo123";

/* Stable demo imagery via picsum (seeded = consistent across loads) */
const img = (seed) => `https://picsum.photos/seed/${seed}/900/650`;

const SEED = {
  rooms: [
    {
      id: "azzurra",
      name: "Azzurra",
      code: "S1",
      type: "Suite",
      size: 34,
      guests: 2,
      price: 180,
      floor: "Second floor · sea view",
      shared: "Private bathroom · kitchenette",
      description:
        "A light-filled corner suite with a wide balcony over the harbour. Linen drapes, a walk-in shower, and a compact kitchenette make it an easy place to settle in for a season.",
      images: [img("miravel-azzurra-1"), img("miravel-azzurra-2"), img("miravel-azzurra-3"), img("miravel-azzurra-4")],
      amenities: ["Sea view", "Fibre Wi-Fi", "Kitchenette", "Air conditioning", "Weekly cleaning", "Welcome kit"],
      visible: true,
      available: true,
      order: 1,
    },
    {
      id: "maestrale",
      name: "Maestrale",
      code: "D2",
      type: "Double",
      size: 28,
      guests: 2,
      price: 150,
      floor: "First floor · courtyard",
      shared: "Private bathroom · shared kitchen",
      description:
        "A calm double facing the inner courtyard, shaded in the afternoon. Generous wardrobe, a proper desk, and a firm queen bed for long study nights.",
      images: [img("miravel-maestrale-1"), img("miravel-maestrale-2"), img("miravel-maestrale-3")],
      amenities: ["Courtyard view", "Fibre Wi-Fi", "Desk", "Air conditioning", "Weekly cleaning"],
      visible: true,
      available: true,
      order: 2,
    },
    {
      id: "salino",
      name: "Salino",
      code: "S3",
      type: "Single",
      size: 19,
      guests: 1,
      price: 110,
      floor: "Ground floor",
      shared: "Shared bathroom · shared kitchen",
      description:
        "A tidy single for the independent traveller: everything within reach, nothing in excess. Steps from the shared lounge and the laundry room.",
      images: [img("miravel-salino-1"), img("miravel-salino-2"), img("miravel-salino-3")],
      amenities: ["Fibre Wi-Fi", "Desk", "Heating", "Weekly cleaning"],
      visible: true,
      available: false,
      order: 3,
    },
    {
      id: "onda",
      name: "Onda",
      code: "F4",
      type: "Family",
      size: 42,
      guests: 4,
      price: 240,
      floor: "Top floor · terrace",
      shared: "Private bathroom · private kitchen",
      description:
        "The largest of the stays, opening onto a private roof terrace. Two sleeping areas, a full kitchen, and enough space to host friends when they visit.",
      images: [img("miravel-onda-1"), img("miravel-onda-2"), img("miravel-onda-3"), img("miravel-onda-4")],
      amenities: ["Terrace", "Sea view", "Full kitchen", "Fibre Wi-Fi", "Air conditioning", "Welcome kit", "Weekly cleaning"],
      visible: true,
      available: true,
      order: 4,
    },
  ],
  bookings: [
    {
      id: "b1",
      name: "Elena",
      surname: "Marchetti",
      email: "elena.marchetti@example.com",
      phone: "+39 340 111 2233",
      roomId: "azzurra",
      roomName: "Azzurra",
      from: "2026-09-01",
      to: "2027-06-30",
      message: "Interested in the autumn term. Is the balcony furnished?",
      status: "new",
      createdAt: "2026-05-14T09:20:00",
    },
    {
      id: "b2",
      name: "Tomas",
      surname: "Berg",
      email: "tomas.berg@example.com",
      phone: "+46 70 555 0198",
      roomId: "onda",
      roomName: "Onda",
      from: "2026-10-01",
      to: "2027-02-28",
      message: "Erasmus exchange, would love the terrace unit for four months.",
      status: "confirmed",
      createdAt: "2026-05-10T16:05:00",
    },
    {
      id: "b3",
      name: "Priya",
      surname: "Nair",
      email: "priya.nair@example.com",
      phone: "",
      roomId: "",
      roomName: "",
      from: "",
      to: "",
      message: "Do you have any single rooms available for a short winter stay?",
      status: "new",
      createdAt: "2026-05-16T11:47:00",
    },
  ],
  media: [
    img("miravel-azzurra-1"), img("miravel-azzurra-2"), img("miravel-maestrale-1"),
    img("miravel-salino-1"), img("miravel-onda-1"), img("miravel-onda-2"),
    img("miravel-extra-1"), img("miravel-extra-2"), img("miravel-extra-3"),
  ],
};

/* ---------- Store ---------- */
const Store = {
  load() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) { this.reset(); return JSON.parse(localStorage.getItem(DB_KEY)); }
      return JSON.parse(raw);
    } catch (e) {
      this.reset();
      return JSON.parse(localStorage.getItem(DB_KEY));
    }
  },
  save(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); },
  reset() { localStorage.setItem(DB_KEY, JSON.stringify(structuredClone(SEED))); },

  rooms() { return this.load().rooms.sort((a, b) => a.order - b.order); },
  visibleRooms() { return this.rooms().filter(r => r.visible); },
  room(id) { return this.load().rooms.find(r => r.id === id) || null; },

  saveRoom(room) {
    const db = this.load();
    if (!room.id) {
      room.id = String(room.name || "stay").toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "stay-" + Date.now();
    }
    const i = db.rooms.findIndex(r => r.id === room.id);
    if (i >= 0) db.rooms[i] = room;
    else { room.order = db.rooms.length + 1; db.rooms.push(room); }
    this.save(db);
  },
  deleteRoom(id) {
    const db = this.load();
    db.rooms = db.rooms.filter(r => r.id !== id);
    this.save(db);
  },
  toggleRoom(id, field) {
    const db = this.load();
    const r = db.rooms.find(x => x.id === id);
    if (r) { r[field] = !r[field]; this.save(db); }
  },

  bookings() { return this.load().bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); },
  addBooking(b) {
    const db = this.load();
    b.id = "b" + Date.now();
    b.status = "new";
    b.createdAt = new Date().toISOString();
    db.bookings.push(b);
    this.save(db);
  },
  setBookingStatus(id, status) {
    const db = this.load();
    const b = db.bookings.find(x => x.id === id);
    if (b) { b.status = status; this.save(db); }
  },
  deleteBooking(id) {
    const db = this.load();
    db.bookings = db.bookings.filter(b => b.id !== id);
    this.save(db);
  },

  media() { return this.load().media; },
  addMedia(url) {
    const db = this.load();
    if (url && !db.media.includes(url)) { db.media.unshift(url); this.save(db); }
  },
  deleteMedia(url) {
    const db = this.load();
    db.media = db.media.filter(m => m !== url);
    this.save(db);
  },
};

/* ---------- Auth ---------- */
const Auth = {
  login(user, pass) {
    if (user === DEMO_USER && pass === DEMO_PASS) {
      sessionStorage.setItem(AUTH_KEY, "1");
      return true;
    }
    return false;
  },
  logout() { sessionStorage.removeItem(AUTH_KEY); },
  isAuthed() { return sessionStorage.getItem(AUTH_KEY) === "1"; },
};

/* ---------- Shared helpers ---------- */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2600);
}
