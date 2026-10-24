/* ============================================================
   MIRAVEL — public site rendering
   ============================================================ */

/* mobile nav */
function toggleNav(force) {
  const links = document.querySelector(".nav__links");
  if (!links) return;
  const open = links.classList.toggle("open", force);
  document.querySelector(".burger")?.setAttribute("aria-expanded", String(open));
}
function initNav() {
  const burger = document.querySelector(".burger");
  if (!burger) return;
  burger.setAttribute("aria-label", "Open menu");
  burger.setAttribute("aria-expanded", "false");
  document.querySelectorAll(".nav__links a").forEach(a => a.addEventListener("click", () => toggleNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleNav(false); });
}

/* scroll reveal */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !els.length) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(e => io.observe(e));
}

/* room card markup */
function roomCard(r) {
  const cover = r.images[0] || "";
  const badge = r.available
    ? '<span class="card__badge">Available</span>'
    : '<span class="card__badge card__badge--off">Not available</span>';
  return `
    <article class="card reveal">
      <a href="room.html?id=${encodeURIComponent(r.id)}" class="card__media">
        <img src="${esc(cover)}" alt="Stay ${esc(r.name)}" loading="lazy">
        ${badge}
      </a>
      <div class="card__body">
        <div class="card__meta">${esc(r.code)} · ${esc(r.type)} · ${r.size} m²</div>
        <h3 class="card__title">${esc(r.name)}</h3>
        <p class="card__desc">${esc(r.description).slice(0, 96)}${r.description.length > 96 ? "…" : ""}</p>
        <div class="card__foot">
          <div class="card__price"><b>€${r.price}</b> <span>/month</span></div>
          <a href="room.html?id=${encodeURIComponent(r.id)}" class="btn btn--ghost btn--sm">View stay</a>
        </div>
      </div>
    </article>`;
}

/* home: featured (first 3 visible) */
function renderFeatured() {
  const wrap = document.getElementById("featured-rooms");
  if (!wrap) return;
  const rooms = Store.visibleRooms().slice(0, 3);
  wrap.innerHTML = rooms.length ? rooms.map(roomCard).join("") : emptyRooms();
  initReveal();
}

/* home: live count of bookable stays in the hero badge */
function renderHeroCount() {
  const el = document.getElementById("hero-count");
  if (!el) return;
  const n = Store.visibleRooms().filter(r => r.available).length;
  el.textContent = n;
  document.getElementById("hero-count-label").textContent = n === 1 ? "stay open this season" : "stays open this season";
}

/* rooms page: all visible, with type / availability / sort filters */
const roomFilter = { type: "all", onlyAvailable: false, sort: "order" };

function renderAllRooms() {
  const wrap = document.getElementById("all-rooms");
  if (!wrap) return;
  const all = Store.visibleRooms();
  let rooms = all.filter(r =>
    (roomFilter.type === "all" || r.type === roomFilter.type) &&
    (!roomFilter.onlyAvailable || r.available));
  if (roomFilter.sort === "price-asc") rooms.sort((a, b) => a.price - b.price);
  if (roomFilter.sort === "price-desc") rooms.sort((a, b) => b.price - a.price);
  if (roomFilter.sort === "size") rooms.sort((a, b) => b.size - a.size);

  const count = document.getElementById("rooms-count");
  if (count) count.textContent = `${rooms.length} of ${all.length} stays`;
  wrap.innerHTML = rooms.length
    ? rooms.map(roomCard).join("")
    : all.length
      ? `<div class="empty-state" style="grid-column:1/-1">No stays match these filters. <button class="filter-chip" id="clear-filters" style="margin-left:6px">Clear filters</button></div>`
      : emptyRooms();
  document.getElementById("clear-filters")?.addEventListener("click", () => {
    Object.assign(roomFilter, { type: "all", onlyAvailable: false });
    document.getElementById("only-available").checked = false;
    renderFilterChips();
    renderAllRooms();
  });
  initReveal();
}

function renderFilterChips() {
  const chips = document.getElementById("type-chips");
  if (!chips) return;
  const types = [...new Set(Store.visibleRooms().map(r => r.type))];
  chips.innerHTML = ["all", ...types].map(t =>
    `<button class="filter-chip" data-type="${esc(t)}" aria-pressed="${t === roomFilter.type}">${t === "all" ? "All stays" : esc(t)}</button>`
  ).join("");
}

function initRoomFilters() {
  const chips = document.getElementById("type-chips");
  if (!chips) return;
  renderFilterChips();
  chips.addEventListener("click", (e) => {
    const b = e.target.closest("[data-type]");
    if (!b) return;
    roomFilter.type = b.dataset.type;
    renderFilterChips();
    renderAllRooms();
  });
  document.getElementById("only-available").addEventListener("change", (e) => { roomFilter.onlyAvailable = e.target.checked; renderAllRooms(); });
  document.getElementById("sort-rooms").addEventListener("change", (e) => { roomFilter.sort = e.target.value; renderAllRooms(); });
}

function emptyRooms() {
  return `<div class="empty-state" style="grid-column:1/-1">No stays are published right now. Check back soon.</div>`;
}

/* room detail */
function renderRoomDetail() {
  const wrap = document.getElementById("room-detail");
  if (!wrap) return;
  const id = new URLSearchParams(location.search).get("id");
  const r = Store.room(id);
  if (!r || !r.visible) {
    wrap.innerHTML = `<div class="empty-state">This stay could not be found. <a href="rooms.html" style="color:var(--teal)">Back to all stays →</a></div>`;
    return;
  }

  document.title = `${r.name} — Miravel`;
  const thumbs = r.images.length > 1 ? r.images.slice(0, 5).map((im, i) =>
    `<img src="${esc(im)}" alt="${esc(r.name)} photo ${i + 1}" data-full="${esc(im)}" tabindex="0" class="${i === 0 ? "active" : ""}">`
  ).join("") : "";

  const specs = [
    ["Type", r.type],
    ["Size", r.size + " m²"],
    ["Guests", r.guests],
    ["Floor", r.floor || "—"],
    ["Bathroom / Kitchen", r.shared || "—"],
  ].map(([k, v]) => `<div class="spec"><span>${k}</span><b>${esc(v)}</b></div>`).join("");

  const amenities = r.amenities.map(a => `<span class="amenity">${esc(a)}</span>`).join("");
  const status = r.available
    ? '<span class="card__badge" style="position:static">Available</span>'
    : '<span class="card__badge card__badge--off" style="position:static">Not available</span>';

  wrap.innerHTML = `
    <div class="breadcrumb"><a href="index.html">Home</a> › <a href="rooms.html">Stays</a> › ${esc(r.name)}</div>
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:6px">
      <h1 class="page-hero" style="border:0;padding:0;font-size:clamp(32px,5vw,52px)">${esc(r.name)}</h1>
      ${status}
    </div>
    <p style="color:var(--muted);margin-bottom:8px">${esc(r.code)} · ${esc(r.type)} · ${r.size} m² · ${esc(r.floor)}</p>

    <div class="detail-grid">
      <div>
        <div class="gallery__main"><img id="gallery-main" src="${esc(r.images[0])}" alt="${esc(r.name)}"></div>
        ${thumbs ? `<div class="gallery__thumbs">${thumbs}</div>` : ""}
        <div style="margin-top:34px">
          <div class="eyebrow">The stay</div>
          <h2 class="display" style="font-size:30px;margin:10px 0 16px">${esc(r.name)}</h2>
          <p style="color:var(--ink-soft);font-size:16px;line-height:1.8">${esc(r.description)}</p>
        </div>
        <div style="margin-top:30px">
          <div class="eyebrow">What's included</div>
          <h2 class="display" style="font-size:24px;margin:10px 0 16px">Amenities</h2>
          <div class="amenities">${amenities}</div>
        </div>
      </div>

      <aside class="detail-side">
        <div class="eyebrow" style="margin-bottom:12px">Details</div>
        ${specs}
        <div class="price-box"><b>€${r.price}</b><span>per month</span></div>
        <a href="contact.html?room=${encodeURIComponent(r.id)}" class="btn btn--primary btn--block">
          ${r.available ? "Request this stay" : "Ask about availability"}
        </a>
      </aside>
    </div>`;

  const main = document.getElementById("gallery-main");
  const strip = wrap.querySelector(".gallery__thumbs");
  const pick = (t) => {
    if (!t?.dataset.full) return;
    main.style.opacity = 0;
    setTimeout(() => { main.src = t.dataset.full; main.style.opacity = 1; }, 150);
    strip.querySelectorAll("img").forEach(i => i.classList.toggle("active", i === t));
  };
  strip?.addEventListener("click", (e) => pick(e.target.closest("img")));
  strip?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(e.target.closest("img")); } });
}

/* contact page: list of bookable stays in the side panel */
function renderAvailList() {
  const el = document.getElementById("avail-list");
  if (!el) return;
  const avail = Store.visibleRooms().filter(r => r.available);
  el.innerHTML = avail.length
    ? avail.map(r => `<div style="display:flex;justify-content:space-between;padding:5px 0"><a href="room.html?id=${encodeURIComponent(r.id)}" style="color:var(--teal)">${esc(r.name)}</a><span>€${r.price}/mo</span></div>`).join("")
    : "No stays available right now.";
}

/* fill the room <select> on contact page */
function fillRoomSelect() {
  const sel = document.getElementById("room-select");
  if (!sel) return;
  const rooms = Store.visibleRooms();
  const preselect = new URLSearchParams(location.search).get("room");
  sel.innerHTML = `<option value="">— No preference —</option>` +
    rooms.map(r => `<option value="${esc(r.id)}" ${r.id === preselect ? "selected" : ""}>${esc(r.name)} · ${esc(r.type)} · €${r.price}/mo</option>`).join("");
}

/* contact form submit -> creates a booking the admin can see */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const notice = document.getElementById("form-notice");
  const from = form.elements.from, to = form.elements.to;
  const today = new Date().toISOString().slice(0, 10);
  from.min = today;
  to.min = today;
  from.addEventListener("change", () => { to.min = from.value || today; if (to.value && to.value < from.value) to.value = ""; });

  const warn = (msg) => {
    notice.className = "notice notice--warn";
    notice.textContent = msg;
    notice.style.display = "block";
    notice.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.email) return warn("Please add at least your name and email.");
    if (data.from && data.to && data.to <= data.from) return warn("The move-out date needs to be after the move-in date.");
    const room = data.room ? Store.room(data.room) : null;
    Store.addBooking({
      name: data.name.trim(),
      surname: (data.surname || "").trim(),
      email: data.email.trim(),
      phone: (data.phone || "").trim(),
      roomId: data.room || "",
      roomName: room ? room.name : "",
      from: data.from || "",
      to: data.to || "",
      message: (data.message || "").trim(),
    });
    form.reset();
    fillRoomSelect();
    notice.className = "notice notice--ok";
    notice.innerHTML = "✓ Request sent. It now appears in the admin panel under <b>Bookings</b> — open <a href='admin.html' style='color:inherit;text-decoration:underline'>the demo backend</a> to see it.";
    notice.style.display = "block";
    notice.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* boot */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  renderHeroCount();
  renderFeatured();
  initRoomFilters();
  renderAllRooms();
  renderRoomDetail();
  fillRoomSelect();
  renderAvailList();
  initContactForm();
  initReveal();
  const yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
});

/* edits made in the console (another tab) show up here without a reload */
window.addEventListener("storage", (e) => {
  if (e.key !== DB_KEY) return;
  renderHeroCount();
  renderFeatured();
  renderFilterChips();
  renderAllRooms();
  renderAvailList();
});
