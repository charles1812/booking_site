/* ============================================================
   MIRAVEL — public site rendering
   ============================================================ */

/* mobile nav */
function toggleNav() {
  document.querySelector(".nav__links")?.classList.toggle("open");
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

/* rooms page: all visible */
function renderAllRooms() {
  const wrap = document.getElementById("all-rooms");
  if (!wrap) return;
  const rooms = Store.visibleRooms();
  wrap.innerHTML = rooms.length ? rooms.map(roomCard).join("") : emptyRooms();
  initReveal();
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
  const thumbs = r.images.slice(1, 5).map((im, i) =>
    `<img src="${esc(im)}" alt="${esc(r.name)} photo ${i + 2}" onclick="document.getElementById('gallery-main').src='${esc(im)}'">`
  ).join("");

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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.email) {
      notice.className = "notice notice--warn";
      notice.textContent = "Please add at least your name and email.";
      notice.style.display = "block";
      return;
    }
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
  renderFeatured();
  renderAllRooms();
  renderRoomDetail();
  fillRoomSelect();
  initContactForm();
  initReveal();
});
