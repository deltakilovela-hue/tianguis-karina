const WHATSAPP_NUMBER = "526692703366"; // Karina — con lada de México (52)

const CATEGORY_LABELS = {
  "": "Todas",
  ropa_dama: "Dama",
  ropa_caballero: "Caballero",
  ropa_nina: "Niña",
  ropa_nino: "Niño",
  ropa_bebe: "Bebé",
  juguetes: "Juguetes",
  accesorios: "Accesorios",
  hogar: "Hogar",
  otros: "Otros",
};

const CATEGORY_ICONS = {
  "": "icon-grid",
  ropa_dama: "icon-dress",
  ropa_caballero: "icon-shirt",
  ropa_nina: "icon-dress",
  ropa_nino: "icon-shirt",
  ropa_bebe: "icon-onesie",
  juguetes: "icon-toy",
  accesorios: "icon-handbag",
  hogar: "icon-home",
  otros: "icon-grid",
};

let PRODUCTS = [];
let cart = new Set(loadCart());
let activeCategory = "";

const el = (sel) => document.querySelector(sel);
const grid = el("#productGrid");
const categoryPills = el("#categoryPills");
const sortFilter = el("#sortFilter");
const searchInput = el("#searchInput");
const resultCount = el("#resultCount");
const emptyState = el("#emptyState");
const cartCount = el("#cartCount");
const cartItemsEl = el("#cartItems");
const cartEmptyMsg = el("#cartEmptyMsg");
const cartSummary = el("#cartSummary");
const cartTotalEl = el("#cartTotal");
const cartReviewHeading = el("#cartReviewHeading");
const stickyCartBar = el("#stickyCartBar");
const stickyCartCount = el("#stickyCartCount");
const stickyCartLabel = el("#stickyCartLabel");
const stickyCartTotal = el("#stickyCartTotal");

function loadCart() {
  try {
    return JSON.parse(sessionStorage.getItem("karina_cart") || "[]");
  } catch {
    return [];
  }
}
function saveCart() {
  try {
    sessionStorage.setItem("karina_cart", JSON.stringify([...cart]));
  } catch {}
}

function money(n) {
  return "$" + Number(n).toLocaleString("es-MX");
}

function imgSrc(product, idx = 0) {
  return "images/" + product.images[idx];
}

async function init() {
  try {
    const res = await fetch("data/products.json");
    PRODUCTS = await res.json();
  } catch (e) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#a8543b">No se pudo cargar el catálogo (data/products.json).</p>';
    return;
  }

  buildCategoryPills();
  render();
  updateCartUI();
  bindEvents();
  maybeShowIntroOnLoad();
}

function buildCategoryPills() {
  const counts = {};
  PRODUCTS.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
  const cats = [...new Set(PRODUCTS.map((p) => p.category))].filter(Boolean).sort();

  const allPill = pillHTML("", "Todas", PRODUCTS.length, true);
  const rest = cats.map((c) => pillHTML(c, CATEGORY_LABELS[c] || c, counts[c])).join("");
  categoryPills.innerHTML = allPill + rest;

  categoryPills.querySelectorAll(".pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      categoryPills.querySelectorAll(".pill").forEach((b) => b.classList.toggle("active", b === btn));
      render();
    });
  });
}

function pillHTML(cat, label, count, active = false) {
  const icon = CATEGORY_ICONS[cat] || "icon-grid";
  return `
    <button class="pill${active ? " active" : ""}" data-cat="${cat}" type="button">
      <svg class="icon" width="16" height="16"><use href="#${icon}"/></svg>
      <span>${escapeHTML(label)}</span>
    </button>`;
}

function getFiltered() {
  const q = searchInput.value.trim().toLowerCase();
  const cat = activeCategory;
  const sort = sortFilter.value;

  let list = PRODUCTS.filter((p) => {
    const matchesCat = !cat || p.category === cat;
    const matchesQ =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);

  return list;
}

function render() {
  const list = getFiltered();
  resultCount.textContent = `${list.length} artículo${list.length === 1 ? "" : "s"}`;
  emptyState.hidden = list.length !== 0;
  grid.innerHTML = list.map((p, i) => cardHTML(p, i)).join("");

  grid.querySelectorAll(".carousel").forEach((c) => initCarousel(c));

  grid.querySelectorAll(".card-media, .card-title").forEach((node) => {
    node.addEventListener("click", () => openModal(node.closest(".card").dataset.id));
  });

  grid.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleCart(btn.dataset.id);
    });
  });
}

function carouselHTML(images, title, extraClass = "") {
  const multi = images.length > 1;
  const alt = escapeHTML(title);
  return `
  <div class="carousel ${extraClass}" data-count="${images.length}">
    <div class="carousel-track">
      ${images
        .map((img, i) => `<div class="carousel-slide"><img src="images/${img}" alt="${alt}"${i === 0 ? "" : ' loading="lazy"'} draggable="false"></div>`)
        .join("")}
    </div>
    ${
      multi
        ? `<span class="carousel-counter">1/${images.length}</span>
    <button type="button" class="carousel-arrow prev" aria-label="Foto anterior" hidden><svg class="icon" width="16" height="16"><use href="#icon-chevron"/></svg></button>
    <button type="button" class="carousel-arrow next" aria-label="Foto siguiente"><svg class="icon" width="16" height="16"><use href="#icon-chevron"/></svg></button>
    <div class="carousel-dots">${images.map((_, i) => `<span class="dot${i === 0 ? " active" : ""}"></span>`).join("")}</div>`
        : ""
    }
  </div>`;
}

function initCarousel(root, startIndex = 0) {
  const count = Number(root.dataset.count);
  if (count < 2) return;
  const track = root.querySelector(".carousel-track");
  const dots = [...root.querySelectorAll(".dot")];
  const counter = root.querySelector(".carousel-counter");
  const prev = root.querySelector(".prev");
  const next = root.querySelector(".next");

  const index = () => {
    const w = track.clientWidth;
    return w ? Math.min(count - 1, Math.max(0, Math.round(track.scrollLeft / w))) : 0;
  };
  const update = () => {
    const i = index();
    root.dataset.index = i;
    dots.forEach((d, k) => d.classList.toggle("active", k === i));
    counter.textContent = `${i + 1}/${count}`;
    prev.hidden = i === 0;
    next.hidden = i === count - 1;
  };
  const go = (i) => track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });

  track.addEventListener("scroll", update, { passive: true });
  prev.addEventListener("click", (e) => { e.stopPropagation(); go(index() - 1); });
  next.addEventListener("click", (e) => { e.stopPropagation(); go(index() + 1); });

  if (startIndex) track.scrollLeft = startIndex * track.clientWidth;
  update();
}

function cardHTML(p, i = 0) {
  const inCart = cart.has(p.id);
  const delay = Math.min(i, 11) * 35;
  return `
  <article class="card" data-id="${p.id}" style="animation-delay:${delay}ms">
    <div class="card-media">
      ${carouselHTML(p.images, p.title)}
      ${p.condition === "Nuevo con etiqueta" ? '<span class="badge new">Nuevo</span>' : ""}
    </div>
    <div class="card-body">
      <div class="card-title">${escapeHTML(p.title)}</div>
      <div class="card-meta">Talla: ${escapeHTML(p.size || "Única")}</div>
      <div class="card-price">${money(p.price)}</div>
      <button class="add-btn ${inCart ? "added" : ""}" data-id="${p.id}">
        ${
          inCart
            ? '<svg class="icon" width="14" height="14"><use href="#icon-check"/></svg><span>Agregado</span>'
            : "<span>Agregar al pedido</span>"
        }
      </button>
    </div>
  </article>`;
}

function escapeHTML(str) {
  const d = document.createElement("div");
  d.textContent = str ?? "";
  return d.innerHTML;
}

function toggleCart(id) {
  if (cart.has(id)) cart.delete(id);
  else cart.add(id);
  saveCart();
  updateCartUI();
  render();
}

function updateCartUI() {
  const items = PRODUCTS.filter((p) => cart.has(p.id));
  const prevCount = cartCount.textContent;
  cartCount.textContent = items.length;
  if (prevCount !== String(items.length)) {
    cartCount.classList.remove("bump");
    void cartCount.offsetWidth; // restart animation
    cartCount.classList.add("bump");
  }

  if (items.length === 0) {
    cartItemsEl.innerHTML = "";
    cartEmptyMsg.style.display = "block";
    cartSummary.style.display = "none";
    cartReviewHeading.style.display = "none";
    stickyCartBar.hidden = true;
    document.body.classList.remove("has-sticky-cart");
    return;
  }
  cartEmptyMsg.style.display = "none";
  cartSummary.style.display = "block";
  cartReviewHeading.style.display = "block";

  cartItemsEl.innerHTML = items
    .map(
      (p) => `
    <div class="cart-item">
      <img src="${imgSrc(p)}" alt="${escapeHTML(p.title)}">
      <div class="cart-item-info">
        <div class="cart-item-title">${escapeHTML(p.title)}</div>
        <div class="cart-item-meta">Talla: ${escapeHTML(p.size || "Única")}</div>
        <div class="cart-item-price">${money(p.price)}</div>
        <button class="remove-btn" data-id="${p.id}">Quitar</button>
      </div>
    </div>`
    )
    .join("");

  cartItemsEl.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => toggleCart(btn.dataset.id));
  });

  const total = items.reduce((sum, p) => sum + p.price, 0);
  cartTotalEl.textContent = money(total);

  stickyCartBar.hidden = false;
  stickyCartCount.textContent = items.length;
  stickyCartLabel.textContent = `Ver pedido (${items.length})`;
  stickyCartTotal.textContent = money(total);
  document.body.classList.add("has-sticky-cart");
}

function openCart() {
  el("#cartDrawer").classList.add("open");
  el("#overlay").classList.add("visible");
  el("#cartDrawer").setAttribute("aria-hidden", "false");
}
function closeCart() {
  el("#cartDrawer").classList.remove("open");
  el("#overlay").classList.remove("visible");
  el("#cartDrawer").setAttribute("aria-hidden", "true");
}

function openModal(id, startIndex = 0) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  const modal = el("#productModal");
  const inCart = cart.has(p.id);
  modal.innerHTML = `
    <button class="modal-close" id="modalCloseBtn" aria-label="Cerrar">
      <svg class="icon" width="16" height="16"><use href="#icon-close"/></svg>
    </button>
    ${carouselHTML(p.images, p.title, "modal-carousel")}
    <div class="modal-body">
      <div class="card-meta">${CATEGORY_LABELS[p.category] || ""} ${p.brand ? "· " + escapeHTML(p.brand) : ""}</div>
      <div class="card-title">${escapeHTML(p.title)}</div>
      <div class="card-meta">Talla: ${escapeHTML(p.size || "Única")} · ${escapeHTML(p.condition || "")}</div>
      <p class="desc">${escapeHTML(p.description || "")}</p>
      <div class="card-price">${money(p.price)}</div>
      <button class="add-btn ${inCart ? "added" : ""}" id="modalAddBtn" style="margin-top:12px">
        ${
          inCart
            ? '<svg class="icon" width="14" height="14"><use href="#icon-check"/></svg><span>Agregado</span>'
            : "<span>Agregar al pedido</span>"
        }
      </button>
    </div>
  `;
  el("#modalCloseBtn").addEventListener("click", closeModal);
  el("#modalAddBtn").addEventListener("click", () => {
    const current = Number(modal.querySelector(".carousel").dataset.index || 0);
    toggleCart(p.id);
    openModal(p.id, current);
  });
  el("#modalOverlay").classList.add("visible");
  initCarousel(modal.querySelector(".carousel"), startIndex);
}
function closeModal() {
  el("#modalOverlay").classList.remove("visible");
}

function openIntro() {
  el("#introOverlay").classList.add("visible");
}
function closeIntro() {
  el("#introOverlay").classList.remove("visible");
  try {
    localStorage.setItem("karina_intro_seen", "1");
  } catch {}
}
function maybeShowIntroOnLoad() {
  let seen = false;
  try {
    seen = localStorage.getItem("karina_intro_seen") === "1";
  } catch {}
  if (!seen) openIntro();
}

function buildWhatsAppMessage() {
  const items = PRODUCTS.filter((p) => cart.has(p.id));
  const name = el("#customerName").value.trim();
  const phone = el("#customerPhone").value.trim();
  const notes = el("#customerNotes").value.trim();
  const delivery = document.querySelector('input[name="delivery"]:checked').value;

  const deliveryText =
    delivery === "pickup"
      ? "Recoger en Cafetería La Cruz (9am–3pm)"
      : "Mandadito a domicilio (yo cubro el envío)";

  let lines = [];
  lines.push(`¡Hola Karina! 👋 Quiero pedir esto de tu catálogo:`);
  lines.push("");
  items.forEach((p, i) => {
    lines.push(`${i + 1}. ${p.title} (Talla: ${p.size || "Única"}) — ${money(p.price)}`);
  });
  const total = items.reduce((sum, p) => sum + p.price, 0);
  lines.push("");
  lines.push(`Total estimado: ${money(total)}`);
  lines.push("");
  lines.push(`Entrega: ${deliveryText}`);
  lines.push(`Nombre: ${name}`);
  if (phone) lines.push(`Teléfono: ${phone}`);
  if (notes) lines.push(`Notas: ${notes}`);

  return lines.join("\n");
}

function bindEvents() {
  searchInput.addEventListener("input", render);
  sortFilter.addEventListener("change", render);

  el("#cartBtn").addEventListener("click", openCart);
  stickyCartBar.addEventListener("click", openCart);
  el("#closeCart").addEventListener("click", closeCart);
  el("#overlay").addEventListener("click", closeCart);
  el("#modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closeModal();
  });

  el("#orderForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (cart.size === 0) return;
    const msg = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  });

  document.addEventListener("keydown", (e) => {
    const modalOpen = el("#modalOverlay").classList.contains("visible");
    if (e.key === "Escape") {
      closeModal();
      closeIntro();
      closeCart();
    } else if (modalOpen && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      const btn = el("#productModal ." + (e.key === "ArrowRight" ? "next" : "prev"));
      if (btn && !btn.hidden) btn.click();
    }
  });

  el("#helpBtn").addEventListener("click", openIntro);
  el("#introCloseBtn").addEventListener("click", closeIntro);
  el("#introGotItBtn").addEventListener("click", closeIntro);
  el("#introOverlay").addEventListener("click", (e) => {
    if (e.target.id === "introOverlay") closeIntro();
  });
}

init();
