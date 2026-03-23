import type { VercelRequest, VercelResponse } from '@vercel/node';
import sharp from 'sharp';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug || '';

  let avatar = '';
  let accent = '#d4a432';

  try {
    const apiRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=avatar,accent_color&slug=eq.${encodeURIComponent(slug)}&paid=eq.true`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await apiRes.json();
    if (data?.[0]) {
      avatar = data[0].avatar       || '';
      accent = data[0].accent_color || accent;
    }
  } catch (_) {}

  const hex = accent.replace('#', '');
  const aR = parseInt(hex.slice(0, 2), 16);
  const aG = parseInt(hex.slice(2, 4), 16);
  const aB = parseInt(hex.slice(4, 6), 16);

  // Descargar avatar
  let avatarB64 = '';
  if (avatar) {
    try {
      const r = await fetch(avatar);
      const buf = Buffer.from(await r.arrayBuffer());
      const mime = r.headers.get('content-type') || 'image/jpeg';
      avatarB64 = `data:${mime};base64,${Buffer.from(buf).toString('base64')}`;
    } catch (_) {}
  }

  // SVG: solo fondo + foto en círculo centrada, sin texto
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <clipPath id="c">
      <circle cx="600" cy="315" r="240"/>
    </clipPath>
    <radialGradient id="g" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="rgb(${aR},${aG},${aB})" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#111111"/>
    </radialGradient>
  </defs>

  <!-- Fondo -->
  <rect width="1200" height="630" fill="#111111"/>
  <rect width="1200" height="630" fill="url(#g)"/>

  <!-- Línea accent arriba -->
  <rect x="0" y="0" width="1200" height="5" fill="rgb(${aR},${aG},${aB})"/>

  <!-- Círculo de fondo -->
  <circle cx="600" cy="315" r="255" fill="rgb(${aR},${aG},${aB})" opacity="0.08"/>
  <circle cx="600" cy="315" r="247" fill="#1c1c1c"/>

  ${avatarB64
    ? `<image href="${avatarB64}" x="360" y="75" width="480" height="480" clip-path="url(#c)" preserveAspectRatio="xMidYMid slice"/>`
    : `<text x="600" y="350" font-size="180" text-anchor="middle" fill="rgb(${aR},${aG},${aB})">?</text>`
  }

  <!-- Borde del círculo -->
  <circle cx="600" cy="315" r="243" fill="none" stroke="rgb(${aR},${aG},${aB})" stroke-width="3" opacity="0.5"/>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).send(png);
}