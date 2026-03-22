import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug || '';

  let name = 'LinkOne';
  let bio = 'Tu identidad digital en un solo link';
  let avatar = '';
  let accentColor = '#d4a432';

  try {
    const apiRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=name,bio,avatar,accent_color&slug=eq.${encodeURIComponent(slug)}&paid=eq.true`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await apiRes.json();
    if (data?.[0]) {
      name         = data[0].name         || name;
      bio          = data[0].bio          || bio;
      avatar       = data[0].avatar       || '';
      accentColor  = data[0].accent_color || accentColor;
    }
  } catch (_) {}

  // Convertir avatar a base64 para embeber en SVG (evita CORS)
  let avatarBase64 = '';
  if (avatar) {
    try {
      const imgRes = await fetch(avatar);
      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mime = imgRes.headers.get('content-type') || 'image/jpeg';
      avatarBase64 = `data:${mime};base64,${base64}`;
    } catch (_) {}
  }

  // Truncar textos largos
  const displayName = name.length > 28 ? name.slice(0, 28) + '…' : name;
  const displayBio  = bio.length > 45  ? bio.slice(0, 45)  + '…' : bio;

  // Generar SVG como imagen OG (1200x630 es el estándar de WhatsApp/Facebook)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <clipPath id="circle">
      <circle cx="600" cy="240" r="160"/>
    </clipPath>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="rgba(0,0,0,0.15)"/>
    </filter>
    <filter id="avatarShadow">
      <feDropShadow dx="0" dy="6" stdDeviation="16" flood-color="rgba(0,0,0,0.20)"/>
    </filter>
  </defs>

  <!-- Fondo blanco -->
  <rect width="1200" height="630" fill="#ffffff"/>

  <!-- Línea decorativa superior con accent color -->
  <rect x="0" y="0" width="1200" height="6" fill="${accentColor}"/>

  <!-- Círculo de fondo detrás del avatar -->
  <circle cx="600" cy="240" r="175" fill="${accentColor}18" filter="url(#shadow)"/>
  <circle cx="600" cy="240" r="170" fill="white" filter="url(#avatarShadow)"/>

  ${avatarBase64
    ? `<!-- Avatar en círculo -->
  <image href="${avatarBase64}" x="440" y="80" width="320" height="320" clip-path="url(#circle)" preserveAspectRatio="xMidYMid slice"/>`
    : `<!-- Inicial si no hay avatar -->
  <circle cx="600" cy="240" r="160" fill="${accentColor}22"/>
  <text x="600" y="265" font-family="system-ui, sans-serif" font-size="110" font-weight="700" fill="${accentColor}" text-anchor="middle">${name.charAt(0).toUpperCase()}</text>`
  }

  <!-- Borde del círculo con accent color -->
  <circle cx="600" cy="240" r="163" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.6"/>

  <!-- Nombre -->
  <text x="600" y="458" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="700" fill="#111111" text-anchor="middle">${displayName}</text>

  <!-- Bio -->
  <text x="600" y="516" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="400" fill="#666666" text-anchor="middle">${displayBio}</text>

  <!-- Branding LinkOne -->
  <text x="600" y="590" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600" fill="${accentColor}" text-anchor="middle">linkone.bio/u/${slug}</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).send(svg);
}
