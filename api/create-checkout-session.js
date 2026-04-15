// ═══════════════════════════════════════════════════════════
// Japão Express — Stripe Checkout Session
// Cria sessão de pagamento Stripe com itens do carrinho,
// frete Japan Post, e desconto PIX (5%) se aplicável.
// ═══════════════════════════════════════════════════════════

import Stripe from 'stripe';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return res.status(200).json({ error: 'Stripe not configured', fallback: true });
  }

  const stripe = new Stripe(key, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient(globalThis.fetch.bind(globalThis)) });
  const domain = process.env.DOMAIN || 'https://japaoexpress.vercel.app';

  const {
    cart,
    shipping,   // { method, name, priceBRL, priceJPY }
    customer,   // { name, email, phone, uid }
    payment,    // 'pix' | 'card' | 'boleto'
    orderId,
    subtotal,
    discount,   // 0 or 5% of subtotal
  } = req.body || {};

  if (!cart?.length) return res.status(400).json({ error: 'Cart is empty' });

  try {
    // ── Line items: produtos ──────────────────────────────
    const lineItems = cart.map(item => {
      const isAbsolute = /^https?:\/\//.test(item.image || '');
      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
            ...(isAbsolute ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round((item.priceBRL || 0) * 100), // centavos
        },
        quantity: item.qty || 1,
      };
    });

    // ── Line item: frete ──────────────────────────────────
    if (shipping?.priceBRL > 0) {
      lineItems.push({
        price_data: {
          currency: 'brl',
          product_data: { name: `Frete — ${shipping.name || 'Japan Post'}` },
          unit_amount: Math.round(shipping.priceBRL * 100),
        },
        quantity: 1,
      });
    }

    // ── Desconto PIX: cupom de uso único ──────────────────
    let discounts = undefined;
    if (payment === 'pix' && discount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100), // centavos
        currency:   'brl',
        duration:   'once',
        name:       'Desconto PIX 5%',
      });
      discounts = [{ coupon: coupon.id }];
    }

    // ── Métodos de pagamento por seleção ──────────────────
    const pmTypes = payment === 'pix'    ? ['pix']
                  : payment === 'boleto' ? ['boleto']
                  :                        ['card'];

    // ── Cria sessão Stripe ────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customer?.email || undefined,
      line_items: lineItems,
      payment_method_types: pmTypes,
      ...(discounts ? { discounts } : {}),
      success_url: `${domain}/sucesso.html?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url:  `${domain}/checkout.html`,
      metadata: {
        orderId:       orderId  || '',
        uid:           customer?.uid   || '',
        customerName:  customer?.name  || '',
        customerPhone: customer?.phone || '',
        shippingName:  shipping?.name  || '',
        shippingBRL:   String(shipping?.priceBRL || 0),
        shippingJPY:   String(shipping?.priceJPY || 0),
        shippingMethod:shipping?.method || '',
        paymentMethod: payment || 'card',
      },
      // Coleta endereço de cobrança (Stripe exige para PIX e Boleto)
      billing_address_collection: 'required',
      // Para boleto: prazo de 3 dias úteis
      ...(payment === 'boleto' ? {
        payment_method_options: {
          boleto: { expires_after_days: 3 },
        },
      } : {}),
    });

    return res.status(200).json({ url: session.url });

  } catch (e) {
    console.error('[JE Stripe] create-checkout-session error:', {
      message:    e.message,
      type:       e.type,
      code:       e.code,
      statusCode: e.statusCode,
      raw:        e.raw,
    });
    return res.status(500).json({
      error:      e.message,
      type:       e.type       || null,
      code:       e.code       || null,
      statusCode: e.statusCode || null,
    });
  }
}
