// Endpoint de diagnóstico Stripe — REMOVER após debugging
import Stripe from 'stripe';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.json({ error: 'Sem chave', key: null });

  const keyInfo = {
    present: true,
    length:  key.length,
    prefix:  key.slice(0, 12) + '...',
    isLive:  key.startsWith('sk_live_'),
    isTest:  key.startsWith('sk_test_'),
  };

  // ── Teste 1: fetch direto sem SDK ────────────────────────
  let rawFetch = null;
  try {
    const resp = await fetch('https://api.stripe.com/v1/balance', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    rawFetch = { status: resp.status, ok: resp.ok };
    if (resp.ok) {
      const body = await resp.json();
      rawFetch.currency = body.available?.[0]?.currency;
    } else {
      const body = await resp.text();
      rawFetch.body = body.slice(0, 200);
    }
  } catch (e) {
    rawFetch = { error: e.message, cause: e.cause ? String(e.cause) : null };
  }

  // ── Teste 2: SDK Stripe ──────────────────────────────────
  let sdk = null;
  try {
    const stripe = new Stripe(key, { apiVersion: '2023-10-16', maxNetworkRetries: 0, timeout: 8000, fetchFn: globalThis.fetch.bind(globalThis) });
    const balance = await stripe.balance.retrieve();
    sdk = { ok: true, currency: balance.available?.[0]?.currency };
  } catch (e) {
    sdk = {
      ok:         false,
      message:    e.message,
      type:       e.type,
      code:       e.code,
      statusCode: e.statusCode,
      cause:      e.cause ? String(e.cause) : null,
    };
  }

  return res.json({ keyInfo, rawFetch, sdk });
}
