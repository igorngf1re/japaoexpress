// ═══════════════════════════════════════════════════════════
// Japão Express — Verificação de sessão Stripe
// Confirma se o pagamento foi bem-sucedido após redirect.
// Chamado por sucesso.html com ?session_id=xxx
// ═══════════════════════════════════════════════════════════

import Stripe from 'stripe';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: 'Missing session_id' });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key)  return res.status(200).json({ paid: false, reason: 'Stripe not configured' });

  const stripe = new Stripe(key, { apiVersion: '2023-10-16' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid = session.payment_status === 'paid'
              || session.payment_status === 'no_payment_required';

    return res.status(200).json({
      paid,
      status:        session.payment_status,
      orderId:       session.metadata?.orderId        || '',
      customerEmail: session.customer_details?.email  || '',
      customerName:  session.customer_details?.name   || '',
      amountTotal:   (session.amount_total || 0) / 100,
      currency:      session.currency,
      paymentMethod: session.metadata?.paymentMethod  || 'card',
    });

  } catch (e) {
    console.error('[JE verify-session] error:', e);
    return res.status(400).json({ error: e.message });
  }
}
