// ═══════════════════════════════════════════════════════════
// Japão Express — Endpoint de email transacional
// POST /api/send-email
// Authorization: Bearer {ADMIN_SECRET}
// Body: { event, order }
// ═══════════════════════════════════════════════════════════

import { sendEmail } from '../lib/sendEmail.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth
  const auth   = req.headers.authorization || '';
  const secret = process.env.ADMIN_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { event, order } = req.body || {};
  if (!event) return res.status(400).json({ error: 'Missing event' });
  if (!order) return res.status(400).json({ error: 'Missing order' });

  try {
    const result = await sendEmail(event, order);
    return res.status(200).json(result);
  } catch (e) {
    console.error('[JE send-email] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
