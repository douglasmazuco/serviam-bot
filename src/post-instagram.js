const IG_BASE = 'https://graph.instagram.com/v21.0';

async function apiPost(path, params) {
  const res = await fetch(`${IG_BASE}${path}`, {
    method: 'POST',
    body: new URLSearchParams(params),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Instagram API: ${data.error.message} (code ${data.error.code})`);
  if (!data.id) throw new Error(`Resposta inesperada: ${JSON.stringify(data)}`);
  return data.id;
}

async function waitForReady(containerId, token, retries = 10) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(`${IG_BASE}/${containerId}?fields=status_code&access_token=${token}`);
    const data = await res.json();
    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') throw new Error(`Container com erro: ${containerId}`);
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error(`Container não ficou pronto após ${retries} tentativas: ${containerId}`);
}

export async function postCarousel(imageUrls, caption) {
  const userId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  console.log(`  Criando ${imageUrls.length} containers de imagem...`);
  const containerIds = [];
  for (const url of imageUrls) {
    const id = await apiPost(`/${userId}/media`, {
      media_type: 'IMAGE',
      image_url: url,
      is_carousel_item: 'true',
      access_token: token,
    });
    containerIds.push(id);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('  Aguardando processamento dos containers...');
  for (const id of containerIds) {
    await waitForReady(id, token);
  }

  console.log('  Criando container do carrossel...');
  const carouselId = await apiPost(`/${userId}/media`, {
    media_type: 'CAROUSEL',
    children: containerIds.join(','),
    caption: caption,
    access_token: token,
  });

  await new Promise(r => setTimeout(r, 4000));

  console.log('  Publicando...');
  const postId = await apiPost(`/${userId}/media_publish`, {
    creation_id: carouselId,
    access_token: token,
  });

  return postId;
}
