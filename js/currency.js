// ═══════════════════════════════════════════════════════════
// Japão Express — Conversor BRL ↔ JPY ↔ USD
// ═══════════════════════════════════════════════════════════

const CURRENCY_KEY = 'je_currency';
const RATE_KEY     = 'je_rate';
const RATE_TTL     = 60 * 60 * 1000; // 1 hora de cache

let _cachedRate    = null; // BRL → JPY
let _cachedUsdRate = null; // BRL → USD

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
  const cur = getCurrency();
  if (cur === 'BRL') setCurrency('JPY');
  else if (cur === 'JPY') setCurrency('USD');
  else setCurrency('BRL');
}

// ── Taxa de câmbio ────────────────────────────────────────

async function getRate() {
  if (_cachedRate && _cachedUsdRate) return _cachedRate;

  try {
    const cached = JSON.parse(localStorage.getItem(RATE_KEY) || 'null');
    // invalida cache antigo que não tem usdRate
    if (cached && cached.usdRate && Date.now() - cached.ts < RATE_TTL) {
      _cachedRate    = cached.rate;
      _cachedUsdRate = cached.usdRate;
      return _cachedRate;
    }
  } catch {}

  try {
    const res  = await fetch('/api/exchange-rate');
    const data = await res.json();
    _cachedRate    = data.rates?.JPY || 22;
    _cachedUsdRate = data.rates?.USD || 0.18;
  } catch {
    _cachedRate    = 22;   // fallback: 1 BRL ≈ 22 JPY
    _cachedUsdRate = 0.18; // fallback: 1 BRL ≈ 0.18 USD
  }

  localStorage.setItem(RATE_KEY, JSON.stringify({
    rate:    _cachedRate,
    usdRate: _cachedUsdRate,
    ts:      Date.now(),
  }));
  return _cachedRate;
}

// ── Formatação ────────────────────────────────────────────

async function formatPrice(priceBRL) {
  const currency = getCurrency();
  if (currency === 'BRL') {
    return 'R$ ' + priceBRL.toFixed(2).replace('.', ',');
  }
  await getRate();
  if (currency === 'USD') {
    return '$ ' + (priceBRL * (_cachedUsdRate || 0.18)).toFixed(2);
  }
  return '¥' + Math.round(priceBRL * (_cachedRate || 22)).toLocaleString('ja-JP');
}

// Síncrona (usa cache local ou fallback)
function formatPriceSync(priceBRL) {
  const currency = getCurrency();
  if (currency === 'BRL') {
    return 'R$ ' + priceBRL.toFixed(2).replace('.', ',');
  }

  let jpy = _cachedRate, usd = _cachedUsdRate;
  if (!jpy || !usd) {
    try {
      const c = JSON.parse(localStorage.getItem(RATE_KEY) || 'null');
      jpy = c?.rate    || 22;
      usd = c?.usdRate || 0.18;
    } catch {
      jpy = 22;
      usd = 0.18;
    }
  }

  if (currency === 'USD') return '$ ' + (priceBRL * usd).toFixed(2);
  return '¥' + Math.round(priceBRL * jpy).toLocaleString('ja-JP');
}

// ── Atualiza todos os preços na página ────────────────────

async function refreshAllPrices() {
  const currency = getCurrency();
  await getRate();
  const jpy = _cachedRate    || 22;
  const usd = _cachedUsdRate || 0.18;

  document.querySelectorAll('[data-price-brl]').forEach(el => {
    const brl = parseFloat(el.dataset.priceBrl);
    if (isNaN(brl)) return;
    if (currency === 'BRL') {
      el.textContent = 'R$ ' + brl.toFixed(2).replace('.', ',');
    } else if (currency === 'USD') {
      el.textContent = '$ ' + (brl * usd).toFixed(2);
    } else {
      el.textContent = '¥' + Math.round(brl * jpy).toLocaleString('ja-JP');
    }
  });
}

// ── Botão de toggle ────────────────────────────────────────

function updateToggleBtn() {
  const c = getCurrency();
  const info = {
    BRL: { icon: '🇧🇷', label: 'BRL', title: 'Moeda: Real — clique para alternar' },
    JPY: { icon: '🇯🇵', label: 'JPY', title: 'Moeda: Iene — clique para alternar' },
    USD: { icon: '🇺🇸', label: 'USD', title: 'Moeda: Dólar — clique para alternar' },
  };
  const cur = info[c] || info.BRL;

  document.querySelectorAll('[data-currency-toggle]').forEach(el => {
    const labelSpan = el.querySelector('[data-currency-toggle-label]');
    if (labelSpan) {
      // botão estruturado com spans separados
      const iconSpan = el.querySelector('span:first-child');
      if (iconSpan && iconSpan !== labelSpan) iconSpan.textContent = cur.icon;
      labelSpan.textContent = cur.label;
    } else {
      // botão simples - substitui tudo
      el.innerHTML = '<span style="font-size:0.75rem">' + cur.icon + '</span> ' + cur.label;
    }
    el.title = cur.title;
  });

  // sidebar label separado
  const sb = document.getElementById('sbCurrLabel');
  if (sb) sb.textContent = cur.label;
}

// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await getRate();
  refreshAllPrices();
  updateToggleBtn();
});

// Garante atualização após window.load (header.js pode injetar depois)
window.addEventListener('load', () => {
  updateToggleBtn();
});
