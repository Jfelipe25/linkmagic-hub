import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const userAgent = req.headers['user-agent'] || '';
  const isBotOrScraper = /whatsapp|facebook|facebookexternalhit|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|bot|crawler|scraper/i.test(userAgent);

  if (!isBotOrScraper) {
    // Usuario real — servir el index.html del SPA directamente
    const spaResponse = await fetch('https://www.linkone.bio/index.html');
    const html = await spaResponse.text();
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
    return;
  }

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

  const html = `<!DOCTYPE html>
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
<body>
  <p>${name} - ${bio}</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(html);
}
