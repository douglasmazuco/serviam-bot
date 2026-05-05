import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Curated baroque/Catholic paintings — public domain, Wikimedia Commons
const BAROQUE_IMAGES = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Caravaggio_-_The_Calling_of_Saint_Matthew.jpg/1280px-Caravaggio_-_The_Calling_of_Saint_Matthew.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Caravaggio_-_The_Supper_at_Emmaus.jpg/1280px-Caravaggio_-_The_Supper_at_Emmaus.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Caravaggio_-_The_Incredulity_of_Saint_Thomas.jpg/1280px-Caravaggio_-_The_Incredulity_of_Saint_Thomas.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Caravaggio_-_Judith_Beheading_Holofernes_-_WGA04097.jpg/1280px-Caravaggio_-_Judith_Beheading_Holofernes_-_WGA04097.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Caravaggio_-_The_Conversion_on_the_Way_to_Damascus.jpg/800px-Caravaggio_-_The_Conversion_on_the_Way_to_Damascus.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Rembrandt_Harmensz._van_Rijn_-_Return_of_the_Prodigal_Son_-_Google_Art_Project.jpg/1024px-Rembrandt_Harmensz._van_Rijn_-_Return_of_the_Prodigal_Son_-_Google_Art_Project.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Guido_Reni_-_St_Michael_Defeating_Satan.jpg/800px-Guido_Reni_-_St_Michael_Defeating_Satan.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Transfiguration_Raphael.jpg/800px-Transfiguration_Raphael.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Cristo_crucificado.jpg/676px-Cristo_crucificado.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1280px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Peter_Paul_Rubens_-_Descent_from_the_Cross_-_WGA20212.jpg/800px-Peter_Paul_Rubens_-_Descent_from_the_Cross_-_WGA20212.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Annunciation_El_Greco.jpg/783px-Annunciation_El_Greco.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Rembrandt_-_Simeon_in_the_Temple_-_WGA19046.jpg/791px-Rembrandt_-_Simeon_in_the_Temple_-_WGA19046.jpg',
];

function pickRandom(arr, count, exclude = []) {
  const pool = arr.filter((_, i) => !exclude.includes(i));
  const picks = [];
  const used = [];
  while (picks.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picks;
}

async function downloadImage(url, destPath) {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: { 'User-Agent': 'Serviam-Bot/1.0 (https://serviam.ag)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    writeFileSync(destPath, Buffer.from(buffer));
    return destPath;
  } catch (e) {
    console.warn(`  Aviso: falha ao baixar imagem (${url}): ${e.message}`);
    return null;
  }
}

export async function fetchImages(newsArticle) {
  const dir = '/tmp/serviam-slides';
  mkdirSync(dir, { recursive: true });

  // Image 1: news article image (cover background)
  let coverImagePath = null;
  if (newsArticle.urlToImage) {
    console.log('  Baixando imagem da notícia...');
    coverImagePath = await downloadImage(newsArticle.urlToImage, join(dir, 'bg_cover.jpg'));
  }

  // Images 2 & 3: two different baroque paintings
  const [url1, url2] = pickRandom(BAROQUE_IMAGES, 2);
  console.log('  Baixando pinturas barrocas...');
  const baroque1 = await downloadImage(url1, join(dir, 'bg_baroque1.jpg'));
  const baroque2 = await downloadImage(url2, join(dir, 'bg_baroque2.jpg'));

  return {
    cover: coverImagePath,   // slide 1 (news image)
    baroque1: baroque1,      // slide 3 (insight)
    baroque2: baroque2,      // slide 5 (reflection)
  };
}
