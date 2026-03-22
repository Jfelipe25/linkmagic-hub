import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const APP_URL = 'https://www.linkone.bio';

const BOT_AGENTS = /whatsapp|facebookexternalhit|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|googlebot|bingbot|yandex|baidu|duckduckbot|applebot|pinterest|vkshare|w3c_validator/i;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug || '';
  const userAgent = req.headers['user-agent'] || '';
  const isBot = BOT_AGENTS.test(userAgent);

  // ── Usuario real → redirigir al SPA via index.html ────────────────────────
  if (!isBot) {
    // Leemos el index.html compilado del mismo servidor y lo devolvemos.
    // Vercel lo tiene en disco bajo /var/task o accesible via filesystem.
    // La forma más simple y confiable: redirect 302 con header que evita loop.
    // Como /u/:slug ya fue capturado por routes, usamos un path alternativo
    // que cae en el catch-all "/(.*)" -> index.html
    res.setHeader('Location', `${APP_URL}/?_u=${encodeURIComponent(slug)}`);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(302).end();
  }

  // ── Bot → consultar Supabase y devolver HTML con OG tags ──────────────────
  let name = 'LinkOne';
  let bio = 'Tu identidad digital en un solo link';
  let avatar = '';

  try {
    const apiRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=name,bio,avatar&slug=eq.${encodeURIComponent(slug)}&paid=eq.true`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
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

  const ogImage = avatar ? `
  <meta property="og:image"            content="${safeAvatar}" />
  <meta property="og:image:secure_url" content="${safeAvatar}" />
  <meta property="og:image:width"      content="400" />
  <meta property="og:image:height"     content="400" />
  <meta name="twitter:image"           content="${safeAvatar}" />` : '';

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
