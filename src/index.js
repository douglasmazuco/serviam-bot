import { fetchNews } from './fetch-news.js';
import { generateContent } from './generate-content.js';
import { fetchImages } from './fetch-images.js';
import { createImages } from './create-images.js';
import { uploadImages } from './upload-images.js';
import { postCarousel } from './post-instagram.js';

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log('=== Agente Serviam — Postagem Diária ===');
  console.log(`Modo: ${DRY_RUN ? 'DRY RUN' : 'PRODUÇÃO'}`);
  console.log(`Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n`);

  console.log('[1/6] Buscando notícias do dia...');
  const articles = await fetchNews();
  console.log(`  ${articles.length} artigos encontrados\n`);

  console.log('[2/6] Selecionando melhor notícia e gerando conteúdo com Claude...');
  const content = await generateContent(articles);
  console.log(`  Notícia escolhida: ${content.selectedArticle.title}`);
  console.log(`  Slides: ${content.slides.length}`);
  console.log(`  Caption: ${content.caption}\n`);

  console.log('[3/6] Baixando imagens de fundo...');
  const images = await fetchImages(content.selectedArticle);
  console.log(`  Cover: ${images.cover ? 'OK' : 'fallback gradient'}`);
  console.log(`  Barroco 1: ${images.baroque1 ? 'OK' : 'fallback gradient'}`);
  console.log(`  Barroco 2: ${images.baroque2 ? 'OK' : 'fallback gradient'}\n`);

  console.log('[4/6] Criando imagens dos slides...');
  const imagePaths = await createImages(content.slides, images);
  console.log(`  ${imagePaths.length} slides gerados\n`);

  if (DRY_RUN) {
    console.log('DRY RUN concluído. Imagens salvas em:');
    imagePaths.forEach(p => console.log(`  ${p}`));
    return;
  }

  console.log('[5/6] Fazendo upload das imagens...');
  const imageUrls = await uploadImages(imagePaths);
  console.log(`  ${imageUrls.length} imagens enviadas\n`);

  console.log('[6/6] Postando no Instagram...');
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
