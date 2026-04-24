// ═══════════════════════════════════════════════════════════
// Japão Express — AI Product Fill
// Recebe URL de produto → scrapa página → chama IA → retorna
// JSON pronto para preencher o formulário do admin
// ═══════════════════════════════════════════════════════════

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const ADMIN_SECRET   = process.env.ADMIN_SECRET;

// Modelos gratuitos no OpenRouter — em ordem de preferência
// Se o primeiro falhar com 404/429, tenta o próximo
const AI_MODELS = [
  'google/gemini-2.0-flash-thinking-exp-01-21:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-chat-v3-0324:free',
];

const SYSTEM_PROMPT = `Você é um especialista em e-commerce de produtos japoneses importados para o Brasil, trabalhando para a loja "Japão Express".

Sua tarefa: com base no conteúdo da página fornecida (ou no seu conhecimento sobre o produto), preencher um JSON completo e preciso.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRAS DE NOME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Manter nomes originais importantes da marca/linha (Keana, Hada Labo, Senka, Shirojyun, etc.)
- Estrutura preferida: [tipo em português] + [nome original/linha] + [característica] + [tamanho]
- Incluir tamanho/volume quando disponível (ex: 120g, 200ml)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORIAS DISPONÍVEIS (use exatamente uma)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cosméticos | Maquiagem | Cabelos | Fragrâncias | Higiene & Saúde |
Guloseimas | Snacks Salgados | Bebidas | Colecionáveis |
Papelaria | Casa & Decoração | Roupas & Acessórios | Eletrônicos | Outros

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PESO PARA FRETE (produto + embalagem)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fórmulas quando peso real não disponível:
• Líquidos/loções/shampoos: ml × 1,4
• Cremes e produtos densos: g × 1,3
• Sólidos pequenos: g × 1,2
• Eletrônicos/rígidos: peso × 1,1
Arredonde para múltiplos de 10g ou 50g.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMPO descricao_completa — REGRAS CRÍTICAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. DEVE ser uma string HTML CONTÍNUA — absolutamente NENHUM \\n ou quebra de linha entre as tags
2. Use APENAS ícones Font Awesome 6 (fa-solid), NUNCA emojis
3. Inclua SEMPRE as seções 1 a 5:

Ícones por seção:
• Benefícios:          <i class="fa-solid fa-wand-magic-sparkles"></i>
• Ingredientes:        <i class="fa-solid fa-flask-vial"></i>
• Modo de uso:         <i class="fa-solid fa-hand-sparkles"></i>
• Por que escolher:    <i class="fa-solid fa-shield-check"></i>
• Aviso (opcional):    <i class="fa-solid fa-triangle-exclamation"></i>
• Conteúdo embalagem:  <i class="fa-solid fa-box-open"></i>

Estrutura HTML (contínua, sem \\n):
<p>[Abertura: 2-3 linhas apresentando produto, marca e diferencial japonês]</p><p><strong><i class="fa-solid fa-wand-magic-sparkles"></i> Benefícios principais:</strong></p><ul><li>[benefício 1]</li><li>[4-6 benefícios reais]</li></ul><p><strong><i class="fa-solid fa-flask-vial"></i> Ingredientes ou Composição:</strong></p><ul><li>[ingrediente]: [função]</li></ul><p><strong><i class="fa-solid fa-hand-sparkles"></i> Modo de uso:</strong></p><p>[instruções claras]</p><p><strong><i class="fa-solid fa-shield-check"></i> Por que escolher este produto?</strong></p><p>[reputação da marca, qualidade japonesa]</p><p><strong><i class="fa-solid fa-box-open"></i> Conteúdo da embalagem:</strong></p><ul><li>[itens]</li></ul>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE SAÍDA — retorne APENAS o JSON, sem texto antes ou depois
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "nome": "Nome completo do produto",
  "categoria": "Cosméticos",
  "subcategoria": "Limpeza Facial",
  "marca": "Nome da Marca",
  "preco_jpy": 1490,
  "peso_gramas": 140,
  "descricao_curta": "Descrição curta de até 100 caracteres para aparecer na listagem",
  "descricao_completa": "<p>HTML contínuo sem \\n...</p>",
  "origem": "Japão",
  "unidades_por_pacote": 1
}`;

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

  // ── Auth ──────────────────────────────────────────────────
  const auth  = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!ADMIN_SECRET) return res.status(503).json({ ok: false, error: 'ADMIN_SECRET não configurado.' });
  if (token !== ADMIN_SECRET) return res.status(401).json({ ok: false, error: 'Chave admin incorreta.' });

  if (!OPENROUTER_KEY) return res.status(503).json({ ok: false, error: 'OPENROUTER_API_KEY não configurado.' });

  const { url } = req.body || {};
  if (!url || !url.startsWith('http')) return res.status(400).json({ ok: false, error: 'URL inválida.' });

  try {
    // ── 1. Scrapa a página ────────────────────────────────
    const context = await scrapePage(url);

    // ── 2. Chama a IA (com fallback entre modelos) ────────
    const userMessage =
      `URL do produto: ${url}\n\n` +
      `=== Conteúdo extraído da página ===\n${context}\n\n` +
      `Pesquise informações adicionais sobre este produto se necessário e preencha o JSON completo.`;

    let rawText = '';
    let lastError = '';
    for (const model of AI_MODELS) {
      const aiResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type':  'application/json',
          'HTTP-Referer':  'https://japaoexpress.shop',
          'X-Title':       'Japao Express Admin',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: userMessage },
          ],
          temperature: 0.3,
          max_tokens:  2500,
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        lastError = `${model} → ${aiResp.status}: ${errText.slice(0, 120)}`;
        console.warn('[ai-product] model failed, trying next:', lastError);
        continue; // tenta próximo modelo
      }

      const aiData = await aiResp.json();
      rawText = aiData.choices?.[0]?.message?.content || '';
      if (rawText) break; // sucesso, para o loop
      lastError = `${model} → resposta vazia`;
    }

    if (!rawText) throw new Error(`Todos os modelos falharam. Último erro: ${lastError}`);

    // ── 3. Extrai e valida JSON da resposta ───────────────
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('IA não retornou JSON válido. Tente novamente.');

    let product;
    try {
      product = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('JSON da IA inválido. Tente novamente.');
    }

    // Sanitiza descricao_completa: garante que não há \n literais (char 10) entre tags
    if (product.descricao_completa) {
      product.descricao_completa = product.descricao_completa
        .replace(/\n/g, '')   // remove quebras de linha reais
        .replace(/\\n/g, ''); // remove \n literais escapados
    }

    // Garante campos numéricos
    product.preco_jpy          = parseInt(product.preco_jpy)          || 0;
    product.peso_gramas        = parseInt(product.peso_gramas)        || 200;
    product.unidades_por_pacote = parseInt(product.unidades_por_pacote) || 1;

    return res.status(200).json({ ok: true, product });

  } catch (err) {
    console.error('[ai-product]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// ── Scraping da página ────────────────────────────────────
// Reutiliza a mesma lógica do bot Telegram, extraindo
// JSON-LD, meta tags, padrões de preço e texto limpo.

async function scrapePage(url) {
  let html = '';
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ja,en;q=0.9',
        'Accept':          'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    });
    html = await resp.text();
  } catch {
    return '(Página inacessível — usando conhecimento de treinamento sobre o produto)';
  }

  // __NEXT_DATA__ (Rakuten, lojas Next.js)
  let nextData = '';
  const ndMatch = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (ndMatch) {
    try {
      const priceFields = [...ndMatch[1].matchAll(
        /"(?:price|salesPrice|standardPrice|itemPrice|listPrice|regularPrice|taxIncludedPrice)["\s]*[:\s]+"?([\d,]+)"?/gi
      )];
      if (priceFields.length) nextData = priceFields.slice(0, 8).map(m => m[0]).join(', ');
    } catch {}
  }

  // JSON-LD
  const jsonLdMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  let jsonLd = '';
  for (const m of jsonLdMatches) {
    try {
      const flat = JSON.stringify(JSON.parse(m[1]));
      if (flat.includes('price') || flat.includes('Price')) jsonLd += flat.slice(0, 1500) + '\n';
    } catch {}
  }

  // Padrões de preço no HTML
  const pricePatterns = [
    ...html.matchAll(/(?:¥|￥|円|JPY)\s*[\d,]+/g),
    ...html.matchAll(/[\d,]+\s*(?:円|¥|JPY)/g),
    ...html.matchAll(/"price"\s*:\s*"?([\d.]+)"?/g),
  ].map(m => m[0]).slice(0, 15).join(' | ');

  // Título e og tags
  const title   = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || '';
  const ogTitle = (html.match(/og:title[^>]*content=["']([^"']+)["']/i) || [])[1] || '';
  const ogDesc  = (html.match(/og:description[^>]*content=["']([^"']+)["']/i) || [])[1] || '';

  // Texto limpo
  const plainText = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 3500);

  return [
    nextData      ? `=== Preços (__NEXT_DATA__) ===\n${nextData}` : '',
    jsonLd        ? `=== JSON-LD ===\n${jsonLd.slice(0, 1500)}` : '',
    pricePatterns ? `=== Padrões de Preço ===\n${pricePatterns}` : '',
    ogDesc        ? `=== og:description ===\n${ogDesc}` : '',
    title || ogTitle ? `=== Título ===\n${ogTitle || title}` : '',
    `=== Texto da Página ===\n${plainText}`,
  ].filter(Boolean).join('\n\n').slice(0, 6000);
}
