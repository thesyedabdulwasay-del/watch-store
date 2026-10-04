/* ==========================================================
   products.js - EDIT THIS FILE to change store details and products
   ========================================================== */

/* 1) STORE SETTINGS */
const STORE = {
  name: "Your Store Name",                 // shown in header, footer, titles
  whatsapp: "919999999999",                // country code + number, no + or spaces
  instagram: "https://instagram.com/yourstore",
  currency: "₹",                           // change to "Rs " if you want Rupees as text
  showUpi: true,                           // set false to hide the UPI box at checkout
  upiId: "yourname@upi"                    // your UPI ID (also replace images/upi-qr.svg)
};

/* 2) PRODUCTS - copy one line to add a watch.
   img: file inside images/ | badge: "New", "Sale" or "" | category: "Formal" or "Casual" */
const PRODUCTS = [
  { id: 1,  name: "Aurix Chrono",    price: 2999, oldPrice: 3999, category: "Casual", img: "images/watch-1.svg",  badge: "Sale", rating: 4.6, reviews: 48, desc: "Matte black dial with a sporty chronograph look. Light on the wrist, easy with any outfit." },
  { id: 2,  name: "Nova Classic",    price: 3499, oldPrice: 0,    category: "Formal", img: "images/watch-2.svg",  badge: "New",  rating: 4.5, reviews: 31, desc: "Deep navy dial with slim hands. A clean pick for interviews, weddings and presentations." },
  { id: 3,  name: "Ivory Classic",   price: 4299, oldPrice: 0,    category: "Formal", img: "images/watch-3.svg",  badge: "",     rating: 4.7, reviews: 26, desc: "Cream dial, brown leather strap. A dressy look that stays simple." },
  { id: 4,  name: "Forest Field",    price: 2499, oldPrice: 2999, category: "Casual", img: "images/watch-4.svg",  badge: "Sale", rating: 4.3, reviews: 19, desc: "Dark green dial with a field-watch feel. Made for daily college wear." },
  { id: 5,  name: "Heritage Brown",  price: 3799, oldPrice: 0,    category: "Formal", img: "images/watch-5.svg",  badge: "",     rating: 4.6, reviews: 22, desc: "Warm brown dial and strap. Looks premium without the premium price." },
  { id: 6,  name: "Silver Edge",     price: 4999, oldPrice: 5999, category: "Formal", img: "images/watch-6.svg",  badge: "Sale", rating: 4.8, reviews: 40, desc: "Steel-look bracelet with a bright silver dial. Sharp, polished and durable." },
  { id: 7,  name: "Urban Slate",     price: 2299, oldPrice: 0,    category: "Casual", img: "images/watch-7.svg",  badge: "New",  rating: 4.2, reviews: 14, desc: "Slate grey dial with a minimal face. Goes with hoodies and shirts alike." },
  { id: 8,  name: "Midnight Mesh",   price: 3299, oldPrice: 0,    category: "Casual", img: "images/watch-8.svg",  badge: "",     rating: 4.4, reviews: 17, desc: "Dark blue dial on a metal mesh look. Slim, light and easy to wear all day." },
  { id: 9,  name: "Sand Minimal",    price: 2799, oldPrice: 0,    category: "Casual", img: "images/watch-9.svg",  badge: "",     rating: 4.5, reviews: 23, desc: "Soft sand dial with no clutter. Plain, clean and easy to match." },
  { id: 10, name: "Noir Minimal",    price: 2199, oldPrice: 2799, category: "Casual", img: "images/watch-10.svg", badge: "Sale", rating: 4.4, reviews: 35, desc: "All-black minimal watch. The easiest style to wear every day." },
  { id: 11, name: "Crimson Dial",    price: 5499, oldPrice: 0,    category: "Formal", img: "images/watch-11.svg", badge: "New",  rating: 4.7, reviews: 12, desc: "Deep red dial that stands out at a party or a function. Bold but still dressy." },
  { id: 12, name: "Gold Accent",     price: 5999, oldPrice: 0,    category: "Formal", img: "images/watch-12.svg", badge: "",     rating: 4.9, reviews: 29, desc: "Gold-tone dial with a black strap. Our most premium look." }
];

/* 3) SAMPLE REVIEWS - shown on every product page. Replace with real ones later. */
const REVIEWS = [
  { name: "Hamza", stars: 5, text: "Looks even better in person. Good value for the price." },
  { name: "Ayaan", stars: 4, text: "Light on the wrist and the strap is comfortable. Delivery was quick." },
  { name: "Rohan", stars: 5, text: "Got it for a friend's wedding and got many compliments." }
];
