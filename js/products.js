// ═══════════════════════════════════════════════════════════
// Japão Express — Catálogo de Produtos
// Produtos adicionados via admin panel ou bot do Telegram.
// Estrutura de cada produto:
//   id, name, category, cat, subcategory,
//   priceBRL, priceJPY, weight,
//   description, details, origin,
//   image, image2, image3, images[],
//   units, featured, cost, markup,
//   badge, badgeBg, stock, rating, reviews,
//   cardBg, rotate, deco ('tape'|'pin')
// ═══════════════════════════════════════════════════════════

// ── Helpers ───────────────────────────────────────────────
function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

const PRODUCTS = [
  {
    "id": "fino-premium-touch-mascara-capilar-230g",
    "name": "Fino Premium Touch Máscara Capilar 230g",
    "category": "Cosméticos",
    "cat": "cosmeticos",
    "subcategory": "Máscara Capilar",
    "priceBRL": 45.71,
    "priceJPY": 880,
    "weight": 230,
    "description": "Tratamento japonês que repara, hidrata e deixa o cabelo sedoso instantaneamente",
    "details": "Ideal para cabelos ressecados, com química, descoloridos ou expostos ao calor constante, essa máscara entrega um efeito imediato de cabelo mais alinhado, macio e com brilho intenso — como se tivesse saído do salão.",
    "origin": "Japão",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1ZW2Nr0Ex4Fv2urJ4G_nCCIP8Crn7d_ps-Q&s",
    "image2": "https://beautizshop.com/cdn/shop/files/Sanstitre_1000x1000px_841x1189mm_2000x2500px_84.png?v=1711643854&width=1500",
    "image3": "https://1007int.com/cdn/shop/files/103588e3-ae6a-4add-8c34-7366069f7d5a.png?v=1771216549&width=1445",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1ZW2Nr0Ex4Fv2urJ4G_nCCIP8Crn7d_ps-Q&s",
      "https://beautizshop.com/cdn/shop/files/Sanstitre_1000x1000px_841x1189mm_2000x2500px_84.png?v=1711643854&width=1500",
      "https://1007int.com/cdn/shop/files/103588e3-ae6a-4add-8c34-7366069f7d5a.png?v=1771216549&width=1445"
    ],
    "units": 1,
    "featured": false,
    "cost": 28.57,
    "markup": 60,
    "badge": "Queridinho",
    "badgeBg": "#f5a623",
    "stock": 10,
    "rating": 4.5,
    "reviews": 0,
    "cardBg": "bg-[#fcf3cf]",
    "rotate": "rotate(-2deg)",
    "deco": "tape"
  },
];
