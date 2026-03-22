import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const APP_URL = 'https://www.linkone.bio';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Esta función SOLO recibe bots — el vercel.json filtra por user-agent
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug || '';

  let name = 'LinkOne';
  let bio = 'Tu identidad digital en un solo link';
  let avatar = '';

  try {
    const apiRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=name,bio,avatar&slug=eq.${encodeURIComponent(slug)}&paid=eq.true`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await apiRes.json();
    if (data?.[0]) {
      name   = data[0].name   || name;
      bio    = data[0].bio    || bio;
      avatar = data[0].avatar || '';
    }
  } catch (_) {}

  const safeName   = escapeHtml(name);
  const safeBio    = escapeHtml(bio);
  const safeAvatar = escapeHtml(avatar);
  const profileUrl = `${APP_URL}/u/${slug}`;

  // Imagen OG dinámica: foto en círculo, fondo blanco, estilo tarjeta
  const ogImageUrl = `${APP_URL}/api/og/${slug}`;
  const ogImage = `
  <meta property="og:image"            content="${ogImageUrl}" />
  <meta property="og:image:secure_url" content="${ogImageUrl}" />
  <meta property="og:image:width"      content="1200" />
  <meta property="og:image:height"     content="630" />
  <meta name="twitter:image"           content="${ogImageUrl}" />`; 

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="es" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeName} | LinkOne</title>
  <meta name="description" content="${safeBio}" />
  <meta property="og:type"         content="profile" />
  <meta property="og:site_name"    content="LinkOne" />
  <meta property="og:title"        content="${safeName} | LinkOne" />
  <meta property="og:description"  content="${safeBio}" />
  <meta property="og:url"          content="${profileUrl}" />${ogImage}
  <meta name="twitter:card"        content="summary" />
  <meta name="twitter:title"       content="${safeName} | LinkOne" />
  <meta name="twitter:description" content="${safeBio}" />
</head>
<body>
  <h1>${safeName}</h1>
  <p>${safeBio}</p>
  <a href="${profileUrl}">Ver perfil en LinkOne</a>
</body>
</html>`);
}
