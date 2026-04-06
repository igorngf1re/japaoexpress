// ═══════════════════════════════════════════════════════════
// Japão Express — Upload de imagem para o repositório GitHub
// Recebe: { base64, filename, mimeType }
// Retorna: { ok: true, url: '...' }
// ═══════════════════════════════════════════════════════════

const GITHUB_TOKEN  = process.env.GITHUB_TOKEN;
const GITHUB_REPO   = process.env.GITHUB_REPO   || 'igorngf1re/japaoexpress';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const ADMIN_SECRET  = process.env.ADMIN_SECRET;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  // Auth
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!ADMIN_SECRET || token !== ADMIN_SECRET)
    return res.status(401).json({ ok: false, error: 'Não autorizado.' });

  if (!GITHUB_TOKEN)
    return res.status(503).json({ ok: false, error: 'GITHUB_TOKEN não configurado.' });

  const { base64, filename, mimeType } = req.body || {};
  if (!base64 || !filename)
    return res.status(400).json({ ok: false, error: 'base64 e filename são obrigatórios.' });

  // Sanitize filename: keep only safe chars
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
  const ts   = Date.now();
  const path = `images/produtos/${ts}_${safe}`;

  try {
    // Check if file already exists (to get sha for update, unlikely but safe)
    let sha;
    const check = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
      { headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' } }
    );
    if (check.ok) {
      const existing = await check.json();
      sha = existing.sha;
    }

    // Commit image to GitHub
    const body = {
      message: `upload: product image ${safe}`,
      content: base64, // already base64 from client
      branch: GITHUB_BRANCH,
    };
    if (sha) body.sha = sha;

    const resp = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`GitHub PUT: ${resp.status} — ${err.slice(0, 200)}`);
    }

    // Return jsDelivr CDN URL (fast, no hotlink protection)
    const url = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${GITHUB_BRANCH}/${path}`;
    return res.status(200).json({ ok: true, url });

  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
