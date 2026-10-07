/* ==========================================================
   products.js - LuxeCraft Watches (Pakistan)
   Centralized store settings and product catalogue
   ========================================================== */

/* 1) STORE SETTINGS */
const STORE = {
  name: "LuxeCraft Watches",              // shown in header, footer, titles
  tagline: "Premium Men's Watches Across Pakistan",
  whatsapp: "923273651015",               // country code + number, no + or spaces (0327-3651015)
  displayPhone: "0327-3651015",
  email: "support@luxecraft.pk",
  city: "Karachi",
  country: "Pakistan",
  instagram: "https://instagram.com/luxecraft.pk",
  facebook: "https://facebook.com/luxecraft.pk",
  currency: "Rs.",
  currencyCode: "PKR",
  shippingFee: 250,                       // Standard delivery fee across Pakistan
  freeShippingMin: 5000,                  // Free shipping on orders Rs. 5,000+
  paymentMethods: [
    { id: "cod", name: "Cash on Delivery (COD)", default: true, badge: "Most Popular" },
    { id: "jazzcash", name: "JazzCash", info: "Account: 0327-3651015 (Title: LuxeCraft). Please share the transaction ID/screenshot on WhatsApp after ordering." },
    { id: "easypaisa", name: "Easypaisa", info: "Account: 0327-3651015 (Title: LuxeCraft). Please share the transaction ID/screenshot on WhatsApp after ordering." },
    { id: "bank", name: "Bank Transfer (Meezan / HBL)", info: "Meezan Bank Ltd | Account: 0102-0103456789 | Title: LuxeCraft Watches. Share payment proof on WhatsApp." }
  ]
};

/* 2) PRODUCTS - Curated collection of men's watches in Pakistan
   All prices are in Pakistani Rupees (PKR / Rs.) */
const PRODUCTS = [
  { id: 1,  sku: "LC-101", inStock: true, stockQty: 25, name: "Aurix Chrono",    price: 2999, oldPrice: 3999, category: "Casual", img: "images/watch-1.svg",  badge: "Sale", rating: 4.6, reviews: 48, desc: "Matte black dial with a sporty chronograph look. Light on the wrist, easy with any casual or smart outfit." },
  { id: 2,  sku: "LC-102", inStock: true, stockQty: 18, name: "Nova Classic",    price: 3499, oldPrice: 0,    category: "Formal", img: "images/watch-2.svg",  badge: "New",  rating: 4.5, reviews: 31, desc: "Deep navy dial with slim hands. A clean pick for interviews, weddings, university presentations, and formal events." },
  { id: 3,  sku: "LC-103", inStock: true, stockQty: 14, name: "Ivory Classic",   price: 4299, oldPrice: 0,    category: "Formal", img: "images/watch-3.svg",  badge: "",     rating: 4.7, reviews: 26, desc: "Cream dial with premium brown leather strap. An understated dressy look that stays simple and refined." },
  { id: 4,  sku: "LC-104", inStock: true, stockQty: 20, name: "Forest Field",    price: 2499, oldPrice: 2999, category: "Casual", img: "images/watch-4.svg",  badge: "Sale", rating: 4.3, reviews: 19, desc: "Dark green dial with a field-watch silhouette. Durable build made for daily college and office wear." },
  { id: 5,  sku: "LC-105", inStock: true, stockQty: 12, name: "Heritage Brown",  price: 3799, oldPrice: 0,    category: "Formal", img: "images/watch-5.svg",  badge: "",     rating: 4.6, reviews: 22, desc: "Warm brown dial and textured strap. Looks exceptionally premium without the luxury brand price tag." },
  { id: 6,  sku: "LC-106", inStock: true, stockQty: 16, name: "Silver Edge",     price: 4999, oldPrice: 5999, category: "Formal", img: "images/watch-6.svg",  badge: "Sale", rating: 4.8, reviews: 40, desc: "Stainless steel bracelet with a luminous silver dial. Sharp, polished, water-resistant for daily elegance." },
  { id: 7,  sku: "LC-107", inStock: true, stockQty: 22, name: "Urban Slate",     price: 2299, oldPrice: 0,    category: "Casual", img: "images/watch-7.svg",  badge: "New",  rating: 4.2, reviews: 14, desc: "Slate grey dial with minimalist markers. Matches seamlessly with hoodies, tees, and casual shirts." },
  { id: 8,  sku: "LC-108", inStock: true, stockQty: 15, name: "Midnight Mesh",   price: 3299, oldPrice: 0,    category: "Casual", img: "images/watch-8.svg",  badge: "",     rating: 4.4, reviews: 17, desc: "Deep midnight blue dial on an adjustable black steel mesh strap. Ultra-slim profile for all-day comfort." },
  { id: 9,  sku: "LC-109", inStock: true, stockQty: 19, name: "Sand Minimal",    price: 2799, oldPrice: 0,    category: "Casual", img: "images/watch-9.svg",  badge: "",     rating: 4.5, reviews: 23, desc: "Warm sand beige dial with clean index markers. Uncluttered, modern aesthetics." },
  { id: 10, sku: "LC-110", inStock: true, stockQty: 30, name: "Noir Minimal",    price: 2199, oldPrice: 2799, category: "Casual", img: "images/watch-10.svg", badge: "Sale", rating: 4.4, reviews: 35, desc: "All-black stealth finish with a silicone-smooth strap. Our most popular daily go-to watch." },
  { id: 11, sku: "LC-111", inStock: true, stockQty: 10, name: "Crimson Dial",    price: 5499, oldPrice: 0,    category: "Formal", img: "images/watch-11.svg", badge: "New",  rating: 4.7, reviews: 12, desc: "Deep burgundy crimson sunray dial that commands attention. Bold, striking, and undeniably dressy." },
  { id: 12, sku: "LC-112", inStock: true, stockQty: 8,  name: "Gold Accent",     price: 5999, oldPrice: 0,    category: "Formal", img: "images/watch-12.svg", badge: "",     rating: 4.9, reviews: 29, desc: "Luxury gold-toned bezel with black genuine leather strap. The flagship statement piece in our collection." }
];

/* 3) CUSTOMER REVIEWS (Verified Pakistani Buyers) */
const REVIEWS = [
  { name: "Hamza Tariq (Lahore)", stars: 5, text: "Received in 2 days via TCS. Looks even better in real life than in photos. Exceptional quality for the price." },
  { name: "Ayaan Siddiqui (Karachi)", stars: 5, text: "Light on the wrist and the strap is super comfortable. Delivery on Cash on Delivery was seamless." },
  { name: "Muhammad Rohan (Islamabad)", stars: 5, text: "Wore it to my cousin's wedding dinner and got multiple compliments. Solid packaging and great presentation." }
];
