// ═══════════════════════════════════════════════════════════
// Japão Express — Email transacional via Gmail / Nodemailer
// ═══════════════════════════════════════════════════════════

import nodemailer from 'nodemailer';

const STORE_URL   = process.env.DOMAIN || 'https://japaoexpress.vercel.app';
const FROM_EMAIL  = process.env.FROM_EMAIL || 'ojapaoexpress@gmail.com';
const FROM_NAME   = 'Japão Express';
const WHATSAPP    = 'https://wa.me/8109039393321';
const INSTAGRAM   = 'https://www.instagram.com/ojapaoexpress';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: FROM_EMAIL, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

// ── Helpers ───────────────────────────────────────────────

function fmtBRL(v) {
  return 'R$\u00a0' + Number(v || 0).toFixed(2).replace('.', ',');
}

function firstName(name) {
  return (name || 'cliente').split(' ')[0];
}

function itemsTable(items) {
  if (!items?.length) return '';
  const rows = items.map(i => `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid #F0EBF8;font-size:13px;
                 font-weight:700;color:#4A3060;line-height:1.4">
        ${i.name}
        ${(i.qty || 1) > 1 ? `<span style="color:#9B59B6;font-size:12px"> ×${i.qty}</span>` : ''}
      </td>
      <td style="padding:9px 0;border-bottom:1px solid #F0EBF8;font-size:13px;
                 font-weight:900;color:#2C1654;text-align:right;white-space:nowrap">
        ${fmtBRL((i.priceBRL || 0) * (i.qty || 1))}
      </td>
    </tr>`).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 0">
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsBlock(order) {
  const discount = (order.discount > 0)
    ? `<tr>
         <td style="padding:4px 0;font-size:12px;font-weight:700;color:#059669">Desconto PIX 5%</td>
         <td style="padding:4px 0;font-size:12px;font-weight:900;color:#059669;text-align:right">
           −${fmtBRL(order.discount)}
         </td>
       </tr>` : '';

  return `
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#F7F3FF;border-radius:14px;padding:14px 18px;margin:18px 0">
      <tbody>
        <tr>
          <td style="padding:4px 0;font-size:12px;font-weight:600;color:#6B7280">Subtotal</td>
          <td style="padding:4px 0;font-size:12px;font-weight:800;color:#2C1654;text-align:right">
            ${fmtBRL(order.subtotal)}
          </td>
        </tr>
        ${discount}
        <tr>
          <td style="padding:4px 0;font-size:12px;font-weight:600;color:#6B7280">
            Frete — ${order.shippingName || 'Japan Post'}
          </td>
          <td style="padding:4px 0;font-size:12px;font-weight:800;color:#2C1654;text-align:right">
            ${fmtBRL(order.shippingBRL)}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:0">
            <div style="height:1px;background:#E8DEF8;margin:6px 0"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:2px 0;font-size:15px;font-weight:900;color:#2C1654">Total pago</td>
          <td style="padding:2px 0;font-size:17px;font-weight:900;color:#9B59B6;text-align:right">
            ${fmtBRL(order.total)}
          </td>
        </tr>
      </tbody>
    </table>`;
}

// ── Layout base ───────────────────────────────────────────

function wrap(content, { preheader = '' } = {}) {
  const LOGO_URL = `${STORE_URL}/logo.png`;

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Japão Express</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    :root { color-scheme: light only; }
    /* Força modo claro mesmo quando o app está em dark mode */
    @media (prefers-color-scheme: dark) {
      body, #emailBody, #emailCard, #emailHeader, #emailFooter {
        background-color: #E8DEF8 !important;
        color: #2C1654 !important;
      }
      #emailCard { background-color: #FDFAF2 !important; }
      #emailHeader { background-color: #FDFAF2 !important; border-color: #F0EBF8 !important; }
      #emailFooter { background-color: #F5F0FF !important; border-color: #F0EBF8 !important; }
    }
  </style>
</head>
<body id="emailBody"
      style="margin:0;padding:0;background-color:#E8DEF8 !important;
             font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
             -webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%">

  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;
    font-size:1px;line-height:1px;color:#E8DEF8">${preheader}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#E8DEF8 !important;min-width:320px">
    <tr><td align="center" style="padding:32px 16px 40px;background-color:#E8DEF8 !important">

      <!-- CARD -->
      <table id="emailCard" role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:580px;background-color:#FDFAF2 !important;border-radius:22px;
                    border-top:8px solid #9B59B6;
                    box-shadow:0 8px 32px rgba(44,22,84,0.12)">

        <!-- HEADER -->
        <tr>
          <td id="emailHeader"
              style="padding:22px 36px 20px;border-bottom:2px solid #F0EBF8;
                     background-color:#FDFAF2 !important;border-radius:14px 14px 0 0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle">
                  <!-- Logo imagem -->
                  <img src="${LOGO_URL}" alt="Japão Express" height="64"
                       style="height:64px;max-height:64px;display:block;
                              border:0;outline:none;text-decoration:none"
                       onerror="this.style.display='none'">
                  <!-- Fallback texto (aparece se a imagem não carregar) -->
                  <div style="font-size:20px;font-weight:900;color:#2C1654;
                              letter-spacing:-0.3px;margin-top:4px">
                    Japão Express
                  </div>
                  <div style="font-size:11px;font-weight:700;color:#9B59B6;
                              margin-top:2px;letter-spacing:0.04em">
                    Importados direto do Japão para o Brasil
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:30px 36px">${content}</td>
        </tr>

        <!-- DIVIDER -->
        <tr>
          <td style="padding:0 36px">
            <div style="height:1px;background:linear-gradient(to right,transparent,#E8DEF8,transparent)"></div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td id="emailFooter"
              style="padding:20px 36px 26px;text-align:center;
                     background-color:#F5F0FF !important;
                     border-top:1px solid #F0EBF8;
                     border-radius:0 0 22px 22px">
            <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#9B59B6">
              <a href="${STORE_URL}/meus-pedidos.html"
                 style="color:#9B59B6;text-decoration:none">Meus Pedidos</a>
              &nbsp;·&nbsp;
              <a href="${STORE_URL}/produtos.html"
                 style="color:#9B59B6;text-decoration:none">Loja</a>
              &nbsp;·&nbsp;
              <a href="${WHATSAPP}"
                 style="color:#9B59B6;text-decoration:none">WhatsApp</a>
              &nbsp;·&nbsp;
              <a href="${INSTAGRAM}"
                 style="color:#9B59B6;text-decoration:none">Instagram</a>
            </p>
            <p style="margin:0;font-size:11px;color:#BBA8D4;font-weight:600">
              © 2026 Japão Express &nbsp;·&nbsp; ojapaoexpress@gmail.com
            </p>
          </td>
        </tr>

      </table>
      <!-- /CARD -->

    </td></tr>
  </table>

</body>
</html>`;
}

// ── Template 1: Pagamento confirmado ─────────────────────

function tplPaymentConfirmed(order) {
  const PAY = { pix:'PIX', card:'Cartão de Crédito', boleto:'Boleto Bancário', wise:'Wise' };
  const pay = PAY[order.paymentMethod] || order.paymentMethod || '—';

  return {
    subject: `✅ Pagamento confirmado — Pedido ${order.id}`,
    preheader: `Recebemos seu pagamento de ${fmtBRL(order.total)} com sucesso!`,
    html: wrap(`

      <!-- Ícone -->
      <div style="text-align:center;margin-bottom:22px">
        <div style="display:inline-flex;align-items:center;justify-content:center;
                    width:84px;height:84px;background:#DCFCE7;border-radius:50%;
                    font-size:38px">✅</div>
      </div>

      <!-- Título -->
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#2C1654;
                 text-align:center;letter-spacing:-0.3px">
        Pagamento confirmado!
      </h1>
      <p style="margin:0 0 26px;font-size:14px;font-weight:600;color:#6B7280;
                text-align:center;line-height:1.5">
        Olá, <strong style="color:#2C1654">${firstName(order.customerName)}</strong>!
        Recebemos seu pagamento com sucesso. Seu pedido já está sendo preparado. 🎉
      </p>

      <!-- Box pedido -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:#F7F3FF;border-radius:14px;padding:16px 20px;margin-bottom:22px">
        <tr>
          <td style="font-size:11px;font-weight:900;color:#9B59B6;
                     text-transform:uppercase;letter-spacing:0.07em;padding-bottom:12px"
              colspan="2">Detalhes do pedido</td>
        </tr>
        <tr>
          <td style="font-size:12px;font-weight:600;color:#6B7280;padding:3px 0">Nº do Pedido</td>
          <td style="font-size:13px;font-weight:900;color:#2C1654;text-align:right;
                     font-family:monospace;padding:3px 0">${order.id}</td>
        </tr>
        <tr>
          <td style="font-size:12px;font-weight:600;color:#6B7280;padding:3px 0">Forma de pagamento</td>
          <td style="font-size:13px;font-weight:700;color:#2C1654;text-align:right;padding:3px 0">${pay}</td>
        </tr>
        <tr>
          <td style="font-size:12px;font-weight:600;color:#6B7280;padding:3px 0">Total</td>
          <td style="font-size:14px;font-weight:900;color:#9B59B6;text-align:right;padding:3px 0">
            ${fmtBRL(order.total)}
          </td>
        </tr>
      </table>

      <!-- Itens -->
      ${order.items?.length ? `
        <p style="margin:0 0 2px;font-size:11px;font-weight:900;color:#9B59B6;
                  text-transform:uppercase;letter-spacing:0.07em">Itens do pedido</p>
        ${itemsTable(order.items)}
        ${totalsBlock(order)}
      ` : ''}

      <!-- Próximos passos -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:#EDE9FE;border-radius:14px;padding:18px 20px;margin-top:22px">
        <tr>
          <td>
            <p style="margin:0 0 10px;font-size:12px;font-weight:900;color:#7C3AED;
                      text-transform:uppercase;letter-spacing:0.06em">O que acontece agora?</p>
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#4A3060;line-height:1.6">
              📦 Estamos preparando seu pedido para envio direto do Japão para o Brasil.
            </p>
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#4A3060;line-height:1.6">
              ✈️ Assim que seu pedido for despachado, você receberá um novo e-mail
              com o <strong>código de rastreamento</strong>.
            </p>
            <p style="margin:0;font-size:13px;font-weight:600;color:#4A3060;line-height:1.6">
              ⏱️ Prazo estimado de entrega: <strong>15 a 40 dias úteis</strong>
              após o envio (varia conforme a modalidade de frete).
            </p>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin-top:28px">
        <a href="${STORE_URL}/meus-pedidos.html"
           style="display:inline-block;background:#9B59B6;color:#ffffff;
                  font-size:14px;font-weight:900;letter-spacing:0.02em;
                  padding:13px 36px;border-radius:999px;text-decoration:none">
          Acompanhar meu pedido
        </a>
      </div>

      <!-- Suporte -->
      <p style="margin:22px 0 0;font-size:12px;font-weight:600;color:#9B59B6;
                text-align:center;line-height:1.6">
        Dúvidas? Fale com a gente pelo
        <a href="${WHATSAPP}" style="color:#9B59B6;font-weight:900">WhatsApp</a>
        ou responda este e-mail. 💜
      </p>

    `, { preheader: `Recebemos seu pagamento de ${fmtBRL(order.total)}!` }),
  };
}

// ── Template 2: Pedido enviado ────────────────────────────

function tplShipped(order) {
  const code = order.trackingCode || '';
  const url  = order.trackingUrl
    || (code ? `https://rastreamento.correios.com.br/app/resultado.php?objeto=${code}` : STORE_URL);

  return {
    subject: `✈️ Seu pedido foi enviado! Rastreio: ${code}`,
    html: wrap(`

      <!-- Ícone -->
      <div style="text-align:center;margin-bottom:22px">
        <div style="display:inline-flex;align-items:center;justify-content:center;
                    width:84px;height:84px;background:#FEF3C7;border-radius:50%;
                    font-size:38px">✈️</div>
      </div>

      <!-- Título -->
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#2C1654;
                 text-align:center;letter-spacing:-0.3px">
        Seu pedido foi enviado!
      </h1>
      <p style="margin:0 0 26px;font-size:14px;font-weight:600;color:#6B7280;
                text-align:center;line-height:1.5">
        Boa notícia, <strong style="color:#2C1654">${firstName(order.customerName)}</strong>!
        Seu pedido saiu do Japão e está a caminho do Brasil. 🇯🇵 → 🇧🇷
      </p>

      <!-- Box rastreamento -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:linear-gradient(135deg,#7C3AED,#9B59B6);
                    border-radius:18px;padding:24px 28px;margin-bottom:24px;text-align:center">
        <tr>
          <td>
            <p style="margin:0 0 6px;font-size:11px;font-weight:900;color:rgba(255,255,255,0.75);
                      text-transform:uppercase;letter-spacing:0.1em">
              Código de Rastreamento
            </p>
            <p style="margin:0 0 16px;font-size:26px;font-weight:900;color:#ffffff;
                      letter-spacing:4px;font-family:monospace">
              ${code}
            </p>
            <a href="${url}"
               style="display:inline-block;background:#ffffff;color:#7C3AED;
                      font-size:13px;font-weight:900;padding:11px 30px;
                      border-radius:999px;text-decoration:none;letter-spacing:0.02em">
              🔍 Rastrear pedido agora
            </a>
          </td>
        </tr>
      </table>

      <!-- Instruções de rastreamento -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="border:2px dashed #C9B8E8;border-radius:14px;
                    padding:16px 20px;margin-bottom:22px">
        <tr>
          <td>
            <p style="margin:0 0 8px;font-size:12px;font-weight:900;color:#9B59B6">
              💡 Como rastrear seu pedido
            </p>
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#4A3060;line-height:1.6">
              1. Clique no botão acima ou acesse
              <strong>rastreamento.correios.com.br</strong>
            </p>
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#4A3060;line-height:1.6">
              2. Insira o código <strong style="font-family:monospace">${code}</strong>
            </p>
            <p style="margin:0;font-size:12px;font-weight:600;color:#9B7DB0;line-height:1.6">
              ⏳ O rastreamento pode levar até <strong>48–72 horas</strong>
              para aparecer no sistema após o despacho.
            </p>
          </td>
        </tr>
      </table>

      <!-- Info do pedido -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:#F7F3FF;border-radius:14px;padding:14px 20px;margin-bottom:18px">
        <tr>
          <td style="font-size:12px;font-weight:600;color:#6B7280;padding:3px 0">Pedido</td>
          <td style="font-size:13px;font-weight:900;color:#2C1654;text-align:right;
                     font-family:monospace;padding:3px 0">${order.id}</td>
        </tr>
        <tr>
          <td style="font-size:12px;font-weight:600;color:#6B7280;padding:3px 0">Envio</td>
          <td style="font-size:13px;font-weight:700;color:#2C1654;text-align:right;padding:3px 0">
            ${order.shippingName || 'Japan Post'}
          </td>
        </tr>
        <tr>
          <td style="font-size:12px;font-weight:600;color:#6B7280;padding:3px 0">Previsão de entrega</td>
          <td style="font-size:13px;font-weight:700;color:#2C1654;text-align:right;padding:3px 0">
            15–40 dias úteis
          </td>
        </tr>
      </table>

      <!-- Itens (se disponível) -->
      ${order.items?.length ? `
        <p style="margin:0 0 2px;font-size:11px;font-weight:900;color:#9B59B6;
                  text-transform:uppercase;letter-spacing:0.07em">Itens enviados</p>
        ${itemsTable(order.items)}
      ` : ''}

      <!-- Suporte -->
      <p style="margin:22px 0 0;font-size:12px;font-weight:600;color:#9B59B6;
                text-align:center;line-height:1.6">
        Alguma dúvida sobre o envio? Fale com a gente pelo
        <a href="${WHATSAPP}" style="color:#9B59B6;font-weight:900">WhatsApp</a>. 💜
      </p>

    `),
  };
}

// ── Template 3: Pedido criado ─────────────────────────────

function tplOrderCreated(order) {
  const PAY_MSG = {
    boleto: '📄 Seu boleto está disponível na página de pagamento. <strong>Prazo para pagamento: 3 dias úteis.</strong> Após este prazo, o pedido será cancelado automaticamente.',
    pix:    '🟢 Seu QR Code PIX está disponível na página de pagamento. O pagamento é confirmado em segundos!',
    card:   '💳 Pagamento com cartão em análise. Você receberá a confirmação em instantes.',
    wise:   '🌍 Envie o pagamento via Wise conforme as instruções na página de sucesso.',
  };
  const payMsg = PAY_MSG[order.paymentMethod] || '⏳ Aguardando confirmação do pagamento.';

  return {
    subject: `🛒 Pedido recebido — ${order.id}`,
    html: wrap(`

      <div style="text-align:center;margin-bottom:22px">
        <div style="display:inline-flex;align-items:center;justify-content:center;
                    width:84px;height:84px;background:#DBEAFE;border-radius:50%;
                    font-size:38px">🛒</div>
      </div>

      <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#2C1654;
                 text-align:center;letter-spacing:-0.3px">
        Pedido recebido!
      </h1>
      <p style="margin:0 0 26px;font-size:14px;font-weight:600;color:#6B7280;
                text-align:center;line-height:1.5">
        Olá, <strong style="color:#2C1654">${firstName(order.customerName)}</strong>!
        Recebemos seu pedido. Assim que o pagamento for confirmado, começamos a prepará-lo. 🎌
      </p>

      <!-- Box pedido -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:#F7F3FF;border-radius:14px;padding:16px 20px;margin-bottom:20px">
        <tr>
          <td style="font-size:12px;font-weight:600;color:#6B7280;padding:3px 0">Nº do Pedido</td>
          <td style="font-size:14px;font-weight:900;color:#9B59B6;text-align:right;
                     font-family:monospace;padding:3px 0">${order.id}</td>
        </tr>
      </table>

      <!-- Instrução de pagamento -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:#FFFBEB;border:2px solid #FDE68A;border-radius:14px;
                    padding:16px 20px;margin-bottom:20px">
        <tr>
          <td style="font-size:13px;font-weight:600;color:#92400E;line-height:1.6">
            ${payMsg}
          </td>
        </tr>
      </table>

      ${order.items?.length ? `
        <p style="margin:0 0 2px;font-size:11px;font-weight:900;color:#9B59B6;
                  text-transform:uppercase;letter-spacing:0.07em">Resumo do pedido</p>
        ${itemsTable(order.items)}
        ${totalsBlock(order)}
      ` : ''}

      <div style="text-align:center;margin-top:28px">
        <a href="${STORE_URL}/meus-pedidos.html"
           style="display:inline-block;background:#9B59B6;color:#ffffff;
                  font-size:14px;font-weight:900;padding:13px 36px;
                  border-radius:999px;text-decoration:none">
          Ver meu pedido
        </a>
      </div>

    `),
  };
}

// ── Template 4: Entregue ──────────────────────────────────

function tplDelivered(order) {
  return {
    subject: `🎉 Seu pedido chegou! — ${order.id}`,
    html: wrap(`

      <div style="text-align:center;margin-bottom:22px">
        <div style="display:inline-flex;align-items:center;justify-content:center;
                    width:84px;height:84px;background:#DCFCE7;border-radius:50%;
                    font-size:38px">🎉</div>
      </div>

      <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#2C1654;
                 text-align:center;letter-spacing:-0.3px">
        Seu pedido chegou!
      </h1>
      <p style="margin:0 0 26px;font-size:14px;font-weight:600;color:#6B7280;
                text-align:center;line-height:1.5">
        <strong style="color:#2C1654">${firstName(order.customerName)}</strong>,
        esperamos que você esteja adorando seus produtos importados do Japão! 🇯🇵💜
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:#F7F3FF;border-radius:14px;padding:16px 20px;
                    margin-bottom:24px;text-align:center">
        <tr>
          <td style="font-size:13px;font-weight:700;color:#4A3060">
            Pedido <strong style="font-family:monospace;color:#9B59B6">${order.id}</strong>
            entregue com sucesso. ✅
          </td>
        </tr>
      </table>

      <!-- CTA comprar mais -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:#EDE9FE;border-radius:14px;padding:20px 24px;
                    margin-bottom:24px;text-align:center">
        <tr>
          <td>
            <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#4A3060;line-height:1.5">
              Gostou? Confira as novidades que chegaram da nossa loja no Japão! 🛍️
            </p>
            <a href="${STORE_URL}/produtos.html"
               style="display:inline-block;background:#9B59B6;color:#ffffff;
                      font-size:14px;font-weight:900;padding:12px 32px;
                      border-radius:999px;text-decoration:none">
              Ver produtos
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:12px;font-weight:600;color:#9B59B6;
                text-align:center;line-height:1.6">
        Siga a gente no
        <a href="${INSTAGRAM}" style="color:#9B59B6;font-weight:900">@ojapaoexpress</a>
        para ver novidades em primeira mão! 📸
      </p>

    `),
  };
}

// ── Export principal ──────────────────────────────────────

/**
 * sendEmail(event, order)
 * event: 'payment_confirmed' | 'shipped' | 'order_created' | 'delivered'
 */
export async function sendEmail(event, order) {
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.warn('[JE Email] GMAIL_APP_PASSWORD não configurado — email ignorado');
    return { skipped: true, reason: 'no_password' };
  }
  if (!order?.customerEmail) {
    console.warn('[JE Email] customerEmail ausente — email ignorado');
    return { skipped: true, reason: 'no_email' };
  }

  const tplMap = {
    payment_confirmed: tplPaymentConfirmed,
    shipped:           tplShipped,
    order_created:     tplOrderCreated,
    delivered:         tplDelivered,
  };

  const tplFn = tplMap[event];
  if (!tplFn) throw new Error(`Template desconhecido: ${event}`);

  const { subject, html } = tplFn(order);
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from:    `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to:      order.customerEmail,
    subject,
    html,
  });

  console.log(`[JE Email] ✅ ${event} → ${order.customerEmail} (${info.messageId})`);
  return { ok: true, messageId: info.messageId };
}
