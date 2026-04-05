// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// JapÃÂ£o Express Ã¢ÂÂ CatÃÂ¡logo de Produtos
// Produtos adicionados via bot do Telegram ou manualmente.
// Estrutura de cada produto:
//   id, name, category, cat, subcategory,
//   priceBRL, priceJPY, weight (gramas),
//   description, details, origin,
//   image (URL), badge, badgeBg, stock,
//   rating, reviews, cardBg, rotate, deco ('tape'|'pin')
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

const PRODUCTS = [
  {
    "id": "a-120g",
    "name": "センカ パーフェクトホイップa 120g 洗顔フォーム",
    "category": "Cosméticos",
    "cat": "cosmeticos",
    "subcategory": "Skincare",
    "priceBRL": 25.85,
    "priceJPY": 474,
    "weight": 120,
    "description": "Lavador facial perfumado com micro-burbotas para limpar a pele, deixá-la fresca e suave.",
    "details": "Comprado em Rakuten (楽天). Lavador facial perfumado com micro-burbotas para limpar a pele, deixá-la fresca ",
    "origin": "Rakuten (楽天)",
    "image": "não disponível",
    "badge": null,
    "badgeBg": "#9B59B6",
    "stock": 10,
    "rating": 4.5,
    "reviews": 0,
    "cardBg": "bg-[#D6EAF8]",
    "rotate": "rotate-[-2deg]",
    "deco": "pin"
  },
  {
    "id": "perfeito-whipped-a-120g",
    "name": "Perfeito Whipped A 120g",
    "category": "CosmÃ©ticos",
    "cat": "cosmeticos",
    "subcategory": "Cuidados de pele",
    "priceBRL": 0,
    "priceJPY": 0,
    "weight": 120,
    "description": "Cuidados de pele para uma pele macia e radiante",
    "details": "Comprado em Rakuten 24. Cuidados de pele para uma pele macia e radiante",
    "origin": "Rakuten 24",
    "image": "https://tshop.r10s.jp/rakutensokuhaimart/cabinet/rakuten24/wb568/4550516474568.jpg",
    "badge": null,
    "badgeBg": "#9B59B6",
    "stock": 10,
    "rating": 4.5,
    "reviews": 0,
    "cardBg": "bg-[#D6EAF8]",
    "rotate": "rotate-[2deg]",
    "deco": "pin"
  },
];

// Ã¢ÂÂÃ¢ÂÂ Helpers Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

function getProductsByCategory(cat) {
  if (!cat || cat === 'todos') return PRODUCTS;
  return PRODUCTS.filter(p => p.cat === cat);
}

function formatBRL(value) {
  return 'R$ ' + value.toFixed(2).replace('.', ',');
}

function formatJPY(value) {
  return 'ÃÂ¥' + Math.round(value).toLocaleString('ja-JP');
}
