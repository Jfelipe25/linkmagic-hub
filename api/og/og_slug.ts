import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  // Truncar textos
  const safeName = name.length > 30 ? name.slice(0, 30) + '…' : name;
  const safeBio  = bio.length  > 52 ? bio.slice(0, 52)  + '…' : bio;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <clipPath id="avatarClip">
      <circle cx="260" cy="315" r="155"/>
    </clipPath>
    <radialGradient id="bgGrad" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#111111" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="50%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
  </defs>

  <!-- Fondo oscuro con gradiente -->
  <rect width="1200" height="630" fill="#111111"/>
  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- Línea superior accent -->
  <rect x="0" y="0" width="1200" height="5" fill="url(#lineGrad)"/>

  <!-- Círculo de fondo detrás del avatar -->
  <circle cx="260" cy="315" r="170" fill="${accent}" opacity="0.08"/>
  <circle cx="260" cy="315" r="162" fill="#1a1a1a"/>

  ${avatarB64
    ? `<image href="${avatarB64}" x="105" y="160" width="310" height="310" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="260" cy="315" r="155" fill="${accent}22"/>
       <text x="260" y="360" font-family="system-ui" font-size="120" font-weight="700" fill="${accent}" text-anchor="middle">${name.charAt(0).toUpperCase()}</text>`
  }

  <!-- Borde del círculo -->
  <circle cx="260" cy="315" r="158" fill="none" stroke="${accent}" stroke-width="3" opacity="0.5"/>

  <!-- Línea divisoria vertical -->
  <line x1="480" y1="140" x2="480" y2="490" stroke="${accent}" stroke-width="1" opacity="0.25"/>

  <!-- Nombre -->
  <text x="545" y="265" font-family="system-ui, -apple-system, sans-serif" font-size="58" font-weight="700" fill="#ffffff">${safeName}</text>

  <!-- Bio -->
  <text x="545" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="400" fill="#9ca3af">${safeBio}</text>

  <!-- Línea separadora -->
  <rect x="545" y="370" width="560" height="1" fill="${accent}" opacity="0.3"/>

  <!-- Punto decorativo + link -->
  <circle cx="555" cy="415" r="6" fill="${accent}"/>
  <text x="578" y="424" font-family="system-ui, -apple-system, monospace" font-size="28" font-weight="600" fill="${accent}">linkone.bio/u/${slug}</text>

  <!-- Branding LinkOne abajo derecha -->
  <text x="1150" y="600" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="${accent}" opacity="0.5" text-anchor="end">LinkOne</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).send(svg);
}
