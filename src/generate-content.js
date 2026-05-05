import Anthropic from '@anthropic-ai/sdk';

export async function generateContent(articles) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const articleList = articles.slice(0, 12).map((a, i) =>
    `${i + 1}. [${a.source?.name || 'Fonte'}] ${a.title}\n   ${a.description || ''}`
  ).join('\n\n');

  const prompt = `Você é o estrategista de conteúdo da Serviam, uma agência de marketing digital especializada em empresários e marcas católicas.

NOTÍCIAS DISPONÍVEIS HOJE:
${articleList}

Sua tarefa:
1. Escolher a notícia com MAIOR potencial de engajamento para empresários católicos (critérios: relevância para negócios, atualidade, potencial viral, possibilidade de ponte com valores católicos).
2. Criar um carrossel de 5 slides para @serviam.ag que transfira a notícia e a conecte profundamente ao universo do empreendedor católico.

ESTRUTURA DOS 5 SLIDES:
- Slide 1 (cover): manchete impactante, categoria, provoca curiosidade
- Slide 2 (notícia): transcrição/resumo da notícia de forma clara e direta
- Slide 3 (insight): o que isso significa para negócios e empreendedores
- Slide 4 (perspectiva católica): ponte com fé, propósito, doutrina social da Igreja, santos empreendedores, etc.
- Slide 5 (reflexão + CTA): frase poderosa + chamada para seguir e se engajar

Retorne SOMENTE JSON válido, sem markdown, sem texto fora do JSON:
{
  "selectedArticleIndex": 0,
  "slides": [
    {
      "type": "cover",
      "category": "CATEGORIA EM MAIÚSCULAS",
      "headline": "manchete impactante em até 8 palavras"
    },
    {
      "type": "news",
      "label": "A NOTÍCIA",
      "title": "título da notícia em até 6 palavras",
      "text": "resumo claro da notícia em 3 frases curtas, como se estivesse explicando para um amigo"
    },
    {
      "type": "insight",
      "label": "O QUE ISSO SIGNIFICA",
      "subtitle": "subtítulo do insight em até 5 palavras",
      "text": "o que esse fato significa para empreendedores, em 3 frases diretas e práticas"
    },
    {
      "type": "catholic",
      "label": "PERSPECTIVA CATÓLICA",
      "subtitle": "subtítulo conectando ao catolicismo em até 5 palavras",
      "text": "como um empresário católico deve olhar para isso: valores, missão, propósito, doutrina. 3 frases."
    },
    {
      "type": "reflection",
      "label": "REFLEXÃO",
      "quote": "frase poderosa ou citação (pode ser de um santo, da Bíblia, ou princípio cristão) em 1 a 2 frases",
      "source": "fonte da citação ou null",
      "cta": "chamada de ação curta e direta (ex: 'Salve para relembrar.' ou 'Compartilhe com um amigo empreendedor.')"
    }
  ],
  "caption": "legenda do post: frase de gancho, 2 frases de desenvolvimento, CTA. Máximo 250 caracteres.",
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
