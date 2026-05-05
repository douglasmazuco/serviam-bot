import Anthropic from '@anthropic-ai/sdk';

export async function generateContent(news) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Você é o agente de conteúdo da Serviam, uma agência de marketing digital especializada em negócios e marcas católicas.

Notícia do dia:
Título: ${news.title}
Resumo: ${news.description || ''}
Fonte: ${news.source?.name || ''}

Crie um carrossel para o Instagram da @serviam.ag com 3 slides. O conteúdo deve:
- Conectar a notícia ao universo católico e ao empreendedorismo com propósito
- Ser prático e inspirador para empreendedores católicos
- Ter tom profissional, acolhedor e levemente poético

Retorne SOMENTE JSON válido, sem markdown, sem explicações, com esta estrutura exata:
{
  "slides": [
    {
      "type": "cover",
      "category": "CATEGORIA EM MAIÚSCULAS (ex: MARKETING DIGITAL, INTELIGÊNCIA ARTIFICIAL, NEGÓCIOS)",
      "headline": "título impactante de até 7 palavras"
    },
    {
      "type": "content",
      "slideLabel": "INSIGHTS",
      "subtitle": "subtítulo do insight em até 5 palavras",
      "text": "insight em 2 a 3 frases curtas conectando a notícia ao universo católico e de negócios"
    },
    {
      "type": "reflection",
      "quote": "reflexão ou princípio em 1 a 2 frases, pode citar um santo, um provérbio ou um princípio com fé",
      "source": "fonte da citação ou null"
    }
  ],
  "caption": "legenda do post: gancho de 1 frase, 2 frases de desenvolvimento, CTA para seguir. Total até 280 caracteres.",
  "hashtags": "#serviam #marketingcatolico #negocioscatolicos #empreendedorismocatolico #marketingdigital #fe #negocios #proposito #agencia #católico"
}`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Claude não retornou JSON válido:\n${text}`);

  return JSON.parse(jsonMatch[0]);
}
