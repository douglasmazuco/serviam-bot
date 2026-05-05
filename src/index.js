import { fetchNews } from './fetch-news.js';
import { generateContent } from './generate-content.js';
import { createImages } from './create-images.js';
import { uploadImages } from './upload-images.js';
import { postCarousel } from './post-instagram.js';

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log('=== Agente Serviam — Postagem Diária ===');
  console.log(`Modo: ${DRY_RUN ? 'DRY RUN' : 'PRODUÇÃO'}`);
  console.log(`Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n`);

  console.log('[1/5] Buscando notícia do dia...');
  const news = await fetchNews();
  console.log(`  Notícia: ${news.title}`);
  console.log(`  Fonte: ${news.source?.name || 'desconhecida'}\n`);

  console.log('[2/5] Gerando conteúdo com Claude...');
  const content = await generateContent(news);
  console.log(`  Slides: ${content.slides.length}`);
  console.log(`  Caption: ${content.caption}\n`);

  console.log('[3/5] Criando imagens dos slides...');
  const imagePaths = await createImages(content.slides);
  console.log(`  ${imagePaths.length} imagens geradas\n`);

  if (DRY_RUN) {
    console.log('DRY RUN concluído. Imagens salvas em:');
    imagePaths.forEach(p => console.log(`  ${p}`));
    return;
  }

  console.log('[4/5] Fazendo upload das imagens...');
  const imageUrls = await uploadImages(imagePaths);
  console.log(`  ${imageUrls.length} imagens enviadas\n`);

  console.log('[5/5] Postando no Instagram...');
  const caption = `${content.caption}\n\n${content.hashtags}`;
  const postId = await postCarousel(imageUrls, caption);

  console.log(`\nPost publicado com sucesso!`);
  console.log(`ID: ${postId}`);
  console.log(`Conta: @serviam.ag`);
}

main().catch(err => {
  console.error('\nErro fatal:', err.message);
  process.exit(1);
});
