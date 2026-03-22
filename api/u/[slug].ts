import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const BOT_AGENTS = /whatsapp|facebookexternalhit|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|googlebot|bingbot|yandex|baidu|duckduck/i;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const userAgent = req.headers['user-agent'] || '';
  const isBot = BOT_AGENTS.test(userAgent);

  let name = 'LinkOne';
  let bio = 'Tu identidad digital en un solo link';
  let avatar = '';

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=name,bio,avatar,slug&slug=eq.${slug}&paid=eq.true`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await response.json();
    if (data?.[0]) {
      name = data[0].name || name;
      bio = data[0].bio || bio;
      avatar = data[0].avatar || '';
    }
  } catch {}

  const profileUrl = `https://www.linkone.bio/u/${slug}`;

  if (!isBot) {
    // Usuario real — HTML que carga el SPA con script redirect
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} | LinkOne</title>
  <meta property="og:title" content="${name} | LinkOne" />
  <meta property="og:description" content="${bio}" />
  <meta property="og:image" content="${avatar}" />
  <meta property="og:url" content="${profileUrl}" />
  <script>
    // Cargar el SPA completo
    window.location.replace('${profileUrl}?_spa=1');
  </script>
</head>
<body><p>Cargando...</p></body>
</html>`);
    return;
  }

  // Bot — devolver OG tags completos
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} | LinkOne</title>
  <meta name="description" content="${bio}" />
  <meta property="og:title" content="${name} | LinkOne" />
  <meta property="og:description" content="${bio}" />
  <meta property="og:type" content="profile" />
  <meta property="og:url" content="${profileUrl}" />
  ${avatar ? `<meta property="og:image" content="${avatar}" />
  <meta property="og:image:width" content="400" />
  <meta property="og:image:height" content="400" />
  <meta property="og:image:secure_url" content="${avatar}" />` : ''}
  <meta property="og:site_name" content="LinkOne" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${name} | LinkOne" />
  <meta name="twitter:description" content="${bio}" />
  ${avatar ? `<meta name="twitter:image" content="${avatar}" />` : ''}
</head>
<body><p>${name} - ${bio}</p></body>
</html>`);
}
