// ═══════════════════════════════════════════════════════════
// Japão Express — Bot Telegram + OpenRouter Vision
// Fluxo: link → scrape → IA extrai dados
//        print → visão IA extrai dados
// ═══════════════════════════════════════════════════════════

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const BOT_TOKEN      = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS      = (process.env.TELEGRAM_ADMIN_IDS || '')
  .split(',').map(s => parseInt(s.trim())).filter(Boolean);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const update  = req.body;
  const message = update.message || update.channel_post;
  if (!message) return res.status(200).json({ ok: true });

  const chatId  = message.chat.id;
  const userId  = message.from?.id;
  const text    = (message.text || message.caption || '').trim();
  const photos  = message.photo;

  // Só admins podem usar o bot
  if (ADMIN_IDS.length > 0 && !ADMIN_IDS.includes(userId)) {
    return res.status(200).json({ ok: true });
  }

  try {
    // ── Comando /start ───────────────────────────────────
    if (text === '/start' || text === '/ajuda') {
      await sendMessage(chatId,
        `👋 *Japão Express Bot*\n\n` +
        `Eu extraio dados de produtos japoneses automaticamente!\n\n` +
        `📌 *Como usar:*\n` +
        `• Mande um *link* de produto (Amazon JP, Rakuten, Don Quijote…)\n` +
        `• Ou mande um *print* da página do produto\n` +
        `• Pode misturar: print + texto com contexto extra\n\n` +
        `📦 Eu retorno: nome, preço em ¥, peso estimado e categoria.`,
        { parse_mode: 'Markdown' }
      );
      return res.status(200).json({ ok: true });
    }

    let productData = null;

    // ── Modo visão: imagem enviada ───────────────────────
    if (photos && photos.length > 0) {
      await sendMessage(chatId, '🔍 Analisando a imagem…');
      const fileId = photos[photos.length - 1].file_id; // maior resolução
      productData  = await extractFromImage(fileId, text);
    }
    // ── Modo texto: URL enviada ──────────────────────────
    else if (text) {
      const urlMatch = text.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        await sendMessage(chatId, `🌐 Acessando a página…`);
        try {
          productData = await extractFromUrl(urlMatch[0]);
        } catch (err) {
          await sendMessage(chatId,
            `⚠️ ${err.message}\n\nMande um *print* da página que eu processo pela imagem!`,
            { parse_mode: 'Markdown' }
          );
          return res.status(200).json({ ok: true });
        }
      } else {
        await sendMessage(chatId,
          `Oi! Me manda:\n• Um *link* do produto, ou\n• Um *print* da página 📸`,
          { parse_mode: 'Markdown' }
        );
        return res.status(200).json({ ok: true });
      }
    }

    if (productData) {
      await sendMessage(chatId, formatProductCard(productData), { parse_mode: 'Markdown' });
    }

  } catch (err) {
    console.error('Bot error:', err);
    await sendMessage(chatId, `❌ Erro inesperado: ${err.message}`);
  }

  return res.status(200).json({ ok: true });
}

// ── Extrai dados via URL (scrape + IA texto) ──────────────

async function extractFromUrl(url) {
  let pageContent = '';
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept-Language': 'ja,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });
    const html = await resp.text();
    // Remove scripts, styles e tags — mantém texto relevante
    pageContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 4000);
  } catch {
    throw new Error('Não consegui acessar essa página (site pode bloquear bots).');
  }

  return extractWithAI([{
    role: 'user',
    content:
      `Você é um assistente de e-commerce japonês. Extraia os dados do produto abaixo.\n` +
      `Retorne SOMENTE um JSON válido com os campos:\n` +
      `nome (string), preco_jpy (número inteiro), peso_gramas (estimativa numérica),\n` +
      `categoria (string), subcategoria (string), descricao (string, máx 100 chars),\n` +
      `url_origem (string).\n\n` +
      `Conteúdo da página:\n${pageContent}`,
  }]);
}

// ── Extrai dados via imagem (vision) ─────────────────────

async function extractFromImage(fileId, extraText) {
  // Obtém URL do arquivo via Telegram
  const fileResp = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
  );
  const fileData = await fileResp.json();
  const fileUrl  = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;

  return extractWithAI([{
    role: 'user',
    content: [
      {
        type: 'text',
        text:
          `Você é um assistente de e-commerce japonês. Analise a imagem e extraia os dados do produto.\n` +
          `Retorne SOMENTE um JSON válido com:\n` +
          `nome, preco_jpy (número), peso_gramas (estimativa), categoria, subcategoria,\n` +
          `descricao (máx 100 chars).\n` +
          (extraText ? `\nContexto adicional do usuário: ${extraText}` : ''),
      },
      {
        type: 'image_url',
        image_url: { url: fileUrl },
      },
    ],
  }]);
}

// ── Chama OpenRouter ──────────────────────────────────────

async function extractWithAI(messages) {
  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type':  'application/json',
      'HTTP-Referer':  'https://japaoexpress.vercel.app',
      'X-Title':       'Japao Express Bot',
    },
    body: JSON.stringify({
      model:           'meta-llama/llama-3.2-11b-vision-instruct',
      messages,
      max_tokens:      600,
      response_format: { type: 'json_object' },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenRouter: ${resp.status} — ${err.slice(0, 200)}`);
  }

  const data    = await resp.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('IA não retornou dados');

  try {
    return JSON.parse(content);
  } catch {
    // Tenta extrair JSON de dentro da resposta caso venha com texto extra
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Resposta da IA não é JSON válido');
  }
}

// ── Formata card do produto para Telegram ────────────────

function formatProductCard(p) {
  const nome      = p.nome      || p.name        || 'Produto';
  const precoJPY  = p.preco_jpy || p.priceJPY    || null;
  const peso      = p.peso_gramas                || null;
  const categoria = [p.categoria, p.subcategoria].filter(Boolean).join(' › ') || '—';
  const descricao = p.descricao || p.description || '';
  const url       = p.url_origem                 || '';

  // Estimativa BRL (câmbio aproximado 22 JPY = 1 BRL + 20% margem)
  const brlEstimado = precoJPY
    ? 'R$ ' + (precoJPY / 22 * 1.2).toFixed(2).replace('.', ',')
    : null;

  const linhas = [
    `📦 *${nome}*`,
    ``,
    precoJPY  ? `💴 Preço original: *¥${Number(precoJPY).toLocaleString('ja-JP')}*` : null,
    brlEstimado ? `🇧🇷 Sugestão BRL (+20%): *${brlEstimado}*` : null,
    peso      ? `⚖️ Peso estimado: *${peso}g*` : null,
    `🏷️ Categoria: ${categoria}`,
    descricao ? `📝 ${descricao}` : null,
    url       ? `\n🔗 ${url}` : null,
    ``,
    `_Dados extraídos automaticamente — verifique antes de publicar._`,
  ];

  return linhas.filter(l => l !== null).join('\n');
}

// ── Envia mensagem pelo Telegram ──────────────────────────

async function sendMessage(chatId, text, extra = {}) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
  });
}
