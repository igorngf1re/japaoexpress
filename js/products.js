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
    "category": "Cabelos",
    "cat": "cabelos",
    "subcategory": "Máscara Capilar",
    "priceBRL": 45.71,
    "priceJPY": 880,
    "weight": 230,
    "description": "Tratamento japonês que repara, hidrata e deixa o cabelo sedoso instantaneamente",
    "details": "Ideal para cabelos ressecados, com química, descoloridos ou expostos ao calor constante, essa máscara entrega um efeito imediato de cabelo mais alinhado, macio e com brilho intenso — como se tivesse saído do salão.",
    "origin": "Japão",
    "image": "https://cdn.jsdelivr.net/gh/igorngf1re/japaoexpress@main/images/produtos/1775478723920_13003_1.jpg",
    "image2": "https://cdn.jsdelivr.net/gh/igorngf1re/japaoexpress@main/images/produtos/1775478130076_shiseidofinopreiumtouchhairmask230ml__1_.webp",
    "image3": "https://cdn.jsdelivr.net/gh/igorngf1re/japaoexpress@main/images/produtos/1775478175734_fino.webp",
    "images": [
      "https://cdn.jsdelivr.net/gh/igorngf1re/japaoexpress@main/images/produtos/1775478723920_13003_1.jpg",
      "https://cdn.jsdelivr.net/gh/igorngf1re/japaoexpress@main/images/produtos/1775478130076_shiseidofinopreiumtouchhairmask230ml__1_.webp",
      "https://cdn.jsdelivr.net/gh/igorngf1re/japaoexpress@main/images/produtos/1775478175734_fino.webp"
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
  {
    "id": "ino-premium-touch-oleo-capilar",
    "name": "Fino Premium Touch Óleo Capilar Concentrado 70ml",
    "category": "Cabelos",
    "cat": "cabelos",
    "subcategory": "Óleo Capilar",
    "priceBRL": 47.73,
    "priceJPY": 980,
    "weight": 120,
    "description": "Óleo japonês que repara danos e deixa o cabelo sedoso e brilhante.",
    "details": "Fino Premium Touch Óleo Capilar é um tratamento intensivo sem enxágue desenvolvido no Japão para restaurar cabelos danificados.\n\nBenefícios principais:\n• Repara profundamente fios danificados\n• Proporciona brilho intenso e toque sedoso\n• Reduz frizz e pontas duplas\n• Textura leve, não oleosa\n• Perfume floral elegante japonês",
    "origin": "Japão",
    "image": "https://cdn.jsdelivr.net/gh/igorngf1re/japaoexpress@main/images/produtos/1775479346447_244833_1_800.jpg",
    "image2": null,
    "image3": null,
    "images": [
      "https://cdn.jsdelivr.net/gh/igorngf1re/japaoexpress@main/images/produtos/1775479346447_244833_1_800.jpg"
    ],
    "units": 1,
    "featured": false,
    "cost": 31.82,
    "markup": 50,
    "badge": null,
    "badgeBg": "#f5a623",
    "stock": 10,
    "rating": 4.5,
    "reviews": 0,
    "cardBg": "bg-[#d6eaf8]",
    "rotate": "rotate(1deg)",
    "deco": "tape"
  },
];
