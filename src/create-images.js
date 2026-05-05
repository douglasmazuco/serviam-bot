import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { join } from 'path';

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Inter:wght@300;400;600&display=swap';

const BASE_STYLE = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 1080px; height: 1080px; overflow: hidden;
    background: linear-gradient(155deg, #08020a 0%, #2b0a2e 50%, #100315 100%);
    font-family: 'Inter', sans-serif; color: #fff;
  }
  .slide {
    width: 1080px; height: 1080px;
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 88px 90px;
    position: relative;
  }
  .tag {
    font-size: 19px; font-weight: 600; color: #C9A227;
    letter-spacing: 0.28em; text-transform: uppercase;
  }
  .accent { width: 54px; height: 2px; background: #C9A227; margin: 30px 0; }
  .headline {
    font-family: 'Playfair Display', serif;
    font-size: 82px; font-weight: 900;
    line-height: 1.04; color: #fff;
    letter-spacing: -0.02em;
  }
  .branding {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 700;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.18em; text-transform: uppercase;
  }
  .handle { font-size: 21px; color: rgba(255,255,255,0.45); letter-spacing: 0.04em; }
  .purple-badge {
    display: inline-block;
    background: rgba(74,21,75,0.5);
    border: 1px solid rgba(74,21,75,0.85);
    border-radius: 4px;
    padding: 9px 22px;
    font-size: 19px; color: rgba(255,255,255,0.72);
    letter-spacing: 0.12em; text-transform: uppercase;
  }
  .slide-label {
    font-size: 13px; letter-spacing: 0.32em;
    text-transform: uppercase; color: rgba(255,255,255,0.22);
    margin-bottom: 6px;
  }
  .subtitle {
    font-family: 'Playfair Display', serif;
    font-size: 36px; color: #C9A227; margin-bottom: 30px;
    line-height: 1.2;
  }
  .body-text {
    font-size: 34px; font-weight: 300;
    line-height: 1.68; color: rgba(255,255,255,0.84);
  }
  .quote {
    font-family: 'Playfair Display', serif;
    font-size: 46px; font-style: italic; font-weight: 400;
    line-height: 1.38; color: rgba(255,255,255,0.92);
  }
  .quote-source {
    margin-top: 30px; font-size: 20px;
    color: #C9A227; letter-spacing: 0.08em;
  }
`;

function html(body) {
  return `<!DOCTYPE html><html><head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${FONTS_URL}" rel="stylesheet">
    <style>${BASE_STYLE}</style>
  </head><body>${body}</body></html>`;
}

function renderSlide(slide) {
  if (slide.type === 'cover') {
    return html(`<div class="slide">
      <div><span class="tag">${slide.category}</span></div>
      <div>
        <div class="accent"></div>
        <div class="headline">${slide.headline}</div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end">
        <div class="branding">SERVIAM</div>
        <div class="purple-badge">@serviam.ag</div>
      </div>
    </div>`);
  }

  if (slide.type === 'content') {
    return html(`<div class="slide">
      <div><div class="slide-label">SERVIAM — ${slide.slideLabel}</div></div>
      <div>
        <div class="subtitle">${slide.subtitle}</div>
        <div class="body-text">${slide.text}</div>
      </div>
      <div class="branding" style="opacity:0.22">SERVIAM.AG</div>
    </div>`);
  }

  if (slide.type === 'reflection') {
    return html(`<div class="slide">
      <div><span class="tag">Reflexão</span></div>
      <div>
        <div class="accent"></div>
        <div class="quote">"${slide.quote}"</div>
        ${slide.source ? `<div class="quote-source">${slide.source}</div>` : ''}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end">
        <div class="branding">SERVIAM</div>
        <div class="handle">Siga @serviam.ag ✦</div>
      </div>
    </div>`);
  }

  throw new Error(`Tipo de slide desconhecido: ${slide.type}`);
}

export async function createImages(slides) {
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
    await page.setContent(renderSlide(slides[i]), { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);

    const outputPath = join(outputDir, `slide_${i + 1}.png`);
    await page.screenshot({ path: outputPath, type: 'png' });
    await page.close();

    console.log(`  Slide ${i + 1} gerado: ${outputPath}`);
    paths.push(outputPath);
  }

  await browser.close();
  return paths;
}
