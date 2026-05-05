import puppeteer from 'puppeteer';
import { mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Inter:wght@300;400;600&display=swap';

const BASE_STYLE = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1080px; height: 1080px; overflow: hidden; font-family: 'Inter', sans-serif; color: #fff; }
  .slide {
    width: 1080px; height: 1080px;
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 88px 90px;
    position: relative;
  }
  .bg {
    position: absolute; inset: 0;
    background-size: cover; background-position: center; background-repeat: no-repeat;
  }
  .bg-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(160deg, rgba(5,1,8,0.82) 0%, rgba(30,6,32,0.78) 50%, rgba(8,1,12,0.85) 100%);
  }
  .bg-dark {
    position: absolute; inset: 0;
    background: linear-gradient(155deg, #08020a 0%, #2b0a2e 50%, #100315 100%);
  }
  .content { position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: space-between; height: 100%; }
  .tag { font-size: 19px; font-weight: 600; color: #C9A227; letter-spacing: 0.28em; text-transform: uppercase; }
  .accent { width: 54px; height: 2px; background: #C9A227; margin: 28px 0; }
  .headline { font-family: 'Playfair Display', serif; font-size: 76px; font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; }
  .branding { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 0.18em; text-transform: uppercase; }
  .handle { font-size: 20px; color: rgba(255,255,255,0.5); letter-spacing: 0.04em; }
  .badge { display: inline-block; background: rgba(74,21,75,0.55); border: 1px solid rgba(74,21,75,0.9); border-radius: 4px; padding: 9px 22px; font-size: 18px; color: rgba(255,255,255,0.78); letter-spacing: 0.12em; text-transform: uppercase; }
  .slide-label { font-size: 13px; letter-spacing: 0.32em; text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 8px; }
  .news-title { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 700; color: #C9A227; margin-bottom: 28px; line-height: 1.2; }
  .subtitle { font-family: 'Playfair Display', serif; font-size: 34px; color: #C9A227; margin-bottom: 28px; line-height: 1.2; }
  .body-text { font-size: 30px; font-weight: 300; line-height: 1.72; color: rgba(255,255,255,0.88); }
  .quote { font-family: 'Playfair Display', serif; font-size: 44px; font-style: italic; font-weight: 400; line-height: 1.38; color: rgba(255,255,255,0.94); }
  .quote-source { margin-top: 24px; font-size: 19px; color: #C9A227; letter-spacing: 0.08em; }
  .cta-text { font-size: 21px; color: rgba(255,255,255,0.55); letter-spacing: 0.04em; margin-top: 12px; }
`;

function toDataUri(filePath) {
  if (!filePath || !existsSync(filePath)) return null;
  const data = readFileSync(filePath).toString('base64');
  const ext = filePath.split('.').pop().toLowerCase();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${data}`;
}

function background(imagePath) {
  const uri = toDataUri(imagePath);
  if (uri) {
    return `<div class="bg" style="background-image:url('${uri}')"></div><div class="bg-overlay"></div>`;
  }
  return `<div class="bg-dark"></div>`;
}

function html(bodyContent) {
  return `<!DOCTYPE html><html><head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${FONTS_URL}" rel="stylesheet">
    <style>${BASE_STYLE}</style>
  </head><body><div class="slide">${bodyContent}</div></body></html>`;
}

function renderSlide(slide, images) {
  if (slide.type === 'cover') {
    return html(`
      ${background(images.cover)}
      <div class="content">
        <div><span class="tag">${slide.category}</span></div>
        <div>
          <div class="accent"></div>
          <div class="headline">${slide.headline}</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end">
          <div class="branding">SERVIAM</div>
          <div class="badge">@serviam.ag</div>
        </div>
      </div>`);
  }

  if (slide.type === 'news') {
    return html(`
      ${background(null)}
      <div class="content">
        <div><div class="slide-label">${slide.label}</div></div>
        <div>
          <div class="news-title">${slide.title}</div>
          <div class="body-text">${slide.text}</div>
        </div>
        <div class="branding" style="opacity:0.22">SERVIAM.AG</div>
      </div>`);
  }

  if (slide.type === 'insight') {
    return html(`
      ${background(images.baroque1)}
      <div class="content">
        <div><div class="slide-label">${slide.label}</div></div>
        <div>
          <div class="subtitle">${slide.subtitle}</div>
          <div class="body-text">${slide.text}</div>
        </div>
        <div class="branding" style="opacity:0.22">SERVIAM.AG</div>
      </div>`);
  }

  if (slide.type === 'catholic') {
    return html(`
      ${background(null)}
      <div class="content">
        <div>
          <div class="slide-label">${slide.label}</div>
          <div class="accent"></div>
        </div>
        <div>
          <div class="subtitle">${slide.subtitle}</div>
          <div class="body-text">${slide.text}</div>
        </div>
        <div class="branding" style="opacity:0.22">SERVIAM.AG</div>
      </div>`);
  }

  if (slide.type === 'reflection') {
    return html(`
      ${background(images.baroque2)}
      <div class="content">
        <div><span class="tag">${slide.label}</span></div>
        <div>
          <div class="accent"></div>
          <div class="quote">"${slide.quote}"</div>
          ${slide.source ? `<div class="quote-source">${slide.source}</div>` : ''}
          ${slide.cta ? `<div class="cta-text">${slide.cta}</div>` : ''}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end">
          <div class="branding">SERVIAM</div>
          <div class="handle">@serviam.ag ✦</div>
        </div>
      </div>`);
  }

  throw new Error(`Tipo de slide desconhecido: ${slide.type}`);
}

export async function createImages(slides, images) {
  const outputDir = '/tmp/serviam-slides';
  mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const paths = [];

  for (let i = 0; i < slides.length; i++) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
    await page.setContent(renderSlide(slides[i], images), { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);

    const outputPath = join(outputDir, `slide_${i + 1}.png`);
    await page.screenshot({ path: outputPath, type: 'png' });
    await page.close();

    console.log(`  Slide ${i + 1} (${slides[i].type}) gerado`);
    paths.push(outputPath);
  }

  await browser.close();
  return paths;
}
