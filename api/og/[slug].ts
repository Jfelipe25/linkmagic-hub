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

  let avatarB64 = '';
  if (avatar) {
    try {
      const r = await fetch(avatar);
      const buf = Buffer.from(await r.arrayBuffer());
      const mime = r.headers.get('content-type') || 'image/jpeg';
      avatarB64 = `data:${mime};base64,${Buffer.from(buf).toString('base64')}`;
    } catch (_) {}
  }

  // Imagen cuadrada 630x630 — más consistente en PC y celular
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="630" height="630" viewBox="0 0 630 630">
  <defs>
    <clipPath id="c">
      <circle cx="315" cy="315" r="250"/>
    </clipPath>
    <radialGradient id="g" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="rgb(${aR},${aG},${aB})" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#111111"/>
    </radialGradient>
  </defs>
  <rect width="630" height="630" fill="#111111"/>
  <rect width="630" height="630" fill="url(#g)"/>
  <circle cx="315" cy="315" r="262" fill="rgb(${aR},${aG},${aB})" opacity="0.08"/>
  <circle cx="315" cy="315" r="255" fill="#1c1c1c"/>
  ${avatarB64
    ? `<image href="${avatarB64}" x="65" y="65" width="500" height="500" clip-path="url(#c)" preserveAspectRatio="xMidYMid slice"/>`
    : `<text x="315" y="370" font-size="200" text-anchor="middle" fill="rgb(${aR},${aG},${aB})">?</text>`
  }
  <circle cx="315" cy="315" r="250" fill="none" stroke="rgb(${aR},${aG},${aB})" stroke-width="3" opacity="0.5"/>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).send(png);
}