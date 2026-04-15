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

  try {
    const stripe = new Stripe(key, { maxNetworkRetries: 0, timeout: 8000 });
    const balance = await stripe.balance.retrieve();
    return res.json({ ok: true, keyInfo, currency: balance.available?.[0]?.currency });
  } catch (e) {
    return res.json({
      ok:         false,
      keyInfo,
      message:    e.message,
      type:       e.type,
      code:       e.code,
      statusCode: e.statusCode,
      cause:      e.cause ? String(e.cause) : null,
    });
  }
}
