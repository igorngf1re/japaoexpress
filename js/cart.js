// ═══════════════════════════════════════════════════════════
// Japão Express — Carrinho + Simulador de Caixa Japan Post
// ═══════════════════════════════════════════════════════════

const CART_KEY = 'je_cart';
const FAVS_KEY = 'je_favs';

// ── Caixas disponíveis (Japan Post EMS) ──────────────────
const BOXES = [
  { name: 'Mini',        maxWeight: 500,   emoji: '📦', color: '#A8E6CF', desc: 'até 500g'   },
  { name: 'Pequena',     maxWeight: 2000,  emoji: '📦', color: '#FFD3B6', desc: 'até 2kg'    },
  { name: 'Média',       maxWeight: 5000,  emoji: '📫', color: '#FFAAA5', desc: 'até 5kg'    },
  { name: 'Grande',      maxWeight: 10000, emoji: '📮', color: '#C7B8EA', desc: 'até 10kg'   },
  { name: 'Extra Grande',maxWeight: 20000, emoji: '🗃️', color: '#B2EBF2', desc: 'até 20kg'  },
];

// ── Tabela EMS para o Brasil (JPY) ────────────────────────
const EMS_RATES = [
  { maxWeight: 500,   priceJPY: 3500  },
  { maxWeight: 1000,  priceJPY: 4700  },
  { maxWeight: 1500,  priceJPY: 5800  },
  { maxWeight: 2000,  priceJPY: 6800  },
  { maxWeight: 2500,  priceJPY: 7800  },
  { maxWeight: 3000,  priceJPY: 8700  },
  { maxWeight: 4000,  priceJPY: 10500 },
  { maxWeight: 5000,  priceJPY: 12200 },
  { maxWeight: 7000,  priceJPY: 15500 },
  { maxWeight: 10000, priceJPY: 20500 },
  { maxWeight: 15000, priceJPY: 28500 },
  { maxWeight: 20000, priceJPY: 36500 },
];

// ── CRUD do carrinho ──────────────────────────────────────

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateAllBadges();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id:       product.id,
      name:     product.name,
      category: product.category,
      priceBRL: product.priceBRL,
      priceJPY: product.priceJPY,
      weight:   product.weight,
      image:    product.image,
      qty,
    });
  }
  saveCart(cart);
  showAddedToast(product.name);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

function updateCartQty(id, qty) {
  if (qty < 1) { removeFromCart(id); return; }
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) { item.qty = qty; saveCart(cart); }
}

// ── Totais ────────────────────────────────────────────────

function getCartTotal() {
  return getCart().reduce((s, i) => s + i.priceBRL * i.qty, 0);
}

function getCartWeight() {
  return getCart().reduce((s, i) => s + i.weight * i.qty, 0);
}

function getCartCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}

// ── Simulador de caixa ────────────────────────────────────

function getBoxInfo(weightGrams) {
  for (const box of BOXES) {
    if (weightGrams <= box.maxWeight) {
      const pct       = Math.min(100, Math.round((weightGrams / box.maxWeight) * 100));
      const remaining = box.maxWeight - weightGrams;
      return { ...box, pct, remaining, weightGrams };
    }
  }
  // Acima do limite EMS
  return {
    name: 'Acima do limite', maxWeight: 20000, emoji: '⚠️',
    color: '#FFCDD2', desc: 'máx 20kg', pct: 100, remaining: 0, weightGrams,
  };
}

// ── Cálculo de frete Japan Post EMS ──────────────────────

function getShippingJPY(weightGrams) {
  for (const tier of EMS_RATES) {
    if (weightGrams <= tier.maxWeight) return tier.priceJPY;
  }
  return null; // acima do limite
}

// ── Badge do carrinho em todas as páginas ─────────────────

function updateAllBadges() {
  const count = getCartCount();
  // data-cart-badge (novo padrão)
  document.querySelectorAll('[data-cart-badge]').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
  // id="cart-badge" (padrão original do HTML)
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// ── Toast "Adicionado ao carrinho" ────────────────────────

function showAddedToast(name) {
  let toast = document.getElementById('je-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'je-toast';
    toast.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:#2C1654;color:white;padding:12px 20px;border-radius:12px;
      font-family:'Nunito',sans-serif;font-weight:800;font-size:0.85rem;
      box-shadow:0 4px 16px rgba(0,0,0,0.25);z-index:9999;
      transition:opacity 0.3s;pointer-events:none;white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-bag-shopping mr-2" style="color:#C39BD3"></i>${name} adicionado!`;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ── Favoritos ─────────────────────────────────────────────

function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAVS_KEY) || '[]'); }
  catch { return []; }
}

function toggleFav(id) {
  const favs = getFavs();
  const idx  = favs.indexOf(id);
  if (idx === -1) favs.push(id);
  else favs.splice(idx, 1);
  localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
  updateFavIcons();
  return idx === -1; // true = adicionado
}

function isFav(id) {
  return getFavs().includes(id);
}

function updateFavIcons() {
  document.querySelectorAll('[data-fav-btn]').forEach(btn => {
    const id  = btn.dataset.favBtn;
    const ico = btn.querySelector('i');
    if (ico) {
      ico.className = isFav(id)
        ? 'fa-solid fa-heart text-[#E74C3C]'
        : 'fa-regular fa-heart text-[#9B59B6]';
    }
  });
}

// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateAllBadges();
  updateFavIcons();
});
