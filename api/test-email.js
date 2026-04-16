// ═══════════════════════════════════════════════════════════
// Japão Express — Endpoint de TESTE de emails
// GET /api/test-email?to=seu@email.com&type=payment_confirmed
// Auth: Bearer {ADMIN_SECRET}
// REMOVER em produção quando não for mais necessário.
// ═══════════════════════════════════════════════════════════

import { sendEmail } from '../lib/sendEmail.js';

const FAKE_ORDER = {
  id:            'JE-2026-TEST01',
  customerName:  'Igor Teste',
  customerEmail: '',          // sobrescrito pelo ?to=
  items: [
    { name: 'Senka Perfect Whip 120g', priceBRL: 45.90, qty: 2, image: '' },
    { name: 'Kit Kat Matcha Edição Limitada', priceBRL: 32.50, qty: 1, image: '' },
  ],
  subtotal:      124.30,
  discount:      6.22,         // 5% PIX
  shippingBRL:   89.90,
  shippingName:  'Japan Post EMS',
  total:         208.00,
  paymentMethod: 'pix',
  trackingCode:  'RR123456789JP',
  trackingUrl:   'https://rastreamento.correios.com.br/app/resultado.php?objeto=RR123456789JP',
};

const VALID_TYPES = ['payment_confirmed', 'shipped', 'order_created', 'delivered'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Auth
  const auth   = req.headers.authorization || '';
  const secret = process.env.ADMIN_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const to   = req.query.to;
  const type = req.query.type || 'payment_confirmed';

  if (!to) {
    return res.status(400).json({
      error: 'Parâmetro ?to= obrigatório',
      usage: '/api/test-email?to=seu@email.com&type=payment_confirmed',
      types: VALID_TYPES,
    });
  }

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `Tipo inválido. Use: ${VALID_TYPES.join(', ')}` });
  }

  const order = { ...FAKE_ORDER, customerEmail: to };

  try {
    const result = await sendEmail(type, order);
    return res.status(200).json({
      ok:   true,
      type,
      to,
      ...result,
    });
  } catch (e) {
    console.error('[JE test-email] error:', e);
    return res.status(500).json({ error: e.message, stack: e.stack?.split('\n').slice(0, 5) });
  }
}
