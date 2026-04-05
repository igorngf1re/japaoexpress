// ═══════════════════════════════════════════════════════════
// Japão Express — Admin API
// Actions: validate | add | update | delete
// Auth: Bearer token == ADMIN_SECRET env var
// ═══════════════════════════════════════════════════════════

const ADMIN_SECRET  = process.env.ADMIN_SECRET;
const GITHUB_TOKEN  = process.env.GITHUB_TOKEN;
const GITHUB_REPO   = process.env.GITHUB_REPO   || 'igorngf1re/japaoexpress';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const FILE_PATH     = 'js/products.js';

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  // ── Auth ───────────────────────────────────────────────
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!ADMIN_SECRET) return res.status(503).json({ ok: false, error: 'ADMIN_SECRET não configurado na Vercel.' });
  if (token !== ADMIN_SECRET) return res.status(401).json({ ok: false, error: 'Chave de admin incorreta.' });

  const { action, product, productId } = req.body || {};

  // ── validate: só testa a chave ─────────────────────────
  if (action === 'validate') {
    return res.status(200).json({ ok: true });
  }

  if (!GITHUB_TOKEN) return res.status(503).json({ ok: false, error: 'GITHUB_TOKEN não configurado na Vercel.' });

  try {
    // ── Lê arquivo atual ────────────────────────────────
    const { content, sha } = await getFile();

    if (action === 'add' || action === 'update') {
      if (!product || !product.id) return res.status(400).json({ ok: false, error: 'Produto inválido.' });
      const newContent = upsertProduct(content, product, action === 'update');
      await commitFile(sha, newContent, `${action === 'update' ? 'fix' : 'feat'}: ${action === 'update' ? 'update' : 'add'} product "${product.name}" via admin panel`);
      return res.status(200).json({ ok: true });
    }

    if (action === 'delete') {
      if (!productId) return res.status(400).json({ ok: false, error: 'productId necessário.' });
      const newContent = removeProduct(content, productId);
      await commitFile(sha, newContent, `chore: remove product "${productId}" via admin panel`);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: `Ação desconhecida: ${action}` });

  } catch (err) {
    console.error('Admin API error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// ── GitHub helpers ────────────────────────────────────────

async function getFile() {
  const resp = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${GITHUB_BRANCH}`,
    { headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' } }
  );
  if (!resp.ok) throw new Error(`GitHub GET: ${resp.status}`);
  const data = await resp.json();
  return { content: atob(data.content.replace(/\n/g, '')), sha: data.sha };
}

async function commitFile(sha, newContent, message) {
  const resp = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(newContent))),
        sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`GitHub PUT: ${resp.status} — ${err.slice(0, 200)}`);
  }
}

// ── Insere ou substitui produto no array PRODUCTS ─────────

function upsertProduct(content, product, replace) {
  const productLine = `  ${JSON.stringify(product, null, 2).split('\n').join('\n  ')},`;

  if (replace) {
    // Remove entrada existente com mesmo id
    const idEsc   = product.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const blockRe = new RegExp(
      `\\s*\\{[^{}]*"id":\\s*"${idEsc}"[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\},?`,
      'g'
    );
    content = content.replace(blockRe, '');
  }

  const newContent = content.replace(
    /const PRODUCTS = \[(\s*\/\/[^\n]*)?\n/,
    `const PRODUCTS = [\n${productLine}\n`
  );

  if (newContent === content) throw new Error('Não foi possível inserir no array PRODUCTS.');
  return newContent;
}

// ── Remove produto pelo id ────────────────────────────────

function removeProduct(content, productId) {
  const idEsc   = productId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const blockRe = new RegExp(
    `\\s*\\{[^{}]*"id":\\s*"${idEsc}"[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\},?`,
    'g'
  );
  const newContent = content.replace(blockRe, '');
  if (newContent === content) throw new Error(`Produto "${productId}" não encontrado.`);
  return newContent;
}
