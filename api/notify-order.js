export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(200).json({ ok: false, reason: 'Telegram not configured' });
  }

  const { order } = req.body || {};
  if (!order) return res.status(400).json({ error: 'Missing order' });

  const items = (order.items || [])
    .map(i => `  • ${i.name} x${i.qty || 1} — R$ ${((i.priceBRL || 0) * (i.qty || 1)).toFixed(2)}`)
    .join('\n');

  const text = `🛒 <b>Novo Pedido — Japão Express</b>

📦 <b>Pedido:</b> ${order.id}
👤 <b>Cliente:</b> ${order.customerName}
📧 <b>Email:</b> ${order.customerEmail}
📱 <b>Tel:</b> ${order.customerPhone || 'não informado'}

🧾 <b>Itens:</b>
${items}

💰 <b>Subtotal:</b> R$ ${(order.subtotal || 0).toFixed(2)}
${order.discount > 0 ? `🏷️ <b>Desconto:</b> -R$ ${order.discount.toFixed(2)}\n` : ''}✈️ <b>Envio:</b> ${order.shipping?.name || ''} — R$ ${(order.shipping?.priceBRL || 0).toFixed(2)}
💳 <b>Total:</b> R$ ${(order.total || 0).toFixed(2)}
💳 <b>Pagamento:</b> ${order.payment || ''}

⏰ ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
    const data = await r.json();
    return res.status(200).json({ ok: data.ok });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message });
  }
}
