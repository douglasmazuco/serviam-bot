import { readFileSync } from 'fs';

export async function uploadImages(imagePaths) {
  const apiKey = process.env.IMGBB_API_KEY;
  const urls = [];

  for (const imagePath of imagePaths) {
    const imageData = readFileSync(imagePath).toString('base64');

    const form = new FormData();
    form.append('key', apiKey);
    form.append('image', imageData);

    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: form,
    });

    const data = await res.json();
    if (!data.success) throw new Error(`Falha no upload imgbb: ${JSON.stringify(data)}`);

    const url = data.data.url;
    console.log(`  Upload OK: ${url}`);
    urls.push(url);

    await new Promise(r => setTimeout(r, 600));
  }

  return urls;
}
