import type { VercelRequest, VercelResponse } from '@vercel/node';
import sharp from 'sharp';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug || '';

  let name = 'LinkOne';
  let bio = 'Tu identidad digital en un solo link';
  let avatar = '';
  let accent = '#d4a432';

  try {
    const apiRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=name,bio,avatar,accent_color&slug=eq.${encodeURIComponent(slug)}&paid=eq.true`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await apiRes.json();
    if (data?.[0]) {
      name   = data[0].name         || name;
      bio    = data[0].bio          || bio;
      avatar = data[0].avatar       || '';
      accent = data[0].accent_color || accent;
    }
  } catch (_) {}

  // Descargar avatar y convertir a base64
  let avatarB64 = '';
  if (avatar) {
    try {
      const r = await fetch(avatar);
      const buf = await r.arrayBuffer();
      const mime = r.headers.get('content-type') || 'image/jpeg';
      avatarB64 = `data:${mime};base64,${Buffer.from(buf).toString('base64')}`;
    } catch (_) {}
  }

  const safeName = name.length > 30 ? name.slice(0, 30) + '…' : name;
  const safeBio  = bio.length  > 52 ? bio.slice(0, 52)  + '…' : bio;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <clipPath id="avatarClip">
      <circle cx="260" cy="315" r="155"/>
    </clipPath>
    <radialGradient id="bgGrad" cx="30%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#111111" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="50%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#111111"/>
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect x="0" y="0" width="1200" height="5" fill="url(#lineGrad)"/>
  <circle cx="260" cy="315" r="170" fill="${accent}" opacity="0.06"/>
  <circle cx="260" cy="315" r="162" fill="#1a1a1a"/>
  ${avatarB64
    ? `<image href="${avatarB64}" x="105" y="160" width="310" height="310" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<text x="260" y="360" font-family="system-ui" font-size="120" font-weight="700" fill="${accent}" text-anchor="middle">${name.charAt(0).toUpperCase()}</text>`
  }
  <circle cx="260" cy="315" r="158" fill="none" stroke="${accent}" stroke-width="3" opacity="0.5"/>
  <line x1="480" y1="160" x2="480" y2="470" stroke="${accent}" stroke-width="1" opacity="0.2"/>
  <text x="545" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="700" fill="#ffffff">${safeName}</text>
  <text x="545" y="335" font-family="system-ui, -apple-system, sans-serif" font-size="30" fill="#9ca3af">${safeBio}</text>
  <rect x="545" y="375" width="500" height="1" fill="${accent}" opacity="0.25"/>
  <circle cx="556" cy="418" r="6" fill="${accent}"/>
  <text x="578" y="427" font-family="monospace, system-ui" font-size="26" font-weight="600" fill="${accent}">linkone.bio/u/${slug}</text>
  <text x="1150" y="608" font-family="system-ui" font-size="20" font-weight="700" fill="${accent}" opacity="0.4" text-anchor="end">LinkOne</text>
</svg>`;

  // Convertir SVG a PNG con sharp
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).send(png);
}
