// ═══════════════════════════════════════════════════════════
// Japão Express — Stripe Webhook
// Recebe checkout.session.completed e manda notificação
// no Telegram como confirmação de pagamento.
// IMPORTANTE: bodyParser desabilitado para verificação de assinatura.
// ═══════════════════════════════════════════════════════════

import Stripe from 'stripe';

// Vercel: desabilita bodyParser para que possamos ler o raw body
export const config = { api: { bodyParser: false } };

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = Buffer.alloc(0);
    req.on('data', chunk => { data = Buffer.concat([data, chunk]); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function sendTelegram(order) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const items = (order.items || [])
    .map(i => `  • ${i.name} ×${i.qty || 1} — R$ ${((i.priceBRL || 0) * (i.qty || 1)).toFixed(2)}`)
    .join('\n');

  const payIcon = { pix: '🟢 PIX', card: '💳 Cartão', boleto: '📄 Boleto' };
  const text = `✅ <b>PAGAMENTO CONFIRMADO — Japão Express</b>

📦 <b>Pedido:</b> ${order.id}
👤 <b>Cliente:</b> ${order.customerName}
📧 <b>Email:</b> ${order.customerEmail}
📱 <b>Tel:</b> ${order.customerPhone || 'não informado'}

🧾 <b>Itens:</b>
${items}

💰 <b>Subtotal:</b> R$ ${(order.subtotal || 0).toFixed(2)}
${order.discount > 0 ? `🏷️ <b>Desconto PIX:</b> −R$ ${order.discount.toFixed(2)}\n` : ''}✈️ <b>Envio:</b> ${order.shippingName || ''} — R$ ${(order.shippingBRL || 0).toFixed(2)}
💳 <b>Total pago:</b> R$ ${(order.total || 0).toFixed(2)}
💳 <b>Pagamento:</b> ${payIcon[order.paymentMethod] || order.paymentMethod}

🆔 <b>Stripe session:</b> <code>${order.stripeSessionId}</code>
⏰ ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const key           = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!key) return res.status(200).json({ ok: false, reason: 'Stripe not configured' });

  const stripe  = new Stripe(key, { apiVersion: '2023-10-16', fetchFn: globalThis.fetch.bind(globalThis) });
  const rawBody = await getRawBody(req);
  const sig     = req.headers['stripe-signature'];

  let event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // Sem segredo configurado: aceita sem verificar (apenas para testes locais)
      event = JSON.parse(rawBody.toString());
    }
  } catch (e) {
    console.error('[JE Webhook] Signature verification failed:', e.message);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  // ── Pagamento confirmado (cartão imediato) ────────────
  if (event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded') {

    const session  = event.data.object;
    const meta     = session.metadata || {};
    const amountTotal = (session.amount_total || 0) / 100; // centavos → BRL

    // Reconstrói objeto de pedido a partir dos metadados Stripe
    const order = {
      id:              meta.orderId        || session.id,
      stripeSessionId: session.id,
      customerName:    meta.customerName   || session.customer_details?.name  || '',
      customerEmail:   session.customer_details?.email || '',
      customerPhone:   meta.customerPhone  || '',
      items:           [],                 // itens detalhados no localStorage do cliente
      subtotal:        amountTotal,        // fallback — cliente tem o valor real
      discount:        0,
      shippingName:    meta.shippingName   || '',
      shippingBRL:     parseFloat(meta.shippingBRL)  || 0,
      shippingJPY:     parseFloat(meta.shippingJPY)  || 0,
      shippingMethod:  meta.shippingMethod || '',
      total:           amountTotal,
      paymentMethod:   meta.paymentMethod  || 'card',
      uid:             meta.uid            || '',
    };

    // Envia notificação Telegram (fire-and-forget)
    sendTelegram(order).catch(e => console.warn('[JE Webhook] Telegram error:', e));
  }

  return res.status(200).json({ received: true });
}
