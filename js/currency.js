// ═══════════════════════════════════════════════════════════
// Japão Express — Conversor BRL ↔ JPY
// ═══════════════════════════════════════════════════════════

const CURRENCY_KEY = 'je_currency';
const RATE_KEY     = 'je_rate';
const RATE_TTL     = 60 * 60 * 1000; // 1 hora de cache

let _cachedRate = null;

// ── Estado ────────────────────────────────────────────────

function getCurrency() {
  return localStorage.getItem(CURRENCY_KEY) || 'BRL';
}

function setCurrency(c) {
  localStorage.setItem(CURRENCY_KEY, c);
  refreshAllPrices();
  updateToggleBtn();
}

function toggleCurrency() {
  setCurrency(getCurrency() === 'BRL' ? 'JPY' : 'BRL');
}

// ── Taxa de câmbio ────────────────────────────────────────

async function getRate() {
  if (_cachedRate) return _cachedRate;

  try {
    const cached = JSON.parse(localStorage.getItem(RATE_KEY) || 'null');
    if (cached && Date.now() - cached.ts < RATE_TTL) {
      _cachedRate = cached.rate;
      return _cachedRate;
    }
  } catch {}

  try {
    const res  = await fetch('/api/exchange-rate');
    const data = await res.json();
    _cachedRate = data.rates?.JPY || 22;
  } catch {
    _cachedRate = 22; // fallback: 1 BRL ≈ 22 JPY
  }

  localStorage.setItem(RATE_KEY, JSON.stringify({ rate: _cachedRate, ts: Date.now() }));
  return _cachedRate;
}

// ── Formatação ────────────────────────────────────────────

async function formatPrice(priceBRL) {
  if (getCurrency() === 'BRL') {
    return 'R$ ' + priceBRL.toFixed(2).replace('.', ',');
  }
  const rate = await getRate();
  return '¥' + Math.round(priceBRL * rate).toLocaleString('ja-JP');
}

// Síncrona (usa cache local ou fallback)
function formatPriceSync(priceBRL) {
  if (getCurrency() === 'BRL') {
    return 'R$ ' + priceBRL.toFixed(2).replace('.', ',');
  }
  const rate = _cachedRate || (() => {
    try {
      const c = JSON.parse(localStorage.getItem(RATE_KEY) || 'null');
      return c?.rate || 22;
    } catch { return 22; }
  })();
  return '¥' + Math.round(priceBRL * rate).toLocaleString('ja-JP');
}

// ── Atualiza todos os preços na página ────────────────────

async function refreshAllPrices() {
  const currency = getCurrency();
  const rate     = await getRate();

  document.querySelectorAll('[data-price-brl]').forEach(el => {
    const brl = parseFloat(el.dataset.priceBrl);
    if (isNaN(brl)) return;
    el.textContent = currency === 'BRL'
      ? 'R$ ' + brl.toFixed(2).replace('.', ',')
      : '¥' + Math.round(brl * rate).toLocaleString('ja-JP');
  });
}

// ── Botão de toggle ────────────────────────────────────────

function updateToggleBtn() {
  const c = getCurrency();
  document.querySelectorAll('[data-currency-toggle]').forEach(el => {
    el.innerHTML = c === 'BRL'
      ? '<span class="text-[0.7rem]">🇯🇵</span> JPY'
      : '<span class="text-[0.7rem]">🇧🇷</span> BRL';
    el.title = c === 'BRL' ? 'Ver preços em Iene' : 'Ver preços em Real';
  });
}

// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await getRate();       // pre-carrega taxa
  refreshAllPrices();
  updateToggleBtn();
});
