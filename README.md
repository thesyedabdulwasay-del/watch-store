# Men's Watches Store

A simple online store for stylish men's watches (formal and casual), made for college students and young professionals. Built with plain HTML, CSS and JavaScript. No frameworks, no build tools.

## What it does

- Browse watches and filter by style (Formal or Casual)
- Sort by price
- View a watch's details and customer reviews
- Add watches to a cart that is remembered after a page refresh
- Send the order on WhatsApp with one tap
- Works well on phones

## How to run it

1. Download or clone this project.
2. Open `index.html` in any browser.

That is all. No installation needed.

## Project structure

```
index.html      Home page
shop.html       All watches with filters
product.html    One watch (opens with product.html?id=1)
cart.html       Cart and checkout form
about.html      About page
contact.html    Contact page
css/style.css   All the styling
js/main.js      All the site behaviour
js/products.js  Store settings and the product list (edit this to change products)
images/         Watch pictures
```

## How to edit

Open `js/products.js`. You can change:

- Store name, WhatsApp number, Instagram link and UPI ID
- Products: copy one line to add a new watch
- Sample customer reviews

To use your own product photos, put them in the `images/` folder and update the `img` path in `products.js`.

## Deploy

This is a static site, so it can be hosted for free on GitHub Pages, Netlify or Cloudflare Pages.
