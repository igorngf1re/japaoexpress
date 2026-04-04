// ═══════════════════════════════════════════════════════════
// Japão Express — Catálogo de Produtos
// Produtos adicionados via bot do Telegram ou manualmente.
// Estrutura de cada produto:
//   id, name, category, cat, subcategory,
//   priceBRL, priceJPY, weight (gramas),
//   description, details, origin,
//   image (URL), badge, badgeBg, stock,
//   rating, reviews, cardBg, rotate, deco ('tape'|'pin')
// ═══════════════════════════════════════════════════════════

const PRODUCTS = [
  // Adicione produtos aqui ou via bot Telegram
];

// ── Helpers ───────────────────────────────────────────────

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
  return '¥' + Math.round(value).toLocaleString('ja-JP');
}
