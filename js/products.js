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

const PRODUCTS = [
  {
    "id": "fino-premium-touch-mascara-capilar-230g",
    "name": "Fino Premium Touch Máscara Capilar 230g",
    "category": "Cabelos",
    "cat": "cabelos",
    "subcategory": "Máscara Capilar",
    "priceBRL": 37.14,
    "priceJPY": 880,
    "weight": 230,
    "description": "Máscara japonesa poderosa que hidrata e repara cabelos danificados.",
    "details": "A Shiseido Fino Premium Touch Hair Mask é uma máscara capilar japonesa de tratamento intensivo formulada com tecnologia de essência de alta penetração (浸透美容液). \nDesenvolvida para reparar profundamente os fios danificados por químicas, calor e agressões externas, ela proporciona hidratação intensa, brilho e maciez imediata.\nBenefícios principais: Hidratação profunda desde o interior do fio e redução de frizz e pontas duplas.",
    "origin": "Japão",
    "image": "https://beautizshop.com/cdn/shop/files/Sanstitre_1000x1000px_841x1189mm_2000x2500px_83.png?v=1711643853",
    "image2": "https://beautizshop.com/cdn/shop/files/Sanstitre_1000x1000px_841x1189mm_2000x2500px_84.png?v=1711643854&width=3840",
    "image3": "https://1007int.com/cdn/shop/files/103588e3-ae6a-4add-8c34-7366069f7d5a.png?v=1771216549&width=1445",
    "images": [
      "https://beautizshop.com/cdn/shop/files/Sanstitre_1000x1000px_841x1189mm_2000x2500px_83.png?v=1711643853",
      "https://beautizshop.com/cdn/shop/files/Sanstitre_1000x1000px_841x1189mm_2000x2500px_84.png?v=1711643854&width=3840",
      "https://1007int.com/cdn/shop/files/103588e3-ae6a-4add-8c34-7366069f7d5a.png?v=1771216549&width=1445"
    ],
    "units": 1,
    "featured": false,
    "cost": 28.57,
    "markup": 30,
    "badge": "Queridinho",
    "badgeBg": "#f5a623",
    "stock": 10,
    "rating": 4.5,
    "reviews": 0,
    "cardBg": "bg-[#fff9c4]",
    "rotate": "rotate(-1deg)",
    "deco": "pin"
  },
];
