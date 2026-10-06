/* ==========================================================
   main.js - all site behaviour.
   Each HTML page has <body data-page="..."> so we know which part to run.
   Settings and products live in products.js
   ========================================================== */

/* ---------- 1) SMALL HELPERS ---------- */
let SETTINGS = {};                                                      // filled from the admin panel (Supabase)
const $ = (sel, el = document) => el.querySelector(sel);
const money = n => STORE.currency + n.toLocaleString("en-IN");          // 2999 -> ₹2,999
const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
const waLink = text => `https://wa.me/${STORE.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

function toast(msg) {                                                   // small popup message
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}

/* ---------- 2) CART (saved in localStorage as { productId: quantity }) ---------- */
function getCart() {
  try { return JSON.parse(localStorage.getItem("cart")) || {}; } catch (e) { return {}; }
}
function saveCart(cart) {
  try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) { /* storage blocked */ }
  updateBadge();
}
function cartCount() { return Object.values(getCart()).reduce((a, b) => a + b, 0); }
function updateBadge() { const b = $("#cart-count"); if (b) b.textContent = cartCount(); }
function addToCart(id, qty = 1) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  saveCart(cart);
  toast("Added to cart ✓");
}

/* ---------- 3) HEADER, FOOTER AND WHATSAPP BUTTON (same on every page) ---------- */
function renderChrome() {
  const page = document.body.dataset.page;
  const links = [["index.html", "Home", "home"], ["shop.html", "Shop", "shop"], ["about.html", "About", "about"], ["contact.html", "Contact", "contact"]];
  $("#site-header").innerHTML = `
    <header class="header"><div class="wrap bar">
      <a class="logo" href="index.html">${SETTINGS.logo_url ? `<img src="${SETTINGS.logo_url}" alt="${STORE.name}" style="height:40px;width:auto">` : STORE.name}</a>
      <nav class="nav" id="nav" aria-label="Main menu">
        ${links.map(l => `<a href="${l[0]}" class="${page === l[2] ? "active" : ""}">${l[1]}</a>`).join("")}
      </nav>
      <a class="cart-link" href="cart.html" aria-label="Cart">🛒 <span id="cart-count">0</span></a>
      <button class="burger" id="burger" aria-label="Open menu">☰</button>
    </div></header>`;
  $("#burger").onclick = () => $("#nav").classList.toggle("open");

  $("#site-footer").innerHTML = `
    <footer>
      <p>${STORE.name} - stylish men's watches for every day.</p>
      <p><a href="${waLink("Hi! I have a question about your watches.")}">WhatsApp</a>
         <a href="${STORE.instagram}" rel="noopener">Instagram</a>
         <a href="contact.html">Contact</a></p>
      <p class="note">© ${new Date().getFullYear()} ${STORE.name}</p>
    </footer>
    <a class="wa" href="${waLink("Hi! I have a question about your watches.")}" aria-label="Chat with us on WhatsApp">💬 WhatsApp</a>`;
  updateBadge();
}

/* ---------- 4) PRODUCT CARD (used on home, shop and product pages) ---------- */
const card = p => `
  <a class="card" href="product.html?id=${p.id}">
    <div class="imgbox">${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
      <img src="${p.img}" alt="${p.name} - men's ${p.category.toLowerCase()} watch" loading="lazy"></div>
    <h3>${p.name}</h3>
    <p class="stars">${stars(p.rating)} <small>(${p.reviews})</small></p>
    <p class="price">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}</p>
  </a>`;

/* ---------- 5) HOME PAGE ---------- */
function initHome() { $("#featured").innerHTML = PRODUCTS.slice(0, 4).map(card).join(""); }

/* ---------- 6) SHOP PAGE (category filter + price sort) ---------- */
function initShop() {
  let cat = "All", sort = "";
  const cats = ["All", ...new Set(PRODUCTS.map(p => p.category))];
  $("#filters").innerHTML = cats.map(c => `<button class="chip" data-c="${c}">${c}</button>`).join("") +
    `<select id="sort" aria-label="Sort watches"><option value="">Sort by</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option></select>`;

  function draw() {
    const list = PRODUCTS.filter(p => cat === "All" || p.category === cat);
    if (sort === "lo") list.sort((a, b) => a.price - b.price);
    if (sort === "hi") list.sort((a, b) => b.price - a.price);
    $("#grid").innerHTML = list.map(card).join("");
    document.querySelectorAll(".chip").forEach(b => b.classList.toggle("on", b.dataset.c === cat));
  }
  $("#filters").onclick = e => { if (e.target.dataset.c) { cat = e.target.dataset.c; draw(); } };
  $("#sort").onchange = e => { sort = e.target.value; draw(); };
  draw();
}

/* ---------- 7) PRODUCT PAGE (product.html?id=3) ---------- */
function initProduct() {
  const id = Number(new URLSearchParams(location.search).get("id"));
  const p = PRODUCTS.find(x => x.id === id);
  const box = $("#product");
  if (!p) { box.innerHTML = `<p>We could not find that watch. <a href="shop.html"><u>Back to shop</u></a></p>`; return; }

  document.title = `${p.name} - Men's Watch | ${STORE.name}`;           // unique title per product
  $("meta[name=description]").content = `${p.name}: ${p.desc}`;
  let qty = 1;
  box.innerHTML = `
    <div class="pd">
      <div class="imgbox"><img src="${p.img}" alt="${p.name} - men's ${p.category.toLowerCase()} watch"></div>
      <div>
        <p class="eyebrow">${p.category} watch</p>
        <h1>${p.name}</h1>
        <p class="stars">${stars(p.rating)} <small>${p.rating} (${p.reviews} reviews)</small></p>
        <p class="price lg">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}</p>
        <p>${p.desc}</p>
        <div class="qty"><button id="minus" aria-label="Less">−</button><span id="q">1</span><button id="plus" aria-label="More">+</button></div>
        <button class="btn btn-block" id="add">Add to cart</button>
        <a class="btn btn-ghost btn-block" href="${waLink(`Hi! I am interested in the ${p.name}.`)}">Ask on WhatsApp</a>
      </div>
    </div>`;
  $("#minus").onclick = () => { qty = Math.max(1, qty - 1); $("#q").textContent = qty; };
  $("#plus").onclick = () => { qty++; $("#q").textContent = qty; };
  $("#add").onclick = () => addToCart(p.id, qty);

  $("#reviews").innerHTML = `<h2>Customer reviews</h2>` + REVIEWS.map(r =>
    `<div class="review"><b>${r.name}</b> <span class="stars">${stars(r.stars)}</span><p>${r.text}</p></div>`).join("") +
    `<p class="note">Sample reviews. Replace them in js/products.js.</p>`;
  $("#related").innerHTML = PRODUCTS.filter(x => x.id !== p.id).slice(0, 4).map(card).join("");
}

/* ---------- 8) CART PAGE + WHATSAPP CHECKOUT ---------- */
function initCart() {
  const box = $("#cart-box"), form = $("#checkout");
  let disc = 0;                                                         // discount percent currently applied
  const lines = () => Object.entries(getCart())
    .map(([id, q]) => ({ p: PRODUCTS.find(x => x.id === Number(id)), q })).filter(i => i.p);
  const totalOf = items => items.reduce((s, i) => s + i.p.price * i.q, 0);
  const finalOf = items => Math.round(totalOf(items) * (100 - disc) / 100);

  /* payment choices (set in the admin panel) */
  const cod = SETTINGS.cod !== "no", online = (SETTINGS.online_info || "").trim();
  const radio = (v, on) => `<label style="display:flex;gap:.6rem;align-items:center;min-height:44px"><input type="radio" name="pay" value="${v}" ${on ? "checked" : ""} style="width:auto;min-height:0"> ${v}</label>`;
  $("#pay-options").innerHTML = (cod ? radio("Cash on delivery", true) : "") + (online ? radio("Online payment", !cod) : "") ||
    "<p class='note'>We will confirm payment with you on WhatsApp.</p>";
  $("#online-text").textContent = online;
  const showOnline = () => { const r = form.querySelector("input[name=pay]:checked"); $("#upi").hidden = !(online && r && r.value === "Online payment"); };
  form.addEventListener("change", showOnline); showOnline();

  function draw() {
    const items = lines();
    if (!items.length) {
      box.innerHTML = `<p class="center">Your cart is empty.</p><p class="center"><a class="btn" href="shop.html">Shop watches</a></p>`;
      form.hidden = true; return;
    }
    form.hidden = false;
    box.innerHTML = items.map(({ p, q }) => `
      <div class="row">
        <img src="${p.img}" alt="${p.name} watch">
        <div><b>${p.name}</b><br>${money(p.price)}
          <div class="qty"><button data-a="dec" data-id="${p.id}" aria-label="Less">−</button><span>${q}</span><button data-a="inc" data-id="${p.id}" aria-label="More">+</button></div></div>
        <div><b>${money(p.price * q)}</b><br><button class="link" data-a="del" data-id="${p.id}">Remove</button></div>
      </div>`).join("") +
      `<p class="total">${disc ? `<small>Discount ${disc}%: −${money(totalOf(items) - finalOf(items))}</small><br>` : ""}Total: <b>${money(finalOf(items))}</b></p>`;
  }
  box.onclick = e => {                                                  // + / − / remove buttons
    const b = e.target.closest("button[data-a]"); if (!b) return;
    const cart = getCart(), id = b.dataset.id;
    if (b.dataset.a === "inc") cart[id]++;
    if (b.dataset.a === "dec") cart[id] = Math.max(1, cart[id] - 1);
    if (b.dataset.a === "del") delete cart[id];
    saveCart(cart); draw();
  };

  $("#apply").onclick = () => {                                         // discount code
    const typed = $("#code").value.trim().toLowerCase(), real = (SETTINGS.discount_code || "").trim().toLowerCase();
    const pct = Number(SETTINGS.discount_percent) || 0;
    if (real && pct && typed === real) { disc = Math.min(pct, 90); $("#disc").textContent = `Code applied: ${disc}% off ✓`; }
    else { disc = 0; $("#disc").textContent = "This code is not valid."; }
    draw();
  };

  form.onsubmit = e => {                                                // build the WhatsApp order message
    e.preventDefault();
    const items = lines(), f = new FormData(form);
    const msg = `*New order - ${STORE.name}*\n\nName: ${f.get("name")}\nPhone: ${f.get("phone")}\nAddress: ${f.get("address")}\nPayment: ${f.get("pay") || "to be confirmed"}\n\n*Items*\n` +
      items.map((i, n) => `${n + 1}. ${i.p.name} x ${i.q} = ${money(i.p.price * i.q)}`).join("\n") +
      (disc ? `\nDiscount code: ${$("#code").value.trim()} (${disc}% off)` : "") +
      `\n\n*Total: ${money(finalOf(items))}*`;
    window.open(waLink(msg), "_blank");
  };
  draw();
}

/* ---------- 9) START: run the right code for the current page ---------- */
/* Products come from Supabase (set by the admin panel).
   If Supabase is empty or not reachable, the list in products.js is used instead. */
const SUPABASE_URL = "https://xwxoeibjefzyxhheabdy.supabase.co";
const SUPABASE_KEY = "sb_publishable_8yqxSB2Ag5-6YoPV2iEc4g_eAwy8a-M";   // public key, safe here

async function loadProducts() {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 6000);                               // give up after 6 seconds
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&active=eq.true&order=id`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, signal: ctrl.signal });
    if (!res.ok) return;
    const rows = await res.json();
    if (!Array.isArray(rows) || !rows.length) return;                   // nothing in Supabase: keep products.js
    PRODUCTS.length = 0;
    rows.forEach(r => PRODUCTS.push({
      id: r.id, name: r.name, price: r.price, oldPrice: r.old_price || 0, category: r.category || "Casual",
      img: r.img || "images/watch-1.svg", badge: r.badge || "", rating: Number(r.rating) || 4.5,
      reviews: r.reviews || 0, desc: r.description || ""
    }));
  } catch (e) { /* keep products.js list */ }
}

/* Banner image chosen in the admin panel (home page only). If none is set, the banner from style.css stays. */
/* Store settings from the admin panel: name, WhatsApp, logo, payment, discount, banner */
async function loadSettings() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=key,value`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!res.ok) return;
    (await res.json()).forEach(r => { SETTINGS[r.key] = r.value; });
    if (SETTINGS.store_name) STORE.name = SETTINGS.store_name;
    const num = (SETTINGS.whatsapp || "").replace(/\D/g, "");
    if (num) STORE.whatsapp = num;
  } catch (e) { /* keep the values from products.js */ }
}
function loadBanner() {                                                 // banner picture (home page only)
  const img = $("#hero-img"), url = SETTINGS.hero_image;
  if (img && url && url.startsWith("https://")) img.src = url;
}

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([loadProducts(), loadSettings()]);
  renderChrome();
  const page = document.body.dataset.page;
  if (page === "home") { initHome(); loadBanner(); }
  if (page === "shop") initShop();
  if (page === "product") initProduct();
  if (page === "cart") initCart();
});
