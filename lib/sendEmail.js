// ═══════════════════════════════════════════════════════════
// Japão Express — Email transacional via Gmail / Nodemailer
// Exporta sendEmail(event, order) — sem handler HTTP.
// Importado por api/send-email.js e api/stripe-webhook.js.
// ═══════════════════════════════════════════════════════════

import nodemailer from 'nodemailer';

const STORE_URL  = process.env.DOMAIN || 'https://japaoexpress.vercel.app';
const FROM_EMAIL = process.env.FROM_EMAIL || 'ojapaoexpress@gmail.com';
const FROM_NAME  = 'Japão Express';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: FROM_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// ── Helpers ───────────────────────────────────────────────

function fmtBRL(v) {
  return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
}

function itemsTable(items) {
  if (!items?.length) return '';
  const rows = items.map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #F0EBF8;font-size:13px;font-weight:700;color:#4A3060">
        ${i.name}${(i.qty || 1) > 1 ? ' <span style="color:#9B59B6">×' + i.qty + '</span>' : ''}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #F0EBF8;font-size:13px;font-weight:900;color:#2C1654;text-align:right;white-space:nowrap">
        ${fmtBRL((i.priceBRL || 0) * (i.qty || 1))}
      </td>
    </tr>`).join('');
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsBlock(order) {
  const discount = order.discount > 0
    ? `<tr>
        <td style="padding:3px 0;font-size:12px;font-weight:700;color:#27AE60">Desconto PIX</td>
        <td style="padding:3px 0;font-size:12px;font-weight:900;color:#27AE60;text-align:right">−${fmtBRL(order.discount)}</td>
       </tr>` : '';
  return `
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#F7F3FF;border-radius:12px;padding:14px 16px;margin:16px 0">
      <tbody>
        <tr>
          <td style="padding:3px 0;font-size:12px;font-weight:600;color:#6B7280">Subtotal</td>
          <td style="padding:3px 0;font-size:12px;font-weight:800;color:#2C1654;text-align:right">${fmtBRL(order.subtotal)}</td>
        </tr>
        ${discount}
        <tr>
          <td style="padding:3px 0;font-size:12px;font-weight:600;color:#6B7280">Frete (${order.shippingName || 'Japan Post'})</td>
          <td style="padding:3px 0;font-size:12px;font-weight:800;color:#2C1654;text-align:right">${fmtBRL(order.shippingBRL)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0 3px;border-top:2px dashed #E8DEF8;font-size:14px;font-weight:900;color:#2C1654">Total</td>
          <td style="padding:6px 0 3px;border-top:2px dashed #E8DEF8;font-size:16px;font-weight:900;color:#9B59B6;text-align:right">${fmtBRL(order.total)}</td>
        </tr>
      </tbody>
    </table>`;
}

// ── Layout base (header + footer) ────────────────────────

function wrap(content) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Japão Express</title>
</head>
<body style="margin:0;padding:0;background:#E8DEF8;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#E8DEF8">
  <tr><td align="center" style="padding:32px 16px">
    <table width="100%" cellpadding="0" cellspacing="0"
           style="max-width:560px;background:#FDFAF2;border-radius:20px;
                  border-top:8px solid #9B59B6;
                  box-shadow:0 4px 24px rgba(44,22,84,0.10);overflow:hidden">

      <!-- HEADER -->
      <tr><td style="padding:24px 32px 20px;border-bottom:1px solid #F0EBF8">
        <span style="font-size:22px;font-weight:900;color:#2C1654;letter-spacing:-0.5px">Japão Express</span>
        <span style="display:block;font-size:11px;font-weight:700;color:#9B59B6;margin-top:2px;letter-spacing:0.04em">
          Importados direto do Japão
        </span>
      </td></tr>

      <!-- CONTENT -->
      <tr><td style="padding:28px 32px">${content}</td></tr>

      <!-- FOOTER -->
      <tr><td style="padding:20px 32px;background:#F5F0FF;border-top:1px solid #F0EBF8;border-radius:0 0 20px 20px;text-align:center">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#9B59B6">
          <a href="${STORE_URL}/meus-pedidos.html" style="color:#9B59B6;text-decoration:none">Ver meus pedidos</a>
          &nbsp;·&nbsp;
          <a href="${STORE_URL}/produtos.html" style="color:#9B59B6;text-decoration:none">Continuar comprando</a>
        </p>
        <p style="margin:0;font-size:11px;color:#C9B8E8;font-weight:600">
          © 2026 Japão Express · ojapaoexpress@gmail.com
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ── Templates ─────────────────────────────────────────────

function tplPaymentConfirmed(order) {
  const payLabel = { pix: 'PIX', card: 'Cartão de Crédito', boleto: 'Boleto Bancário', wise: 'Wise' };
  const pay = payLabel[order.paymentMethod] || order.paymentMethod || '—';

  return {
    subject: `✅ Pagamento confirmado — Pedido ${order.id || ''}`,
    html: wrap(`
      <!-- Ícone de check -->
      <div style="text-align:center;margin-bottom:20px">
        <div style="display:inline-block;width:64px;height:64px;background:#D1FAE5;border-radius:50%;
                    line-height:64px;font-size:28px;text-align:center">✅</div>
      </div>

      <h1 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#2C1654;text-align:center">
        Pagamento confirmado!
      </h1>
      <p style="margin:0 0 20px;font-size:14px;font-weight:600;color:#6B7280;text-align:center">
        Olá, ${order.customerName || 'cliente'}! Recebemos seu pagamento com sucesso.
      </p>

      <!-- Box do pedido -->
      <div style="background:#F7F3FF;border-radius:14px;padding:16px 20px;margin-bottom:20px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:11px;font-weight:900;color:#9B59B6;text-transform:uppercase;letter-spacing:0.06em">Pedido</td>
            <td style="font-size:13px;font-weight:900;color:#2C1654;text-align:right;font-family:monospace">${order.id || '—'}</td>
          </tr>
          <tr>
            <td style="font-size:11px;font-weight:900;color:#9B59B6;text-transform:uppercase;letter-spacing:0.06em;padding-top:8px">Pagamento</td>
            <td style="font-size:13px;font-weight:700;color:#2C1654;text-align:right;padding-top:8px">${pay}</td>
          </tr>
        </table>
      </div>

      <!-- Itens -->
      ${order.items?.length ? `
        <p style="margin:0 0 4px;font-size:11px;font-weight:900;color:#9B59B6;text-transform:uppercase;letter-spacing:0.06em">Itens do pedido</p>
        ${itemsTable(order.items)}
      ` : ''}

      <!-- Totais -->
      ${totalsBlock(order)}

      <!-- Próximos passos -->
      <div style="background:#EDE9FE;border-radius:14px;padding:16px 20px;margin-top:20px">
        <p style="margin:0 0 8px;font-size:12px;font-weight:900;color:#7C3AED;text-transform:uppercase;letter-spacing:0.04em">
          O que acontece agora?
        </p>
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#4A3060;line-height:1.5">
          📦 Estamos preparando seu pedido para envio ao Brasil.
        </p>
        <p style="margin:0;font-size:13px;font-weight:600;color:#4A3060;line-height:1.5">
          ✈️ Você receberá um novo email com o código de rastreamento assim que o pedido for enviado.
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-top:24px">
        <a href="${STORE_URL}/meus-pedidos.html"
           style="display:inline-block;background:#9B59B6;color:#fff;font-size:14px;font-weight:900;
                  padding:12px 32px;border-radius:999px;text-decoration:none;letter-spacing:0.02em">
          Ver meu pedido
        </a>
      </div>
    `),
  };
}

function tplShipped(order) {
  const tracking = order.trackingCode || '';
  const trackUrl = order.trackingUrl
    || `https://rastreamento.correios.com.br/app/resultado.php?objeto=${tracking}`;

  return {
    subject: `📦 Pedido enviado! Rastreio: ${tracking}`,
    html: wrap(`
      <!-- Ícone de avião -->
      <div style="text-align:center;margin-bottom:20px">
        <div style="display:inline-block;width:64px;height:64px;background:#FFEDD5;border-radius:50%;
                    line-height:64px;font-size:28px;text-align:center">✈️</div>
      </div>

      <h1 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#2C1654;text-align:center">
        Seu pedido foi enviado!
      </h1>
      <p style="margin:0 0 24px;font-size:14px;font-weight:600;color:#6B7280;text-align:center">
        Olá, ${order.customerName || 'cliente'}! Seu pedido está a caminho do Brasil.
      </p>

      <!-- Box de rastreamento -->
      <div style="background:#EDE9FE;border-radius:16px;padding:20px 24px;margin-bottom:24px;text-align:center">
        <p style="margin:0 0 6px;font-size:11px;font-weight:900;color:#7C3AED;text-transform:uppercase;letter-spacing:0.08em">
          Código de Rastreamento
        </p>
        <p style="margin:0 0 14px;font-size:24px;font-weight:900;color:#2C1654;letter-spacing:3px;font-family:monospace">
          ${tracking}
        </p>
        <a href="${trackUrl}"
           style="display:inline-block;background:#9B59B6;color:#fff;font-size:13px;font-weight:900;
                  padding:10px 28px;border-radius:999px;text-decoration:none">
          Rastrear agora
        </a>
      </div>

      <!-- Info do pedido -->
      <div style="background:#F7F3FF;border-radius:12px;padding:14px 18px;margin-bottom:16px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:11px;font-weight:900;color:#9B59B6;text-transform:uppercase;letter-spacing:0.06em">Pedido</td>
            <td style="font-size:13px;font-weight:900;color:#2C1654;text-align:right;font-family:monospace">${order.id || '—'}</td>
          </tr>
          <tr>
            <td style="font-size:11px;font-weight:900;color:#9B59B6;text-transform:uppercase;letter-spacing:0.06em;padding-top:8px">Envio</td>
            <td style="font-size:13px;font-weight:700;color:#2C1654;text-align:right;padding-top:8px">${order.shippingName || 'Japan Post'}</td>
          </tr>
        </table>
      </div>

      <!-- Dica de rastreamento -->
      <div style="border:2px dashed #C9B8E8;border-radius:12px;padding:14px 18px;margin-bottom:20px">
        <p style="margin:0 0 6px;font-size:12px;font-weight:900;color:#9B59B6">💡 Como rastrear</p>
        <p style="margin:0;font-size:12px;font-weight:600;color:#4A3060;line-height:1.6">
          Clique no botão acima ou acesse <strong>rastreamento.correios.com.br</strong>
          e insira o código <strong style="font-family:monospace">${tracking}</strong>.
          O rastreamento pode levar até 48h para aparecer após o despacho.
        </p>
      </div>

      <!-- Itens -->
      ${order.items?.length ? `
        <p style="margin:0 0 4px;font-size:11px;font-weight:900;color:#9B59B6;text-transform:uppercase;letter-spacing:0.06em">Itens enviados</p>
        ${itemsTable(order.items)}
      ` : ''}

      <!-- Total -->
      ${totalsBlock(order)}
    `),
  };
}

function tplOrderCreated(order) {
  const payInstructions = {
    boleto: '📄 Seu boleto está disponível na página de pagamento. Prazo: 3 dias úteis.',
    pix:    '🟢 Seu QR Code PIX está disponível na página de pagamento.',
    card:   '💳 Pagamento em análise.',
    wise:   '🌍 Envie o pagamento via Wise conforme as instruções na página de sucesso.',
  };
  const payMsg = payInstructions[order.paymentMethod] || '💳 Aguardando confirmação de pagamento.';

  return {
    subject: `🛒 Pedido recebido — ${order.id || ''}`,
    html: wrap(`
      <div style="text-align:center;margin-bottom:20px">
        <div style="display:inline-block;width:64px;height:64px;background:#DBEAFE;border-radius:50%;
                    line-height:64px;font-size:28px;text-align:center">🛒</div>
      </div>

      <h1 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#2C1654;text-align:center">
        Pedido recebido!
      </h1>
      <p style="margin:0 0 20px;font-size:14px;font-weight:600;color:#6B7280;text-align:center">
        Olá, ${order.customerName || 'cliente'}! Recebemos seu pedido.
      </p>

      <div style="background:#F7F3FF;border-radius:14px;padding:16px 20px;margin-bottom:20px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:11px;font-weight:900;color:#9B59B6;text-transform:uppercase;letter-spacing:0.06em">Número do Pedido</td>
            <td style="font-size:13px;font-weight:900;color:#2C1654;text-align:right;font-family:monospace">${order.id || '—'}</td>
          </tr>
        </table>
      </div>

      <!-- Instrução de pagamento -->
      <div style="background:#FFFBEB;border:2px solid #FDE68A;border-radius:14px;padding:16px 20px;margin-bottom:20px">
        <p style="margin:0;font-size:13px;font-weight:700;color:#92400E;line-height:1.6">${payMsg}</p>
      </div>

      ${order.items?.length ? `
        <p style="margin:0 0 4px;font-size:11px;font-weight:900;color:#9B59B6;text-transform:uppercase;letter-spacing:0.06em">Itens</p>
        ${itemsTable(order.items)}
      ` : ''}

      ${totalsBlock(order)}

      <div style="text-align:center;margin-top:24px">
        <a href="${STORE_URL}/meus-pedidos.html"
           style="display:inline-block;background:#9B59B6;color:#fff;font-size:14px;font-weight:900;
                  padding:12px 32px;border-radius:999px;text-decoration:none">
          Ver meu pedido
        </a>
      </div>
    `),
  };
}

function tplDelivered(order) {
  return {
    subject: `🎉 Seu pedido chegou! — ${order.id || ''}`,
    html: wrap(`
      <div style="text-align:center;margin-bottom:20px">
        <div style="display:inline-block;width:64px;height:64px;background:#D1FAE5;border-radius:50%;
                    line-height:64px;font-size:28px;text-align:center">🎉</div>
      </div>

      <h1 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#2C1654;text-align:center">
        Seu pedido chegou!
      </h1>
      <p style="margin:0 0 20px;font-size:14px;font-weight:600;color:#6B7280;text-align:center">
        Olá, ${order.customerName || 'cliente'}! Esperamos que esteja adorando seus produtos japoneses. 🇯🇵
      </p>

      <div style="background:#F7F3FF;border-radius:14px;padding:14px 20px;margin-bottom:20px;text-align:center">
        <p style="margin:0;font-size:12px;font-weight:700;color:#4A3060">Pedido <strong style="font-family:monospace">${order.id || '—'}</strong> entregue com sucesso.</p>
      </div>

      <div style="text-align:center;margin-top:24px">
        <a href="${STORE_URL}/produtos.html"
           style="display:inline-block;background:#9B59B6;color:#fff;font-size:14px;font-weight:900;
                  padding:12px 32px;border-radius:999px;text-decoration:none">
          Comprar novamente
        </a>
      </div>
    `),
  };
}

// ── Main export ───────────────────────────────────────────

/**
 * sendEmail(event, order) — envia email transacional
 * @param {string} event  'payment_confirmed' | 'shipped' | 'order_created' | 'delivered'
 * @param {object} order  dados do pedido
 */
export async function sendEmail(event, order) {
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.warn('[JE Email] GMAIL_APP_PASSWORD não configurado — email ignorado');
    return { skipped: true };
  }
  if (!order?.customerEmail) {
    console.warn('[JE Email] customerEmail ausente — email ignorado');
    return { skipped: true };
  }

  const templates = {
    payment_confirmed: tplPaymentConfirmed,
    shipped:           tplShipped,
    order_created:     tplOrderCreated,
    delivered:         tplDelivered,
  };

  const tplFn = templates[event];
  if (!tplFn) throw new Error(`Template desconhecido: ${event}`);

  const { subject, html } = tplFn(order);
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from:    `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to:      order.customerEmail,
    subject,
    html,
  });

  console.log(`[JE Email] ${event} → ${order.customerEmail} (${info.messageId})`);
  return { ok: true, messageId: info.messageId };
}
