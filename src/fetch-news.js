export async function fetchNews() {
  const apiKey = process.env.NEWSAPI_KEY;

  const queries = [
    { q: 'marketing digital OR inteligência artificial OR empreendedorismo OR negócios', lang: 'pt' },
    { q: 'marketing AI business innovation strategy', lang: 'en' },
  ];

  const articles = [];

  for (const { q, lang } of queries) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=${lang}&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const valid = (data.articles || []).filter(
        a => a.title && a.title !== '[Removed]' && a.description && a.description.length > 40
      );
      articles.push(...valid.slice(0, 10));
    } catch {
      // continue with other queries
    }
  }

  if (articles.length === 0) {
    return [{
      title: 'O poder do marketing com propósito no mundo atual',
      description: 'Marcas que alinham seus valores ao propósito de servir crescem mais que a média do mercado e constroem comunidades fiéis.',
      source: { name: 'Serviam Insights' },
      urlToImage: null,
    }];
  }

  return articles;
}
