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
    "id": "locao-facial-clareadora-hada-labo-shiroj",
    "name": "Loção Facial Clareadora Hada Labo Shirojyun Premium 170ml - Rohto",
    "category": "Cosméticos",
    "cat": "cosmeticos",
    "subcategory": "Cuidados com a Pele",
    "priceBRL": 64.28,
    "priceJPY": 990,
    "weight": 170,
    "description": "Loção japonesa premium que clareia e hidrata profundamente a pele.",
    "details": "A Loção Facial Clareadora Hada Labo Shirojyun Premium da Rohto é um cosmético japonês de alta qualidade desenvolvido para hidratar profundamente e combater manchas e tonalidade irregular da pele.\nBenefícios principais:\n• Clareia e uniformiza o tom da pele\n• Hidratação intensa com ácido hialurônico\n• Ajuda a prevenir manchas e sardas\n• Ação calmante e anti-inflamatória",
    "origin": "Japão",
    "image": "https://donki-ec-static-1306051524.cos.ap-hongkong.myqcloud.com/images/4987241168491-1.jpg",
    "image2": "https://donki-ec-static-1306051524.cos.ap-hongkong.myqcloud.com/images/4987241168491-2.jpg",
    "image3": "https://donki-ec-static-1306051524.cos.ap-hongkong.myqcloud.com/images/4987241168491-3.jpg",
    "images": [
      "https://donki-ec-static-1306051524.cos.ap-hongkong.myqcloud.com/images/4987241168491-1.jpg",
      "https://donki-ec-static-1306051524.cos.ap-hongkong.myqcloud.com/images/4987241168491-2.jpg",
      "https://donki-ec-static-1306051524.cos.ap-hongkong.myqcloud.com/images/4987241168491-3.jpg"
    ],
    "units": 1,
    "featured": true,
    "cost": 32.14,
    "markup": 100,
    "badge": null,
    "badgeBg": "#9b59b6",
    "stock": 7,
    "rating": 4.5,
    "reviews": 0,
    "cardBg": "bg-[#d6eaf8]",
    "rotate": "rotate(-1deg)",
    "deco": "tape"
  },
  {
    "id": "fino-premium-touch-mascara-capilar-230g",
    "name": "Fino Premium Touch Máscara Capilar 230g",
    "category": "Cabelos",
    "cat": "cabelos",
    "subcategory": "Máscara Capilar",
    "priceBRL": 42.86,
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
    "markup": 50,
    "badge": "Queridinho",
    "badgeBg": "#f5a623",
    "stock": 10,
    "rating": 4.5,
    "reviews": 0,
    "cardBg": "bg-[#fcf3cf]",
    "rotate": "rotate(-1deg)",
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
