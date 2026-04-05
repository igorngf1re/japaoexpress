// ═══════════════════════════════════════════════════════════
// Japão Express — Bot Telegram
// Fluxo:
//   1. Admin manda link → bot extrai dados e mostra card
//   2. Admin responde ao card com /publicar → bot adiciona
//      o produto ao products.js via GitHub API → Vercel redeply
//   3. Admin manda imagem → extração por visão
// ═══════════════════════════════════════════════════════════

const OPENROUTER_KEY  = process.env.OPENROUTER_API_KEY;
const BOT_TOKEN       = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS       = (process.env.TELEGRAM_ADMIN_IDS || '')
  .split(',').map(s => parseInt(s.trim())).filter(Boolean);
const GITHUB_TOKEN    = process.env.GITHUB_TOKEN;
const GITHUB_REPO     = process.env.GITHUB_REPO || 'igorngf1re/japaoexpress';
const GITHUB_BRANCH   = process.env.GITHUB_BRANCH || 'main';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const update  = req.body;
  const message = update.message || update.channel_post;
  if (!message) return res.status(200).json({ ok: true });

  const chatId = message.chat.id;
  const userId = message.from?.id;
  const text   = (message.text || message.caption || '').trim();
  const photos = message.photo;

  if (ADMIN_IDS.length > 0 && !ADMIN_IDS.includes(userId)) {
    return res.status(200).json({ ok: true });
  }

  try {
    // ── /start ────────────────────────────────────────────
    if (text === '/start' || text === '/ajuda') {
      await sendMessage(chatId,
        `👋 *Japão Express Bot*\n\n` +
        `*Como usar:*\n` +
        `• Mande um *link* de produto (Amazon JP, Rakuten, etc.)\n` +
        `• Ou mande um *print* da página do produto\n\n` +
        `*Para publicar no site:*\n` +
        `• Após ver o card extraído, *responda* à mensagem com /publicar\n` +
        `• O produto será adicionado ao catálogo automaticamente\n\n` +
        `*Comandos:*\n` +
        `/publicar — publica o produto (responder ao card)\n` +
        `/ajuda — mostra esta mensagem`,
        { parse_mode: 'Markdown' }
      );
      return res.status(200).json({ ok: true });
    }

    // ── /publicar (resposta ao card) ──────────────────────
    if (text === '/publicar' || text.startsWith('/publicar')) {
      await handlePublish(chatId, message);
      return res.status(200).json({ ok: true });
    }

    // ── Imagem enviada ────────────────────────────────────
    if (photos && photos.length > 0) {
      await sendMessage(chatId, '🔍 Analisando a imagem…');
      const fileId     = photos[photos.length - 1].file_id;
      const productData = await extractFromImage(fileId, text);
      await sendProductCard(chatId, productData);
      return res.status(200).json({ ok: true });
    }

    // ── Link enviado ──────────────────────────────────────
    if (text) {
      const urlMatch = text.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        const waitMsg = await sendMessage(chatId, '🌐 Acessando a página…');
        try {
          const productData = await extractFromUrl(urlMatch[0]);
          await sendProductCard(chatId, productData);
        } catch (err) {
          await sendMessage(chatId,
            `⚠️ ${err.message}\n\nMande um *print* da página que eu processo pela imagem!`,
            { parse_mode: 'Markdown' }
          );
        }
      } else {
        await sendMessage(chatId,
          `Me manda:\n• Um *link* do produto, ou\n• Um *print* da página 📸`,
          { parse_mode: 'Markdown' }
        );
      }
    }

  } catch (err) {
    console.error('Bot error:', err);
    await sendMessage(chatId, `❌ Erro inesperado: ${err.message}`);
  }

  return res.status(200).json({ ok: true });
}

// ── Extrai dados via URL ──────────────────────────────────

async function extractFromUrl(url) {
  let html = '';
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ja,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    });
    html = await resp.text();
  } catch {
    throw new Error('Não consegui acessar essa página (site pode bloquear bots).');
  }

  // ── 1. Tenta JSON-LD (mais confiável para preço) ───────
  const jsonLdMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  let jsonLdData = '';
  for (const m of jsonLdMatches) {
    try {
      const obj = JSON.parse(m[1]);
      const flat = JSON.stringify(obj);
      if (flat.includes('price') || flat.includes('Price') || flat.includes('offers')) {
        jsonLdData += flat.slice(0, 2000) + '\n';
      }
    } catch {}
  }

  // ── 2. Meta tags de preço ──────────────────────────────
  const metaPrice = [
    ...html.matchAll(/<meta[^>]*(?:property|name)=["'](?:product:price:amount|og:price:amount|price)[^>]*content=["']([^"']+)["']/gi),
    ...html.matchAll(/<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:product:price:amount|og:price)[^"']*["']/gi),
  ].map(m => m[1]).join(', ');

  // ── 3. Padrões de preço no texto ───────────────────────
  const pricePatterns = [
    ...html.matchAll(/(?:¥|￥|円|JPY)\s*[\d,]+/g),
    ...html.matchAll(/[\d,]+\s*(?:円|¥|JPY)/g),
    ...html.matchAll(/(?:税込|税抜|本体価格)[^\d]*[\d,]+/g),
    ...html.matchAll(/"price"\s*:\s*"?([\d.]+)"?/g),
    ...html.matchAll(/(?:priceAmount|salesPrice|regularPrice)[^>]*>([\d,¥￥]+)</g),
  ].map(m => m[0]).slice(0, 20).join(' | ');

  // ── 4. Título e texto limpo ────────────────────────────
  const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || '';
  const ogTitle = (html.match(/og:title[^>]*content=["']([^"']+)["']/i) || [])[1] || '';
  const ogImage = (html.match(/og:image[^>]*content=["']([^"']+)["']/i) || [])[1] || '';

  const plainText = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 2000);

  const context = [
    jsonLdData     ? `=== JSON-LD ===\n${jsonLdData}` : '',
    metaPrice      ? `=== Meta Price ===\n${metaPrice}` : '',
    pricePatterns  ? `=== Price Patterns ===\n${pricePatterns}` : '',
    title || ogTitle ? `=== Título ===\n${ogTitle || title}` : '',
    `=== Texto da Página ===\n${plainText}`,
  ].filter(Boolean).join('\n\n').slice(0, 5000);

  const product = await extractWithAI([{
    role: 'user',
    content:
      `Você é um especialista em e-commerce japonês. Extraia os dados do produto abaixo.\n` +
      `IMPORTANTE: Para o preço, priorize os dados de JSON-LD e Meta Price acima do texto geral.\n` +
      `O preço deve ser em YEN (número inteiro, sem símbolo). Ex: se vir "¥1,490" retorne 1490.\n\n` +
      `Retorne SOMENTE JSON válido com estes campos:\n` +
      `- nome: string (nome do produto em português ou japonês)\n` +
      `- preco_jpy: número inteiro (preço em iene japonês)\n` +
      `- peso_gramas: número inteiro (estimativa de peso em gramas)\n` +
      `- categoria: string (Cosméticos | Guloseimas | Colecionáveis)\n` +
      `- subcategoria: string\n` +
      `- descricao: string (máx 100 chars)\n` +
      `- origem: string (nome da loja/site)\n` +
      `- imagem_url: string (URL da imagem og:image se disponível)\n` +
      `- url_origem: string\n\n` +
      `URL: ${url}\n\n${context}`,
  }]);

  // injeta imagem do og:image se AI não pegou
  if (!product.imagem_url && ogImage) product.imagem_url = ogImage;
  if (!product.url_origem) product.url_origem = url;

  return product;
}

// ── Extrai dados via imagem ───────────────────────────────

async function extractFromImage(fileId, extraText) {
  const fileResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
  const fileData = await fileResp.json();
  const fileUrl  = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;

  return extractWithAI([{
    role: 'user',
    content: [
      {
        type: 'text',
        text:
          `Você é um especialista em e-commerce japonês. Analise a imagem e extraia os dados.\n` +
          `O preço deve ser em YEN (número inteiro). Ex: "¥1,490" → 1490.\n` +
          `Retorne SOMENTE JSON válido com:\n` +
          `nome, preco_jpy (inteiro), peso_gramas (estimativa), categoria (Cosméticos|Guloseimas|Colecionáveis),\n` +
          `subcategoria, descricao (máx 100 chars), origem.\n` +
          (extraText ? `\nContexto do usuário: ${extraText}` : ''),
      },
      { type: 'image_url', image_url: { url: fileUrl } },
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
      max_tokens:      800,
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
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Resposta da IA não é JSON válido');
  }
}

// ── Envia card do produto ─────────────────────────────────

async function sendProductCard(chatId, p) {
  const nome      = p.nome      || p.name        || 'Produto';
  const precoJPY  = parseInt(p.preco_jpy || p.priceJPY || 0);
  const peso      = parseInt(p.peso_gramas || 0);
  const categoria = [p.categoria, p.subcategoria].filter(Boolean).join(' › ') || '—';
  const descricao = p.descricao || p.description || '';
  const origem    = p.origem    || p.origin      || '—';
  const url       = p.url_origem || '';
  const imgUrl    = p.imagem_url || '';

  const brl = precoJPY ? 'R$ ' + (precoJPY / 22 * 1.2).toFixed(2).replace('.', ',') : '—';

  // JSON do produto para o /publicar
  const productObj = buildProductObject(p);
  const productJson = JSON.stringify(productObj, null, 2);

  const card = [
    `📦 *${escMd(nome)}*`,
    ``,
    precoJPY ? `💴 Preço: *¥${precoJPY.toLocaleString('ja-JP')}*` : `💴 Preço: *não encontrado*`,
    `🇧🇷 Sugestão BRL \\(\\+20%\\): *${escMd(brl)}*`,
    peso      ? `⚖️ Peso estimado: *${peso}g*` : null,
    `🏷️ Categoria: ${escMd(categoria)}`,
    `🏪 Origem: ${escMd(origem)}`,
    descricao ? `📝 ${escMd(descricao)}` : null,
    url       ? `🔗 ${escMd(url)}` : null,
    ``,
    `─────────────────────`,
    `✅ Para publicar no site, *responda esta mensagem* com:`,
    `\`/publicar\``,
  ].filter(l => l !== null).join('\n');

  // Envia imagem se disponível, senão texto
  if (imgUrl) {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:    chatId,
          photo:      imgUrl,
          caption:    card,
          parse_mode: 'MarkdownV2',
        }),
      });
    } catch {
      // fallback para texto se imagem falhar
      await sendMessage(chatId, card, { parse_mode: 'MarkdownV2' });
    }
  } else {
    await sendMessage(chatId, card, { parse_mode: 'MarkdownV2' });
  }

  // Envia JSON separado para referência do /publicar
  await sendMessage(chatId,
    `📋 *Dados extraídos \\(JSON\\):*\n\`\`\`json\n${escMd(productJson)}\n\`\`\`\n\n_Responda a mensagem acima com /publicar_`,
    { parse_mode: 'MarkdownV2' }
  );
}

// ── Publica produto no GitHub → Vercel redeploy ───────────

async function handlePublish(chatId, message) {
  if (!GITHUB_TOKEN) {
    await sendMessage(chatId, '❌ GITHUB\\_TOKEN não configurado nas env vars da Vercel\\.', { parse_mode: 'MarkdownV2' });
    return;
  }

  // Pega o JSON da mensagem respondida
  const replyText = message.reply_to_message?.text || message.reply_to_message?.caption || '';
  if (!replyText) {
    await sendMessage(chatId, '⚠️ Responda à mensagem do card com /publicar para publicar o produto\\.', { parse_mode: 'MarkdownV2' });
    return;
  }

  // Extrai o JSON do bloco de código
  let productObj = null;

  // Caso o reply seja no JSON message
  const jsonBlock = replyText.match(/```json\n([\s\S]+?)\n```/);
  if (jsonBlock) {
    try { productObj = JSON.parse(jsonBlock[1]); } catch {}
  }

  // Caso o reply seja no card (tenta extrair dados do card)
  if (!productObj) {
    await sendMessage(chatId, '⚠️ Responda diretamente à mensagem com o JSON do produto\\.', { parse_mode: 'MarkdownV2' });
    return;
  }

  await sendMessage(chatId, `⏳ Adicionando *${escMd(productObj.name)}* ao catálogo\\.\\.\\.`, { parse_mode: 'MarkdownV2' });

  try {
    await addProductToGitHub(productObj);
    await sendMessage(chatId,
      `✅ *${escMd(productObj.name)}* publicado com sucesso\\!\n\n` +
      `🚀 A Vercel vai redeployar em \\~1 minuto\\.\n` +
      `🌐 Confira em: japaoexpress\\.vercel\\.app/produtos\\.html`,
      { parse_mode: 'MarkdownV2' }
    );
  } catch (err) {
    await sendMessage(chatId, `❌ Erro ao publicar: ${escMd(err.message)}`, { parse_mode: 'MarkdownV2' });
  }
}

// ── Adiciona produto ao products.js via GitHub API ────────

async function addProductToGitHub(product) {
  const filePath = 'js/products.js';
  const apiBase  = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;

  // 1. Lê arquivo atual
  const getResp = await fetch(`${apiBase}?ref=${GITHUB_BRANCH}`, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept':        'application/vnd.github.v3+json',
    },
  });
  if (!getResp.ok) throw new Error(`GitHub GET: ${getResp.status}`);
  const fileData = await getResp.json();
  const currentContent = atob(fileData.content.replace(/\n/g, ''));
  const sha = fileData.sha;

  // 2. Insere o produto no array
  const productLine = `  ${JSON.stringify(product, null, 2).split('\n').join('\n  ')},`;
  const newContent = currentContent.replace(
    /const PRODUCTS = \[(\s*\/\/[^\n]*)?\n/,
    `const PRODUCTS = [\n${productLine}\n`
  );

  if (newContent === currentContent) {
    throw new Error('Não foi possível inserir o produto no array PRODUCTS.');
  }

  // 3. Commit
  const putResp = await fetch(apiBase, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept':        'application/vnd.github.v3+json',
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      message: `feat: add product "${product.name}" via Telegram bot`,
      content: btoa(unescape(encodeURIComponent(newContent))),
      sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!putResp.ok) {
    const err = await putResp.text();
    throw new Error(`GitHub PUT: ${putResp.status} — ${err.slice(0, 200)}`);
  }
}

// ── Converte dados extraídos para objeto PRODUCTS ─────────

function buildProductObject(p) {
  const nome     = p.nome || p.name || 'Produto';
  const precoJPY = parseInt(p.preco_jpy || p.priceJPY || 0);
  const priceBRL = precoJPY ? parseFloat((precoJPY / 22 * 1.2).toFixed(2)) : 0;

  const catMap = {
    'cosméticos': { cat: 'cosmeticos', cardBg: 'bg-[#D6EAF8]' },
    'cosmeticos': { cat: 'cosmeticos', cardBg: 'bg-[#D6EAF8]' },
    'guloseimas': { cat: 'guloseimas', cardBg: 'bg-[#FFF9C4]' },
    'colecionáveis': { cat: 'colecionaveis', cardBg: 'bg-[#FADBD8]' },
    'colecionaveis': { cat: 'colecionaveis', cardBg: 'bg-[#FADBD8]' },
  };
  const catKey = (p.categoria || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const catInfo = catMap[catKey] || catMap[catKey.replace('cosm','cosm')] || { cat: 'cosmeticos', cardBg: 'bg-[#D6EAF8]' };

  // Gera ID único a partir do nome
  const id = nome.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

  const decos  = ['tape', 'pin'];
  const rotate = ['rotate-[-1deg]', 'rotate-[1deg]', 'rotate-[-2deg]', 'rotate-[2deg]'];

  return {
    id,
    name:        nome,
    category:    p.categoria || 'Cosméticos',
    cat:         catInfo.cat,
    subcategory: p.subcategoria || '',
    priceBRL,
    priceJPY:    precoJPY,
    weight:      parseInt(p.peso_gramas || 200),
    description: (p.descricao || '').slice(0, 100),
    details:     `Comprado em ${p.origem || 'loja japonesa'}. ${(p.descricao || '').slice(0, 80)}`,
    origin:      p.origem || 'Japão',
    image:       p.imagem_url || `https://via.placeholder.com/300x380/E2D4F0/2C1654?text=${encodeURIComponent(nome.slice(0,15))}`,
    badge:       null,
    badgeBg:     '#9B59B6',
    stock:       10,
    rating:      4.5,
    reviews:     0,
    cardBg:      catInfo.cardBg,
    rotate:      rotate[Math.floor(Math.random() * rotate.length)],
    deco:        decos[Math.floor(Math.random() * decos.length)],
  };
}

// ── Helpers ───────────────────────────────────────────────

async function sendMessage(chatId, text, extra = {}) {
  const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
  });
  return resp.json();
}

// Escapa caracteres especiais do MarkdownV2
function escMd(str) {
  return String(str || '').replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}
