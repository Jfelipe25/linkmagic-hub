import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

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

  const appUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.linkone.bio';
  const cardUrl = `https://www.linkone.bio/card/${slug}`;
  const profileUrl = `https://www.linkone.bio/u/${slug}`;
  const imageUrl = avatar || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} | Tarjeta Digital - LinkOne</title>
  <meta name="description" content="${bio}" />

  <!-- Open Graph -->
  <meta property="og:title" content="${name} | LinkOne" />
  <meta property="og:description" content="${bio}" />
  <meta property="og:type" content="profile" />
  <meta property="og:url" content="${cardUrl}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="400" />
  <meta property="og:image:height" content="400" />
  <meta property="og:site_name" content="LinkOne" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${name} | LinkOne" />
  <meta name="twitter:description" content="${bio}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <!-- WhatsApp especifico -->
  <meta property="og:image:secure_url" content="${imageUrl}" />

  <!-- Redirect al SPA -->
  <script>window.location.href = "${cardUrl}";</script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${cardUrl}" />
  </noscript>
</head>
<body>
  <p>Redirigiendo a la tarjeta de ${name}...</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(html);
}
