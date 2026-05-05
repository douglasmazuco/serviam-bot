import Anthropic from '@anthropic-ai/sdk';

export async function generateContent(articles) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const articleList = articles.slice(0, 12).map((a, i) =>
    `[${i}] ${a.source?.name || 'Fonte'} — ${a.title}\n    ${a.description || ''}`
  ).join('\n\n');

  const prompt = `Você é o estrategista de conteúdo da Serviam, agência de marketing para empresários católicos.

NOTÍCIAS DE HOJE:
${articleList}

PASSO 1 — Escolha o índice da notícia com maior potencial viral para empresários católicos. Considere: relevância para negócios, atualidade, polêmica positiva, potencial de reflexão cristã.

PASSO 2 — Crie 5 slides de carrossel para @serviam.ag. REGRAS IMPORTANTES:
• Slide 1: use EXATAMENTE a manchete ou uma versão impactante dela
• Slide 2: fale SOBRE A NOTÍCIA ESPECÍFICA — cite o veículo, o fato, os números se houver. O leitor tem que entender do que se trata
• Slide 3: analise o impacto dessa notícia ESPECÍFICA para empreendedores
• Slide 4: faça a ponte DESSE fato com a fé católica, doutrina social da Igreja, ou um santo
• Slide 5: reflexão poderosa + CTA

Retorne SOMENTE JSON válido, sem markdown:
{
  "selectedArticleIndex": 0,
  "slides": [
    {
      "type": "cover",
      "category": "CATEGORIA EM MAIÚSCULAS (ex: INTELIGÊNCIA ARTIFICIAL, MARKETING, NEGÓCIOS)",
      "headline": "manchete da notícia adaptada — impactante, até 8 palavras"
    },
    {
      "type": "news",
      "label": "A NOTÍCIA",
      "title": "título direto do assunto em até 6 palavras",
      "text": "explique a notícia em 3 frases: o que aconteceu, quem disse/fez, qual o dado ou fato concreto. Cite o veículo/empresa envolvida."
    },
    {
      "type": "insight",
      "label": "O QUE ISSO SIGNIFICA",
      "subtitle": "impacto direto para quem empreende — até 5 palavras",
      "text": "3 frases sobre o que esse fato concreto muda ou representa para quem tem um negócio. Seja específico à notícia."
    },
    {
      "type": "catholic",
      "label": "PERSPECTIVA CATÓLICA",
      "subtitle": "como a fé ilumina esse cenário — até 5 palavras",
      "text": "3 frases conectando esse fato específico à visão católica de negócios, doutrina social, ou ensinamento de um santo ou papa."
    },
    {
      "type": "reflection",
      "label": "REFLEXÃO",
      "quote": "frase poderosa — pode ser bíblica, de um santo, ou um princípio cristão. 1 a 2 frases.",
      "source": "fonte da citação ou null",
      "cta": "chamada de ação curta (ex: 'Salve e compartilhe.' ou 'Marque um amigo empreendedor.')"
    }
  ],
  "caption": "legenda do post com a notícia no gancho: cite o fato real, faça a ponte católica, convide a seguir. Máximo 250 caracteres.",
  "hashtags": "#serviam #marketingcatolico #negocioscatolicos #empreendedorismocatolico #marketingdigital #fe #negocios #proposito #católico #agenciacatolica"
}`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Claude não retornou JSON válido:\n${text}`);

  const result = JSON.parse(jsonMatch[0]);
  result.selectedArticle = articles[result.selectedArticleIndex] || articles[0];
  return result;
}
