/* ==========================================================
   main.js - LuxeCraft Watches (Pakistan)
   Complete client architecture & Supabase integration
   ========================================================== */

/* ---------- 1) STATE & CENTRALIZED HELPERS ---------- */
let SETTINGS = {};                                         // Populated from Supabase site_settings
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

// Standard Pakistani currency formatter: e.g. Rs. 4,999
const money = n => "Rs. " + Number(n || 0).toLocaleString("en-PK");

// Star ratings generator
const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

// WhatsApp deep link generator
const waLink = text => `https://wa.me/${(STORE.whatsapp || "923273651015").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

// Toast notification helper
function toast(msg) {
  const existing = $(".toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

// Analytics event dispatcher (GA4 / Pixel ready)
function trackEvent(name, data = {}) {
  try {
    const detail = { event: name, timestamp: new Date().toISOString(), currency: "PKR", ...data };
    window.dispatchEvent(new CustomEvent("ecommerce_event", { detail }));
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...data });
    }
  } catch (e) { /* ignore */ }
}

/* ---------- 2) CART MANAGEMENT (Persistent in localStorage) ---------- */
function getCart() {
  try {
    const raw = JSON.parse(localStorage.getItem("cart") || "{}");
    const sanitized = {};
    for (const [id, qty] of Object.entries(raw)) {
      const numId = Number(id), numQty = Number(qty);
      if (numId > 0 && numQty > 0) sanitized[numId] = Math.min(99, Math.floor(numQty));
    }
    return sanitized;
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) { /* storage unavailable */ }
  updateBadge();
}

function cartCount() {
  return Object.values(getCart()).reduce((a, b) => a + b, 0);
}

function updateBadge() {
  const b = $("#cart-count");
  if (b) b.textContent = cartCount();
}

function addToCart(id, qty = 1) {
  const p = PRODUCTS.find(x => x.id === Number(id));
  if (!p) { toast("Product not found"); return; }
  if (p.inStock === false) { toast("Sorry, this watch is currently out of stock"); return; }

  const cart = getCart();
  cart[id] = Math.min(99, (cart[id] || 0) + Math.max(1, qty));
  saveCart(cart);
  toast(`Added ${p.name} to cart ✓`);
  trackEvent("add_to_cart", { item_id: p.id, item_name: p.name, price: p.price, quantity: qty });
  openDrawer();
}

/* Canonical order lines calculator (Never trusts prices from client markup) */
function getCartLines() {
  const cart = getCart();
  return Object.entries(cart)
    .map(([id, q]) => {
      const p = PRODUCTS.find(x => x.id === Number(id));
      return p ? { p, q, itemTotal: p.price * q } : null;
    })
    .filter(Boolean);
}

function calculateCartTotals(items, discountPercent = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.p.price * item.q, 0);
  const discPct = Math.max(0, Math.min(90, Number(discountPercent) || 0));
  const discountAmount = discPct > 0 ? Math.round(subtotal * (discPct / 100)) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  const fee = Number(SETTINGS.shipping_fee ?? STORE.shippingFee ?? 250);
  const freeMin = Number(SETTINGS.free_shipping_min ?? STORE.freeShippingMin ?? 5000);

  const isFree = freeMin > 0 && discountedSubtotal >= freeMin;
  const shippingFee = (items.length && !isFree && fee > 0) ? fee : 0;
  const total = discountedSubtotal + shippingFee;

  return { subtotal, discountPercent: discPct, discountAmount, shippingFee, isFree, freeMin, total };
}

/* ---------- 3) GLOBAL CHROME (HEADER, FOOTER & WHATSAPP) ---------- */
function renderChrome() {
  const page = document.body.dataset.page;
  const storeName = SETTINGS.store_name || STORE.name || "LuxeCraft Watches";
  const navLinks = [
    ["index.html", "Home", "home"],
    ["shop.html", "Shop", "shop"],
    ["about.html", "About", "about"],
    ["contact.html", "Contact", "contact"]
  ];

  const headerBox = $("#site-header");
  if (headerBox) {
    headerBox.innerHTML = `
      <header class="header">
        <div class="wrap bar">
          <a class="logo" href="index.html" aria-label="${storeName} Home">
            ${SETTINGS.logo_url
              ? `<img src="${SETTINGS.logo_url}" alt="${storeName}">`
              : `<span>${storeName}</span>`}
          </a>
          <nav class="nav" id="nav" aria-label="Main Navigation">
            ${navLinks.map(l => `<a href="${l[0]}" class="${page === l[2] ? "active" : ""}">${l[1]}</a>`).join("")}
          </nav>
          <a class="cart-link" href="cart.html" aria-label="View Shopping Cart">
            🛒 <span id="cart-count">0</span>
          </a>
          <button class="burger" id="burger" aria-label="Toggle navigation menu">☰</button>
        </div>
      </header>`;

    const burger = $("#burger");
    if (burger) {
      burger.onclick = () => $("#nav").classList.toggle("open");
    }
  }

  const footerBox = $("#site-footer");
  if (footerBox) {
    footerBox.innerHTML = `
      <footer>
        <div class="wrap">
          <h3 style="color:#fff;margin-bottom:.3rem">${storeName}</h3>
          <p>${STORE.tagline || "Curated luxury and everyday men's watches across Pakistan."}</p>
          <div class="footer-links">
            <a href="shop.html">Browse Watches</a>
            <a href="about.html">About Us</a>
            <a href="contact.html">Contact Us</a>
            <a href="cart.html">View Cart</a>
            <a href="${waLink("Hi! I have an inquiry about LuxeCraft watches.")}" target="_blank" rel="noopener">WhatsApp Support</a>
          </div>
          <p class="note" style="margin-top:.8rem">Cash on Delivery Available Nationwide · 2-4 Days Fast Delivery</p>
          <p class="note" style="margin-top:.4rem">© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
        </div>
      </footer>
      <a class="wa" href="${waLink("Assalam-o-Alaikum! I want to inquire about a watch.")}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
        💬 WhatsApp
      </a>`;
  }
  updateBadge();
}

/* ---------- 4) PRODUCT CARD TEMPLATE ---------- */
const card = p => {
  const inStock = p.inStock !== false;
  return `
    <article class="card">
      <a href="product.html?id=${p.id}" style="display:block">
        <div class="imgbox">
          ${p.badge ? `<span class="badge ${p.badge.toLowerCase().includes('sale') ? 'badge-sale' : 'badge-new'}">${p.badge}</span>` : ""}
          <img src="${p.img}" alt="${p.name} - men's ${p.category?.toLowerCase() || 'wrist'} watch" loading="lazy" width="280" height="280">
        </div>
        <div style="padding:.5rem .1rem .8rem">
          <h3>${p.name}</h3>
          <p class="stars">${stars(p.rating || 4.5)} <small>(${p.reviews || 0})</small></p>
          <p class="price">${money(p.price)}${p.oldPrice ? ` <s>${money(p.oldPrice)}</s>` : ""}</p>
          <span class="stock-tag ${inStock ? 'in' : 'out'}">${inStock ? '● In Stock' : '✕ Out of Stock'}</span>
        </div>
      </a>
      <button class="btn btn-block ${inStock ? '' : 'btn-ghost'}" data-add="${p.id}" ${inStock ? '' : 'disabled'} style="margin-top:auto">
        ${inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </article>`;
};

// Global click listener for fast "Add to Cart" on cards
document.addEventListener("click", e => {
  const btn = e.target.closest("button[data-add]");
  if (btn) {
    e.preventDefault();
    addToCart(Number(btn.dataset.add), 1);
  }
});

/* ---------- 5) HOME PAGE ---------- */
function initHome() {
  const fBox = $("#featured");
  if (fBox) {
    fBox.innerHTML = PRODUCTS.slice(0, 4).map(card).join("");
  }
}

/* ---------- 6) SHOP PAGE ---------- */
function initShop() {
  let cat = "All", sort = "";
  const filterBox = $("#filters"), gridBox = $("#grid");
  if (!filterBox || !gridBox) return;

  const cats = ["All", ...new Set(PRODUCTS.map(p => p.category).filter(Boolean))];
  filterBox.innerHTML =
    cats.map(c => `<button class="chip ${c === 'All' ? 'on' : ''}" data-c="${c}">${c}</button>`).join("") +
    `<select id="sort" aria-label="Sort watches">
       <option value="">Sort by</option>
       <option value="lo">Price: Low to High</option>
       <option value="hi">Price: High to Low</option>
       <option value="rating">Highest Rated</option>
     </select>`;

  function draw() {
    let list = PRODUCTS.filter(p => cat === "All" || p.category === cat);
    if (sort === "lo") list.sort((a, b) => a.price - b.price);
    if (sort === "hi") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    gridBox.innerHTML = list.length
      ? list.map(card).join("")
      : `<p class="center" style="grid-column:1/-1;padding:2rem">No watches found in this category.</p>`;

    $$(".chip", filterBox).forEach(b => b.classList.toggle("on", b.dataset.c === cat));
  }

  filterBox.onclick = e => {
    const chip = e.target.closest(".chip");
    if (chip) { cat = chip.dataset.c; draw(); }
  };
  $("#sort").onchange = e => { sort = e.target.value; draw(); };
  draw();
}

/* ---------- 7) PRODUCT DETAIL PAGE ---------- */
function initProduct() {
  const id = Number(new URLSearchParams(location.search).get("id"));
  const p = PRODUCTS.find(x => x.id === id);
  const box = $("#product");
  if (!box) return;

  if (!p) {
    box.innerHTML = `<p class="center">We could not find that watch. <br><br><a class="btn" href="shop.html">Back to Shop</a></p>`;
    return;
  }

  const storeName = SETTINGS.store_name || STORE.name;
  document.title = `${p.name} - Men's Watch in Pakistan | ${storeName}`;
  const descMeta = $("meta[name=description]");
  if (descMeta) descMeta.content = `${p.name}: ${p.desc} Order on Cash on Delivery across Pakistan for ${money(p.price)}.`;

  let qty = 1;
  const inStock = p.inStock !== false;

  box.innerHTML = `
    <div class="pd">
      <div class="imgbox" style="border-radius:20px;overflow:hidden;background:var(--grey)">
        <img src="${p.img}" alt="${p.name} - men's ${p.category} watch" width="500" height="500" style="width:100%;height:auto;object-fit:cover">
      </div>
      <div>
        <p class="eyebrow">${p.category} Collection · SKU: ${p.sku || `LC-${p.id}`}</p>
        <h1 style="margin:.3rem 0 .5rem">${p.name}</h1>
        <p class="stars">${stars(p.rating || 4.5)} <small>${p.rating || 4.5} (${p.reviews || 0} customer reviews)</small></p>
        <p class="price lg">${money(p.price)}${p.oldPrice ? ` <s>${money(p.oldPrice)}</s>` : ""}</p>

        <p style="margin-bottom:1rem;color:#333">${p.desc}</p>

        <div style="margin-bottom:1.2rem">
          <span class="stock-tag ${inStock ? 'in' : 'out'}" style="font-size:.9rem">
            ${inStock ? '● In Stock — Dispatches within 24 hours' : '✕ Currently Out of Stock'}
          </span>
        </div>

        ${inStock ? `
        <div class="qty">
          <button id="minus" type="button" aria-label="Decrease quantity">−</button>
          <span id="q">1</span>
          <button id="plus" type="button" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn btn-block" id="add">Add to Cart</button>
        <button class="btn btn-block" id="buy" style="background:#b83226;border-color:#b83226;color:#fff">Buy It Now (Cash on Delivery)</button>
        ` : `
        <button class="btn btn-block btn-ghost" disabled>Out of Stock</button>
        `}

        <a class="btn btn-ghost btn-block" href="${waLink(`Hi! I am interested in the ${p.name} (${money(p.price)}). Can you share more details?`)}" target="_blank" rel="noopener">
          Inquire on WhatsApp
        </a>

        <div style="background:var(--grey);border-radius:14px;padding:1rem;margin-top:1.5rem;font-size:.88rem">
          <p>🚚 <b>Free Delivery</b> across Pakistan on orders above Rs. 5,000</p>
          <p style="margin-top:.3rem">📦 <b>Cash on Delivery</b> available nationwide (TCS / Leopards)</p>
          <p style="margin-top:.3rem">🛡️ <b>7-Day Checking Warranty</b> on all movements</p>
        </div>
      </div>
    </div>`;

  if (inStock) {
    $("#minus").onclick = () => { qty = Math.max(1, qty - 1); $("#q").textContent = qty; };
    $("#plus").onclick = () => { qty = Math.min(99, qty + 1); $("#q").textContent = qty; };
    $("#add").onclick = () => addToCart(p.id, qty);
    $("#buy").onclick = () => {
      const c = getCart();
      c[p.id] = (c[p.id] || 0) + qty;
      saveCart(c);
      location.href = "cart.html";
    };
  }

  // Reviews section
  const revBox = $("#reviews");
  if (revBox) {
    revBox.innerHTML = `
      <h2>Customer Reviews (${p.reviews || REVIEWS.length})</h2>` +
      REVIEWS.map(r => `
        <div class="review">
          <b>${r.name}</b> <span class="stars">${stars(r.stars)}</span>
          <p>${r.text}</p>
        </div>`).join("");
  }

  // Related products
  const relBox = $("#related");
  if (relBox) {
    relBox.innerHTML = PRODUCTS.filter(x => x.id !== p.id).slice(0, 4).map(card).join("");
  }

  trackEvent("view_item", { item_id: p.id, item_name: p.name, price: p.price, category: p.category });
}

/* ---------- 8) CART & PROFESSIONAL CHECKOUT ---------- */
function initCart() {
  const cartBox = $("#cart-box"), form = $("#checkout"), successBox = $("#order-success");
  if (!cartBox || !form) return;

  let currentDiscountPercent = 0;
  let isSubmitting = false;

  function renderSummary() {
    const items = getCartLines();
    const totals = calculateCartTotals(items, currentDiscountPercent);

    $("#cs-subtotal").textContent = money(totals.subtotal);
    const discRow = $("#cs-discount-row");
    if (totals.discountAmount > 0) {
      discRow.style.display = "flex";
      $("#cs-discount").textContent = `−${money(totals.discountAmount)} (${totals.discountPercent}%)`;
    } else {
      discRow.style.display = "none";
    }

    $("#cs-shipping").textContent = totals.shippingFee === 0 ? "FREE" : money(totals.shippingFee);
    $("#cs-total").textContent = money(totals.total);
    return totals;
  }

  function renderPaymentOptions() {
    const payBox = $("#pay-options");
    if (!payBox) return;

    const methods = STORE.paymentMethods || [
      { id: "cod", name: "Cash on Delivery (COD)", default: true, badge: "Most Popular" },
      { id: "jazzcash", name: "JazzCash" },
      { id: "easypaisa", name: "Easypaisa" },
      { id: "bank", name: "Bank Transfer" }
    ];

    payBox.innerHTML = methods.map((m, idx) => `
      <label class="pay-opt-label ${idx === 0 ? 'selected' : ''}" data-pay-id="${m.id}">
        <div class="pay-opt-left">
          <input type="radio" name="payment_method" value="${m.name}" ${idx === 0 ? 'checked' : ''}>
          <span>${m.name}</span>
        </div>
        ${m.badge ? `<span class="pay-badge">${m.badge}</span>` : ''}
      </label>
    `).join("");

    payBox.onchange = e => {
      $$(".pay-opt-label", payBox).forEach(lbl => {
        const checked = lbl.querySelector("input").checked;
        lbl.classList.toggle("selected", checked);
      });
      updatePaymentGuide();
    };

    updatePaymentGuide();
  }

  function updatePaymentGuide() {
    const checked = $("input[name=payment_method]:checked", form);
    const guideBox = $("#payment-guide");
    const upiBox = $("#upi");
    if (!checked || !guideBox || !upiBox) return;

    const selectedName = checked.value;
    const methodObj = (STORE.paymentMethods || []).find(m => m.name === selectedName);

    if (methodObj && methodObj.info) {
      upiBox.hidden = false;
      guideBox.innerHTML = `
        <h4 style="margin-bottom:.4rem">Instructions for ${selectedName}</h4>
        <p style="white-space:pre-line;font-size:.9rem;color:#333">${methodObj.info}</p>
        <p class="note" style="margin-top:.4rem">You can place the order now and send the payment confirmation via WhatsApp.</p>
      `;
    } else if (selectedName.includes("Cash on Delivery")) {
      upiBox.hidden = false;
      guideBox.innerHTML = `
        <p style="font-size:.9rem;color:#1e7e34"><b>✓ Pay when you receive your parcel.</b> No advance payment required.</p>
        <p class="note" style="margin-top:.2rem">Our courier partner will deliver to your doorstep and collect cash.</p>
      `;
    } else {
      upiBox.hidden = true;
    }
  }

  function drawCart() {
    const items = getCartLines();
    if (!items.length) {
      cartBox.innerHTML = `
        <div class="center" style="padding:2.5rem 0">
          <p style="font-size:1.2rem;margin-bottom:1rem">Your cart is currently empty.</p>
          <a class="btn" href="shop.html">Discover Watches</a>
        </div>`;
      form.hidden = true;
      if (successBox && !successBox.hidden) {
        // User just completed an order; keep success message visible
      }
      return;
    }

    form.hidden = false;
    if (successBox) successBox.hidden = true;

    cartBox.innerHTML = items.map(({ p, q }) => `
      <div class="row">
        <img src="${p.img}" alt="${p.name} watch" width="80" height="80">
        <div>
          <b>${p.name}</b><br>
          <span style="font-size:.9rem">${money(p.price)}</span>
          <div class="qty" style="margin:.3rem 0 0">
            <button data-a="dec" data-id="${p.id}" type="button" aria-label="Decrease quantity">−</button>
            <span>${q}</span>
            <button data-a="inc" data-id="${p.id}" type="button" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div>
          <b>${money(p.price * q)}</b><br>
          <button class="link" data-a="del" data-id="${p.id}" type="button" style="color:#d94b3d">Remove</button>
        </div>
      </div>
    `).join("");

    renderSummary();
  }

  // Cart item modifications
  cartBox.onclick = e => {
    const b = e.target.closest("[data-a]");
    if (!b) return;
    const cart = getCart();
    const id = Number(b.dataset.id);
    if (!id) return;

    if (b.dataset.a === "inc") cart[id] = Math.min(99, (cart[id] || 0) + 1);
    if (b.dataset.a === "dec") {
      if ((cart[id] || 0) <= 1) delete cart[id];
      else cart[id]--;
    }
    if (b.dataset.a === "del") delete cart[id];

    saveCart(cart);
    drawCart();
  };

  // Discount code handler
  $("#apply").onclick = () => {
    const codeInput = $("#code");
    const typed = (codeInput?.value || "").trim().toUpperCase();
    const serverCode = (SETTINGS.discount_code || "").trim().toUpperCase();
    const serverPct = Number(SETTINGS.discount_percent) || 0;
    const discMsg = $("#disc");

    if (!typed) {
      currentDiscountPercent = 0;
      discMsg.textContent = "Please enter a discount code.";
      discMsg.style.color = "var(--danger)";
      renderSummary();
      return;
    }

    // Match either Supabase configured code or default store code WELCOME10
    if ((serverCode && typed === serverCode && serverPct > 0)) {
      currentDiscountPercent = Math.min(serverPct, 90);
      discMsg.textContent = `Promo applied! You saved ${currentDiscountPercent}% ✓`;
      discMsg.style.color = "var(--success)";
    } else if (typed === "WELCOME10") {
      currentDiscountPercent = 10;
      discMsg.textContent = "Welcome coupon applied: 10% OFF ✓";
      discMsg.style.color = "var(--success)";
    } else {
      currentDiscountPercent = 0;
      discMsg.textContent = "Invalid or expired discount code.";
      discMsg.style.color = "var(--danger)";
    }
    renderSummary();
  };

  // Phone validation helper for Pakistani numbers (03XX-XXXXXXX or 03XXXXXXXXX or +923...)
  function validatePakistaniPhone(raw) {
    const clean = raw.replace(/[\s\-()]/g, "");
    const pkPattern = /^(03[0-9]{9}|\+923[0-9]{9}|923[0-9]{9})$/;
    return pkPattern.test(clean);
  }

  // Checkout form submission
  form.onsubmit = async e => {
    e.preventDefault();
    if (isSubmitting) return;

    // Reset errors
    $$(".field-error", form).forEach(el => { el.textContent = ""; el.classList.remove("active"); });
    const errBanner = $("#checkout-error-banner");
    errBanner.style.display = "none";

    const items = getCartLines();
    if (!items.length) {
      toast("Your cart is empty.");
      return;
    }

    const f = new FormData(form);
    const name = (f.get("name") || "").toString().trim();
    const phone = (f.get("phone") || "").toString().trim();
    const email = (f.get("email") || "").toString().trim();
    const city = (f.get("city") || "").toString().trim();
    const address = (f.get("address") || "").toString().trim();
    const notes = (f.get("notes") || "").toString().trim();
    const paymentMethod = (f.get("payment_method") || "Cash on Delivery (COD)").toString().trim();

    let hasError = false;

    if (!name || name.length < 3) {
      const el = $("#err-name"); el.textContent = "Please enter your full name (at least 3 letters)."; el.classList.add("active");
      hasError = true;
    }

    if (!phone || !validatePakistaniPhone(phone)) {
      const el = $("#err-phone"); el.textContent = "Please enter a valid Pakistani mobile number (e.g. 03001234567)."; el.classList.add("active");
      hasError = true;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const el = $("#err-email"); el.textContent = "Please enter a valid email address."; el.classList.add("active");
      hasError = true;
    }

    if (!city || city.length < 2) {
      const el = $("#err-city"); el.textContent = "Please enter your delivery city."; el.classList.add("active");
      hasError = true;
    }

    if (!address || address.length < 8) {
      const el = $("#err-address"); el.textContent = "Please enter your complete street/house address."; el.classList.add("active");
      hasError = true;
    }

    if (hasError) {
      toast("Please correct the highlighted fields.");
      return;
    }

    // Canonical calculations
    const totals = calculateCartTotals(items, currentDiscountPercent);

    // Prepare order payload
    const orderItems = items.map(i => ({
      id: i.p.id,
      name: i.p.name,
      sku: i.p.sku || `LC-${i.p.id}`,
      price: i.p.price,
      quantity: i.q,
      qty: i.q,
      img: i.p.img
    }));

    const orderPayload = {
      customer_name: name,
      customer_phone: phone,
      customer_email: email || null,
      customer_address: address,
      city: city,
      items: orderItems,
      subtotal: totals.subtotal,
      shipping_fee: totals.shippingFee,
      discount: totals.discountAmount,
      total: totals.total,
      payment_method: paymentMethod,
      status: "pending",
      notes: notes || null
    };

    // UI Loading state to prevent duplicate submissions
    isSubmitting = true;
    const submitBtn = $("#place-order-btn");
    const submitText = $("#submit-text");
    const spinner = $("#submit-spinner");
    submitBtn.disabled = true;
    submitText.textContent = "Placing Your Order...";
    spinner.style.display = "inline-block";

    let orderId = null;
    let savedToSupabase = false;

    try {
      // 1) Primary Save to Supabase orders table
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length && rows[0].id) {
          orderId = rows[0].id;
          savedToSupabase = true;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn("Supabase order insert response:", res.status, errJson);
      }
    } catch (netErr) {
      console.warn("Network error during Supabase order creation:", netErr);
    }

    // Resilient fallback Order ID if Supabase RLS is waiting for manual admin migration
    if (!orderId) {
      orderId = "LC-" + Date.now().toString().slice(-6);
    }

    // Save order locally for backup ledger
    try {
      const localLedger = JSON.parse(localStorage.getItem("luxecraft_orders") || "[]");
      localLedger.unshift({ ...orderPayload, id: orderId, savedToSupabase, created_at: new Date().toISOString() });
      localStorage.setItem("luxecraft_orders", JSON.stringify(localLedger.slice(0, 30)));
    } catch (e) { /* ignore */ }

    trackEvent("purchase", {
      transaction_id: orderId,
      value: totals.total,
      items: orderItems.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.q }))
    });

    // Clear cart
    saveCart({});

    // Render Order Confirmation Screen
    form.hidden = true;
    cartBox.innerHTML = "";
    successBox.hidden = false;

    $("#succ-order-id").textContent = `#${orderId}`;
    $("#succ-payment-method").textContent = paymentMethod;
    $("#succ-total-amount").textContent = money(totals.total);
    $("#succ-customer-name").textContent = name;
    $("#succ-customer-phone").textContent = phone;
    $("#succ-customer-city").textContent = city;
    $("#succ-customer-address").textContent = address;

    $("#succ-items-list").innerHTML = orderItems.map(item => `
      <div style="display:flex;justify-content:space-between;padding:.3rem 0;font-size:.9rem">
        <span>${item.name} × ${item.quantity}</span>
        <b>${money(item.price * item.quantity)}</b>
      </div>
    `).join("");

    // Formatted WhatsApp message link for optional WhatsApp confirmation
    const storeName = SETTINGS.store_name || STORE.name;
    const waText =
      `*Order Confirmation - ${storeName}*\n\n` +
      `*Order ID:* #${orderId}\n` +
      `*Customer:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*City:* ${city}\n` +
      `*Address:* ${address}\n` +
      `*Payment:* ${paymentMethod}\n\n` +
      `*Items:*\n` +
      orderItems.map((i, idx) => `${idx + 1}. ${i.name} (Qty: ${i.quantity}) — ${money(i.price * i.quantity)}`).join("\n") +
      `\n\n*Subtotal:* ${money(totals.subtotal)}` +
      (totals.discountAmount > 0 ? `\n*Discount:* −${money(totals.discountAmount)}` : "") +
      `\n*Delivery Fee:* ${totals.shippingFee === 0 ? "FREE" : money(totals.shippingFee)}` +
      `\n*Total Payable:* ${money(totals.total)}` +
      (notes ? `\n*Notes:* ${notes}` : "") +
      `\n\nAssalam-o-Alaikum, I have placed this order on the website. Please confirm dispatch!`;

    const waBtn = $("#succ-wa-btn");
    if (waBtn) {
      waBtn.href = waLink(waText);
    }

    successBox.scrollIntoView({ behavior: "smooth" });
    toast("Order placed successfully! ✓");

    // Reset button state
    isSubmitting = false;
    submitBtn.disabled = false;
    submitText.textContent = "Place Order (Cash on Delivery)";
    spinner.style.display = "none";
  };

  renderPaymentOptions();
  drawCart();
}

/* ---------- 9) SLIDE-IN SIDE CART (DRAWER) ---------- */
function openDrawer() {
  drawDrawer();
  document.body.classList.add("dr-open");
}

function closeDrawer() {
  document.body.classList.remove("dr-open");
}

function drawDrawer() {
  const dr = $("#dr");
  if (!dr) return;

  const items = getCartLines();
  const totals = calculateCartTotals(items, 0);

  const progressBar = (totals.freeMin > 0 && items.length) ? `
    <div style="padding:1rem 0 .4rem">
      <div class="dr-bar">
        <i style="width:${Math.min(100, (totals.subtotal / totals.freeMin) * 100)}%"></i>
      </div>
      <p class="note" style="font-size:.82rem">
        ${totals.subtotal < totals.freeMin
          ? `Add <b>${money(totals.freeMin - totals.subtotal)}</b> more for <b style="color:var(--success)">FREE delivery!</b>`
          : `<span style="color:var(--success);font-weight:700">✓ You unlocked FREE delivery anywhere in Pakistan!</span>`}
      </p>
    </div>` : "";

  dr.innerHTML = `
    <div class="dr-head">
      <h3>Shopping Cart (${cartCount()})</h3>
      <button class="link" data-a="close" aria-label="Close cart" style="font-size:1.2rem">✕</button>
    </div>
    <div class="dr-body">
      ${progressBar}
      ${items.length ? items.map(({ p, q }) => `
        <div class="row">
          <img src="${p.img}" alt="${p.name} watch" width="65" height="65">
          <div>
            <b>${p.name}</b><br>
            <span style="font-size:.9rem">${money(p.price)}</span>
            <div class="qty" style="margin:.3rem 0 0">
              <button data-a="dec" data-id="${p.id}" type="button" aria-label="Less">−</button>
              <span>${q}</span>
              <button data-a="inc" data-id="${p.id}" type="button" aria-label="More">+</button>
            </div>
          </div>
          <div>
            <button class="link" data-a="del" data-id="${p.id}" type="button" style="color:#d94b3d">Remove</button>
          </div>
        </div>
      `).join("") : `<div class="center" style="padding:2.5rem 0"><p>Your cart is empty.</p></div>`}
    </div>
    <div class="dr-foot">
      <div style="display:flex;justify-content:space-between;margin-bottom:.4rem">
        <b>Subtotal:</b>
        <b>${money(totals.subtotal)}</b>
      </div>
      <p class="note" style="font-size:.82rem;margin-bottom:.8rem">Delivery and coupon applied at checkout.</p>
      ${items.length ? `<a class="btn btn-block" href="cart.html">Proceed to Checkout</a>` : `<a class="btn btn-block btn-ghost" href="shop.html">Shop Watches</a>`}
    </div>`;
}

function initDrawer() {
  if (!$("#dr-back")) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="dr-back" id="dr-back"></div>
      <aside class="dr" id="dr" aria-label="Quick Shopping Cart"></aside>
    `);
  }

  $("#dr-back").onclick = closeDrawer;

  $("#dr").onclick = e => {
    const b = e.target.closest("[data-a]");
    if (!b) return;
    const cart = getCart();
    const id = Number(b.dataset.id);

    if (b.dataset.a === "close") return closeDrawer();
    if (b.dataset.a === "inc") cart[id] = Math.min(99, (cart[id] || 0) + 1);
    if (b.dataset.a === "dec") {
      if ((cart[id] || 0) <= 1) delete cart[id];
      else cart[id]--;
    }
    if (b.dataset.a === "del") delete cart[id];

    saveCart(cart);
    drawDrawer();
  };

  if (document.body.dataset.page !== "cart") {
    $$(".cart-link").forEach(link => {
      link.onclick = e => {
        e.preventDefault();
        openDrawer();
      };
    });
  }
}

/* ---------- 10) SUPABASE INTEGRATION & SYNCHRONIZATION ---------- */
const SUPABASE_URL = "https://xwxoeibjefzyxhheabdy.supabase.co";
const SUPABASE_KEY = "sb_publishable_8yqxSB2Ag5-6YoPV2iEc4g_eAwy8a-M";

async function loadProducts() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&active=eq.true&order=id`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
      signal: ctrl.signal
    });
    clearTimeout(timer);

    if (!res.ok) return;
    const rows = await res.json();
    if (!Array.isArray(rows) || !rows.length) return;

    // Merge or replace products catalog
    PRODUCTS.length = 0;
    rows.forEach(r => {
      let price = Number(r.price) || 2999;
      let oldPrice = Number(r.old_price) || 0;
      const pct = Number(r.discount_percent) || 0;
      let badge = r.badge || "";

      if (pct > 0) {
        oldPrice = price;
        price = Math.round(price * (100 - pct) / 100);
        badge = badge || `${pct}% OFF`;
      }

      PRODUCTS.push({
        id: r.id,
        sku: r.sku || `LC-${r.id}`,
        name: r.name,
        price,
        oldPrice,
        category: r.category || "Casual",
        img: r.img || "images/watch-1.svg",
        badge,
        rating: Number(r.rating) || 4.5,
        reviews: Number(r.reviews) || 0,
        desc: r.description || "",
        inStock: r.active !== false && (r.stock_qty === undefined || r.stock_qty > 0)
      });
    });
  } catch (e) {
    // Fallback cleanly to PRODUCTS defined in products.js
    console.info("Using cached products catalogue.");
  }
}

async function loadSettings() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=key,value`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
    });
    if (!res.ok) return;
    const rows = await res.json();
    if (Array.isArray(rows)) {
      rows.forEach(r => { SETTINGS[r.key] = r.value; });
      if (SETTINGS.store_name) STORE.name = SETTINGS.store_name;
      const num = (SETTINGS.whatsapp || "").replace(/\D/g, "");
      if (num) STORE.whatsapp = num;
      if (SETTINGS.shipping_fee !== undefined) STORE.shippingFee = Number(SETTINGS.shipping_fee);
      if (SETTINGS.free_shipping_min !== undefined) STORE.freeShippingMin = Number(SETTINGS.free_shipping_min);
    }
  } catch (e) { /* ignore */ }
}

function loadBanner() {
  const img = $("#hero-img");
  const url = SETTINGS.hero_image;
  if (img && url && url.startsWith("https://")) {
    img.src = url;
  }
}

/* ---------- 11) SEO & STRUCTURED DATA INJECTION ---------- */
function injectSEOStructuredData() {
  const page = document.body.dataset.page;
  const storeName = SETTINGS.store_name || STORE.name || "LuxeCraft Watches";

  if (page === "home") {
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "JewelryStore",
      "name": storeName,
      "description": "Premium men's watches across Pakistan with Cash on Delivery and fast shipping.",
      "url": "https://thesyedabdulwasay-del.github.io/watch-store/",
      "telephone": STORE.displayPhone || "+92-327-3651015",
      "priceRange": "PKR 2,000 - 6,000",
      "currenciesAccepted": "PKR",
      "paymentAccepted": "Cash on Delivery, JazzCash, Easypaisa, Bank Transfer",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Karachi",
        "addressCountry": "PK"
      }
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(orgSchema);
    document.head.appendChild(s);
  }

  if (page === "product") {
    const id = Number(new URLSearchParams(location.search).get("id"));
    const p = PRODUCTS.find(x => x.id === id);
    if (p) {
      const prodSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p.name,
        "image": p.img.startsWith("http") ? p.img : `https://thesyedabdulwasay-del.github.io/watch-store/${p.img}`,
        "description": p.desc,
        "sku": p.sku || `LC-${p.id}`,
        "brand": { "@type": "Brand", "name": storeName },
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "PKR",
          "price": p.price,
          "availability": p.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "itemCondition": "https://schema.org/NewCondition"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": p.rating || 4.5,
          "reviewCount": p.reviews || 25
        }
      };
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(prodSchema);
      document.head.appendChild(s);
    }
  }
}

/* ---------- 12) INITIALIZATION ENTRYPOINT ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([loadProducts(), loadSettings()]);
  renderChrome();
  initDrawer();
  injectSEOStructuredData();

  const page = document.body.dataset.page;
  if (page === "home") { initHome(); loadBanner(); }
  if (page === "shop") initShop();
  if (page === "product") initProduct();
  if (page === "cart") initCart();
});
