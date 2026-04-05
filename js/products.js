// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
// JapÃÂÃÂ£o Express ÃÂ¢ÃÂÃÂ CatÃÂÃÂ¡logo de Produtos
// Produtos adicionados via bot do Telegram ou manualmente.
// Estrutura de cada produto:
//   id, name, category, cat, subcategory,
//   priceBRL, priceJPY, weight (gramas),
//   description, details, origin,
//   image (URL), badge, badgeBg, stock,
//   rating, reviews, cardBg, rotate, deco ('tape'|'pin')
// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ

const PRODUCTS = [
  {
    "id": "150g",
    "name": "ソフティモ 薬用洗顔フォーム ホワイト スクラブイン 150g",
    "category": "Cosméticos",
    "cat": "cosmeticos",
    "subcategory": "Lavar a pessoa",
    "priceBRL": 16.53,
    "priceJPY": 303,
    "weight": 150,
    "description": "Lavador facial de uso diário com água sinus nasal do tipo gtouls whitetePBS olive ",
    "details": "Comprado em Rakuten. Lavador facial de uso diário com água sinus nasal do tipo gtouls whitetePBS oliv",
    "origin": "Rakuten",
    "image": "https://tshop.r10s.jp/rakutensokuhaimart/cabinet/rakuten24/wb247/4971710390247.jpg",
    "badge": null,
    "badgeBg": "#9B59B6",
    "stock": 10,
    "rating": 4.5,
    "reviews": 0,
    "cardBg": "bg-[#D6EAF8]",
    "rotate": "rotate-[-1deg]",
    "deco": "pin"
  },
  {
    "id": "a-120g",
    "name": "ã»ã³ã« ãã¼ãã§ã¯ããã¤ããa 120g æ´é¡ãã©ã¼ã ",
    "category": "CosmÃ©ticos",
    "cat": "cosmeticos",
    "subcategory": "Skincare",
    "priceBRL": 25.85,
    "priceJPY": 474,
    "weight": 120,
    "description": "Lavador facial perfumado com micro-burbotas para limpar a pele, deixÃ¡-la fresca e suave.",
    "details": "Comprado em Rakuten (æ¥½å¤©). Lavador facial perfumado com micro-burbotas para limpar a pele, deixÃ¡-la fresca ",
    "origin": "Rakuten (æ¥½å¤©)",
    "image": "nÃ£o disponÃ­vel",
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
    "category": "CosmÃÂ©ticos",
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

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Helpers ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ

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
  return 'ÃÂÃÂ¥' + Math.round(value).toLocaleString('ja-JP');
}
