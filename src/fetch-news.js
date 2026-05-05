export async function fetchNews() {
  const apiKey = process.env.NEWSAPI_KEY;

  const queries = [
    { q: 'marketing digital OR inteligência artificial OR empreendedorismo', lang: 'pt' },
    { q: 'marketing AI business strategy', lang: 'en' },
  ];

  for (const { q, lang } of queries) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=${lang}&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.articles?.length > 0) {
      const valid = data.articles.filter(a => a.title && a.title !== '[Removed]' && a.description);
      if (valid.length > 0) {
        const idx = Math.floor(Math.random() * Math.min(5, valid.length));
        return valid[idx];
      }
    }
  }

  return {
    title: 'O poder do marketing com propósito no mundo atual',
    description: 'Marcas que alinham seus valores ao propósito de servir crescem mais que a média do mercado e constroem comunidades fiéis.',
    source: { name: 'Serviam Insights' },
  };
}
