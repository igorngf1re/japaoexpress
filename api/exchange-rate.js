// ═══════════════════════════════════════════════════════════
// Japão Express — API: Taxa de câmbio BRL → JPY
// Proxy para frankfurter.app com cache de 1h
// ═══════════════════════════════════════════════════════════

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=BRL&to=JPY,USD', {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) throw new Error('Upstream error');

    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    return res.status(200).json({
      rates: data.rates,
      base:  data.base,
      date:  data.date,
    });
  } catch {
    // Fallback: média histórica aproximada
    return res.status(200).json({
      rates: { JPY: 22, USD: 0.18 },
      base:  'BRL',
      date:  new Date().toISOString().split('T')[0],
      fallback: true,
    });
  }
}
