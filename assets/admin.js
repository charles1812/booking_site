/* ============================================================
   MIRAVEL — admin panel (client-side simulated backend)
   ============================================================ */

const ICONS = {
  dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  rooms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21V7l9-4 9 4v14"/><path d="M9 21v-6h6v6"/></svg>',
  bookings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  view: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
};

/* ---------------- LOGIN ---------------- */
function renderLogin() {
  document.body.className = "admin-body";
  document.body.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <div class="brand"><span class="brand__mark">M</span> Miravel</div>
        <p class="login-sub">Property console</p>
        <div class="demo-hint">Demo access — user <code>${DEMO_USER}</code> · password <code>${DEMO_PASS}</code></div>
        <div id="login-err"></div>
        <form id="login-form">
          <div class="field"><label>Username</label><input name="user" autocomplete="username" value="${DEMO_USER}"></div>
          <div class="field"><label>Password</label><input name="pass" type="password" autocomplete="current-password" value="${DEMO_PASS}"></div>
          <button class="btn btn--primary btn--block" type="submit">Sign in</button>
        </form>
        <p style="text-align:center;margin-top:18px;font-size:13px"><a href="index.html" style="color:var(--muted)">← Back to site</a></p>
      </div>
    </div>`;
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target).entries());
    if (Auth.login(f.user, f.pass)) renderShell();
    else document.getElementById("login-err").innerHTML = '<div class="notice notice--warn">Those credentials don\'t match. Use the demo access above.</div>';
  });
}

/* ---------------- SHELL ---------------- */
let currentView = "dash";

function renderShell() {
  document.body.className = "admin-body";
  const nav = [
    ["dash", "Dashboard", ICONS.dash],
    ["rooms", "Stays", ICONS.rooms],
    ["bookings", "Bookings", ICONS.bookings],
    ["media", "Media", ICONS.media],
  ];
  document.body.innerHTML = `
    <div class="admin-shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand__mark">M</span> Miravel</div>
        <nav class="side-nav" id="side-nav">
          ${nav.map(([k, l, ic]) => `<button data-view="${k}">${ic}<span>${l}</span></button>`).join("")}
        </nav>
        <div class="side-foot">
          <a href="index.html" target="_blank">${ICONS.view}<span>View live site</span></a>
          <button id="reset-btn">${ICONS.reset}<span>Reset demo data</span></button>
          <button id="logout-btn">${ICONS.logout}<span>Sign out</span></button>
        </div>
      </aside>
      <main class="admin-main" id="admin-main"></main>
    </div>
    <div class="modal-overlay" id="modal"></div>`;

  document.getElementById("side-nav").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (btn) { currentView = btn.dataset.view; paint(); }
  });
  document.getElementById("logout-btn").addEventListener("click", () => { Auth.logout(); renderLogin(); });
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("Reset all demo data to its original state?")) { Store.reset(); paint(); toast("Demo data reset"); }
  });
  paint();
}

function paint() {
  document.querySelectorAll("#side-nav button").forEach(b => b.classList.toggle("active", b.dataset.view === currentView));
  const main = document.getElementById("admin-main");
  if (currentView === "dash") main.innerHTML = viewDash();
  if (currentView === "rooms") { main.innerHTML = viewRooms(); wireRooms(); }
  if (currentView === "bookings") { main.innerHTML = viewBookings(); wireBookings(); }
  if (currentView === "media") { main.innerHTML = viewMedia(); wireMedia(); }
}

/* ---------------- DASHBOARD ---------------- */
function viewDash() {
  const rooms = Store.rooms();
  const bookings = Store.bookings();
  const avail = rooms.filter(r => r.available && r.visible).length;
  const newB = bookings.filter(b => b.status === "new").length;
  const recent = bookings.slice(0, 4);

  return `
    <div class="admin-head">
      <div><h1>Dashboard</h1><p>An overview of your stays and incoming requests.</p></div>
    </div>
    <div class="stats">
      <div class="stat"><b>${rooms.length}</b><span>Stays total</span></div>
      <div class="stat"><b class="tint">${avail}</b><span>Available now</span></div>
      <div class="stat"><b>${bookings.length}</b><span>Booking requests</span></div>
      <div class="stat"><b class="tint">${newB}</b><span>New / unread</span></div>
    </div>
    <div class="panel">
      <div class="panel__head"><h2>Recent requests</h2><button class="btn btn--ghost btn--sm" onclick="currentView='bookings';paint()">See all</button></div>
      ${recent.length ? `<table class="table">
        <thead><tr><th>Guest</th><th>Stay</th><th>Dates</th><th>Status</th><th></th></tr></thead>
        <tbody>${recent.map(bookingRow).join("")}</tbody></table>` :
      `<div class="empty-state">No requests yet.</div>`}
    </div>`;
}

/* ---------------- ROOMS ---------------- */
function viewRooms() {
  const rooms = Store.rooms();
  return `
    <div class="admin-head">
      <div><h1>Stays</h1><p>Create, edit and publish the rooms shown on the public site.</p></div>
      <button class="btn btn--primary" id="add-room">+ New stay</button>
    </div>
    <div class="panel">
      ${rooms.length ? `<table class="table">
        <thead><tr><th></th><th>Name</th><th>Type</th><th>Price</th><th>Visible</th><th>Available</th><th></th></tr></thead>
        <tbody>${rooms.map(roomRow).join("")}</tbody></table>` :
      `<div class="empty-state">No stays yet. Create your first one.</div>`}
    </div>`;
}

function roomRow(r) {
  return `<tr>
    <td><img class="row-media" src="${esc(r.images[0] || "")}" alt=""></td>
    <td><b>${esc(r.name)}</b><br><span style="color:var(--muted);font-size:12px">${esc(r.code)} · ${r.size} m²</span></td>
    <td>${esc(r.type)}</td>
    <td>€${r.price}<span style="color:var(--muted);font-size:12px">/mo</span></td>
    <td><label class="toggle"><input type="checkbox" data-toggle="visible" data-id="${r.id}" ${r.visible ? "checked" : ""}><span class="track"></span></label></td>
    <td><label class="toggle"><input type="checkbox" data-toggle="available" data-id="${r.id}" ${r.available ? "checked" : ""}><span class="track"></span></label></td>
    <td><div class="row-actions">
      <button class="icon-btn" data-edit="${r.id}" title="Edit">${ICONS.edit}</button>
      <button class="icon-btn icon-btn--danger" data-del="${r.id}" title="Delete">${ICONS.trash}</button>
    </div></td>
  </tr>`;
}

function wireRooms() {
  document.getElementById("add-room")?.addEventListener("click", () => openRoomModal(null));
  document.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openRoomModal(b.dataset.edit)));
  document.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
    const r = Store.room(b.dataset.del);
    if (confirm(`Delete stay "${r.name}"? This can't be undone.`)) { Store.deleteRoom(b.dataset.del); paint(); toast("Stay deleted"); }
  }));
  document.querySelectorAll("[data-toggle]").forEach(t => t.addEventListener("change", () => {
    Store.toggleRoom(t.dataset.id, t.dataset.toggle);
    toast("Saved");
  }));
}

function openRoomModal(id) {
  const r = id ? Store.room(id) : { id: "", name: "", code: "", type: "Single", size: 20, guests: 1, price: 0, floor: "", shared: "", description: "", images: [], amenities: [], visible: true, available: true };
  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <div class="modal">
      <div class="modal__head"><h2>${id ? "Edit stay" : "New stay"}</h2><button class="close-x" data-close>&times;</button></div>
      <div class="modal__body">
        <div class="field-row">
          <div class="field"><label>Name</label><input id="f-name" value="${esc(r.name)}"></div>
          <div class="field"><label>Code</label><input id="f-code" value="${esc(r.code)}" placeholder="e.g. S1"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Type</label><select id="f-type">
            ${["Single", "Double", "Suite", "Family", "Studio"].map(t => `<option ${t === r.type ? "selected" : ""}>${t}</option>`).join("")}
          </select></div>
          <div class="field"><label>Price (€ / month)</label><input id="f-price" type="number" min="0" value="${r.price}"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Size (m²)</label><input id="f-size" type="number" min="1" value="${r.size}"></div>
          <div class="field"><label>Guests</label><input id="f-guests" type="number" min="1" value="${r.guests}"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Floor / view</label><input id="f-floor" value="${esc(r.floor)}"></div>
          <div class="field"><label>Bathroom / kitchen</label><input id="f-shared" value="${esc(r.shared)}"></div>
        </div>
        <div class="field"><label>Description</label><textarea id="f-desc">${esc(r.description)}</textarea></div>
        <div class="field"><label>Image URLs</label><div class="chip-input" id="img-chips"></div>
          <p style="font-size:12px;color:var(--muted);margin-top:5px">Type a URL and press Enter. Try the Media library for demo images.</p></div>
        <div class="field"><label>Amenities</label><div class="chip-input" id="amen-chips"></div>
          <p style="font-size:12px;color:var(--muted);margin-top:5px">Type an amenity and press Enter.</p></div>
        <div style="display:flex;gap:24px;margin-top:6px">
          <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" id="f-visible" ${r.visible ? "checked" : ""}> Visible on site</label>
          <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" id="f-available" ${r.available ? "checked" : ""}> Available for booking</label>
        </div>
      </div>
      <div class="modal__foot">
        <button class="btn btn--ghost" data-close>Cancel</button>
        <button class="btn btn--primary" id="save-room">${id ? "Save changes" : "Create stay"}</button>
      </div>
    </div>`;
  modal.classList.add("open");

  const imgChips = chipField(document.getElementById("img-chips"), r.images.slice());
  const amenChips = chipField(document.getElementById("amen-chips"), r.amenities.slice());

  modal.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeModal));
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  document.getElementById("save-room").addEventListener("click", () => {
    const name = document.getElementById("f-name").value.trim();
    if (!name) { toast("Name is required"); return; }
    const room = {
      id: r.id || slugify(name),
      name,
      code: document.getElementById("f-code").value.trim(),
      type: document.getElementById("f-type").value,
      size: +document.getElementById("f-size").value || 0,
      guests: +document.getElementById("f-guests").value || 1,
      price: +document.getElementById("f-price").value || 0,
      floor: document.getElementById("f-floor").value.trim(),
      shared: document.getElementById("f-shared").value.trim(),
      description: document.getElementById("f-desc").value.trim(),
      images: imgChips.values(),
      amenities: amenChips.values(),
      visible: document.getElementById("f-visible").checked,
      available: document.getElementById("f-available").checked,
      order: r.order || 999,
    };
    Store.saveRoom(room);
    closeModal();
    paint();
    toast(id ? "Stay updated" : "Stay created");
  });
}

function chipField(container, initial) {
  let vals = initial;
  const input = document.createElement("input");
  input.placeholder = "Add…";
  function render() {
    container.querySelectorAll(".chip").forEach(c => c.remove());
    vals.forEach((v, i) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.innerHTML = `<span title="${esc(v)}">${esc(v.length > 34 ? v.slice(0, 34) + "…" : v)}</span><button type="button">&times;</button>`;
      chip.querySelector("button").addEventListener("click", () => { vals.splice(i, 1); render(); });
      container.insertBefore(chip, input);
    });
  }
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); const v = input.value.trim(); if (v) { vals.push(v); input.value = ""; render(); } }
    if (e.key === "Backspace" && !input.value && vals.length) { vals.pop(); render(); }
  });
  container.appendChild(input);
  render();
  return { values: () => vals.slice() };
}

/* ---------------- BOOKINGS ---------------- */
function viewBookings() {
  const bookings = Store.bookings();
  return `
    <div class="admin-head"><div><h1>Bookings</h1><p>Requests submitted from the public contact form.</p></div></div>
    <div class="panel">
      ${bookings.length ? `<table class="table">
        <thead><tr><th>Guest</th><th>Stay</th><th>Dates</th><th>Received</th><th>Status</th><th></th></tr></thead>
        <tbody>${bookings.map(bookingRow).join("")}</tbody></table>` :
      `<div class="empty-state">No requests yet. Submit the form on the <a href="contact.html" target="_blank" style="color:var(--teal)">contact page</a> to see one land here.</div>`}
    </div>`;
}

function bookingRow(b) {
  const dates = b.from ? `${fmtDate(b.from)} → ${fmtDate(b.to)}` : "—";
  return `<tr>
    <td><b>${esc(b.name)} ${esc(b.surname)}</b><br><span style="color:var(--muted);font-size:12px">${esc(b.email)}</span></td>
    <td>${b.roomName ? esc(b.roomName) : '<span style="color:var(--muted)">—</span>'}</td>
    <td style="font-size:13px">${dates}</td>
    <td style="font-size:13px;color:var(--muted)">${fmtDate(b.createdAt)}</td>
    <td><span class="pill pill--${b.status}">${b.status[0].toUpperCase() + b.status.slice(1)}</span></td>
    <td><div class="row-actions">
      <button class="icon-btn" data-open="${b.id}" title="Open">${ICONS.view}</button>
      <button class="icon-btn icon-btn--danger" data-delb="${b.id}" title="Delete">${ICONS.trash}</button>
    </div></td>
  </tr>`;
}

function wireBookings() {
  document.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => openBooking(b.dataset.open)));
  document.querySelectorAll("[data-delb]").forEach(b => b.addEventListener("click", () => {
    if (confirm("Delete this request?")) { Store.deleteBooking(b.dataset.delb); paint(); toast("Request deleted"); }
  }));
}

function openBooking(id) {
  const b = Store.bookings().find(x => x.id === id);
  if (!b) return;
  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <div class="modal">
      <div class="modal__head"><h2>${esc(b.name)} ${esc(b.surname)}</h2><button class="close-x" data-close>&times;</button></div>
      <div class="modal__body">
        <div class="spec"><span>Email</span><b>${esc(b.email)}</b></div>
        <div class="spec"><span>Phone</span><b>${esc(b.phone || "—")}</b></div>
        <div class="spec"><span>Stay</span><b>${esc(b.roomName || "No preference")}</b></div>
        <div class="spec"><span>Dates</span><b>${b.from ? fmtDate(b.from) + " → " + fmtDate(b.to) : "—"}</b></div>
        <div class="spec"><span>Received</span><b>${fmtDate(b.createdAt)}</b></div>
        <div style="margin-top:16px">
          <div class="eyebrow" style="margin-bottom:6px">Message</div>
          <p style="font-size:14px;color:var(--ink-soft);background:var(--paper);border:1px solid var(--line);border-radius:9px;padding:14px">${esc(b.message || "—")}</p>
        </div>
        <div class="field" style="margin-top:16px"><label>Status</label>
          <select id="b-status">
            ${["new", "confirmed", "declined"].map(s => `<option value="${s}" ${s === b.status ? "selected" : ""}>${s[0].toUpperCase() + s.slice(1)}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="modal__foot">
        <button class="btn btn--ghost" data-close>Close</button>
        <button class="btn btn--primary" id="save-status">Save status</button>
      </div>
    </div>`;
  modal.classList.add("open");
  modal.querySelectorAll("[data-close]").forEach(x => x.addEventListener("click", closeModal));
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.getElementById("save-status").addEventListener("click", () => {
    Store.setBookingStatus(id, document.getElementById("b-status").value);
    closeModal(); paint(); toast("Status updated");
  });
}

/* ---------------- MEDIA ---------------- */
function viewMedia() {
  const media = Store.media();
  return `
    <div class="admin-head"><div><h1>Media</h1><p>The image library — reference any URL when editing a stay.</p></div></div>
    <div class="panel" style="padding:20px">
      <div class="field" style="margin-bottom:20px">
        <label>Add image by URL</label>
        <div style="display:flex;gap:10px">
          <input id="media-url" placeholder="https://…" style="flex:1;border:1.5px solid var(--line);border-radius:9px;padding:11px 14px;font-family:var(--body)">
          <button class="btn btn--primary" id="add-media">Add</button>
        </div>
      </div>
      ${media.length ? `<div class="media-grid">${media.map(m => `
        <div class="media-item"><img src="${esc(m)}" alt="" loading="lazy">
          <button data-delm="${esc(m)}" title="Remove">${ICONS.trash}</button></div>`).join("")}</div>` :
      `<div class="empty-state">No media yet.</div>`}
    </div>`;
}

function wireMedia() {
  document.getElementById("add-media")?.addEventListener("click", () => {
    const url = document.getElementById("media-url").value.trim();
    if (url) { Store.addMedia(url); paint(); toast("Image added"); }
  });
  document.querySelectorAll("[data-delm]").forEach(b => b.addEventListener("click", () => {
    Store.deleteMedia(b.dataset.delm); paint(); toast("Image removed");
  }));
}

/* ---------------- utils ---------------- */
function closeModal() { const m = document.getElementById("modal"); m.classList.remove("open"); m.innerHTML = ""; }
function slugify(s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "stay-" + Date.now(); }

/* ---------------- boot ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  Store.load(); // ensure seeded
  if (Auth.isAuthed()) renderShell();
  else renderLogin();
});
