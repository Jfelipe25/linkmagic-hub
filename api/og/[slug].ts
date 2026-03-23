import type { VercelRequest, VercelResponse } from '@vercel/node';
import sharp from 'sharp';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

// Descargar fuente Inter y convertir a base64
async function getFontBase64(weight: 400 | 700): Promise<string> {
  const url = `https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2`;
  const r = await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`);
  const css = await r.text();
  const match = css.match(/src: url\(([^)]+)\)/);
  if (!match) return '';
  const fontRes = await fetch(match[1]);
  const buf = await fontRes.arrayBuffer();
  return Buffer.from(buf).toString('base64');
}

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

  // Descargar avatar y fuentes en paralelo
  const [avatarResult, fontRegular, fontBold] = await Promise.allSettled([
    avatar ? fetch(avatar).then(r => r.arrayBuffer()).then(buf => ({
      b64: `data:image/jpeg;base64,${Buffer.from(buf).toString('base64')}`
    })) : Promise.resolve({ b64: '' }),
    fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2').then(r => r.arrayBuffer()).then(buf => Buffer.from(buf).toString('base64')),
    fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2').then(r => r.arrayBuffer()).then(buf => Buffer.from(buf).toString('base64')),
  ]);

  const avatarB64 = avatarResult.status === 'fulfilled' ? avatarResult.value.b64 : '';
  const fontRegularB64 = fontRegular.status === 'fulfilled' ? fontRegular.value : '';
  const fontBoldB64 = fontBold.status === 'fulfilled' ? fontBold.value : '';

  const safeName = name.length > 26 ? name.slice(0, 26) + '…' : name;
  const safeBio  = bio.length  > 48 ? bio.slice(0, 48)  + '…' : bio;
  const safeSlug = `linkone.bio/u/${slug}`;

  const fontStyle = (fontRegularB64 || fontBoldB64) ? `
  <style>
    @font-face {
      font-family: 'Inter';
      font-weight: 400;
      src: url('data:font/woff2;base64,${fontRegularB64}') format('woff2');
    }
    @font-face {
      font-family: 'Inter';
      font-weight: 700;
      src: url('data:font/woff2;base64,${fontBoldB64}') format('woff2');
    }
  </style>` : '';

  const fontFamily = fontRegularB64 ? "'Inter', sans-serif" : "Arial, Helvetica, sans-serif";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  ${fontStyle}
  <defs>
    <clipPath id="avatarClip">
      <circle cx="260" cy="315" r="155"/>
    </clipPath>
    <radialGradient id="bgGrad" cx="30%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#111111" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="50%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
  </defs>

  <!-- Fondo -->
  <rect width="1200" height="630" fill="#111111"/>
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect x="0" y="0" width="1200" height="6" fill="url(#lineGrad)"/>

  <!-- Círculo avatar -->
  <circle cx="260" cy="315" r="172" fill="${accent}" opacity="0.08"/>
  <circle cx="260" cy="315" r="163" fill="#1a1a1a"/>
  ${avatarB64
    ? `<image href="${avatarB64}" x="105" y="160" width="310" height="310" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<text x="260" y="360" font-family="${fontFamily}" font-size="120" font-weight="700" fill="${accent}" text-anchor="middle">${name.charAt(0).toUpperCase()}</text>`
  }
  <circle cx="260" cy="315" r="158" fill="none" stroke="${accent}" stroke-width="3" opacity="0.6"/>

  <!-- Divisor -->
  <line x1="480" y1="155" x2="480" y2="475" stroke="${accent}" stroke-width="1" opacity="0.2"/>

  <!-- Nombre -->
  <text x="545" y="268" font-family="${fontFamily}" font-size="54" font-weight="700" fill="#ffffff">${safeName}</text>

  <!-- Bio -->
  <text x="545" y="330" font-family="${fontFamily}" font-size="30" font-weight="400" fill="#9ca3af">${safeBio}</text>

  <!-- Línea separadora -->
  <rect x="545" y="372" width="520" height="1" fill="${accent}" opacity="0.3"/>

  <!-- Punto + link -->
  <circle cx="557" cy="416" r="7" fill="${accent}"/>
  <text x="580" y="425" font-family="${fontFamily}" font-size="26" font-weight="400" fill="${accent}">${safeSlug}</text>

  <!-- Branding -->
  <text x="1155" y="608" font-family="${fontFamily}" font-size="22" font-weight="700" fill="${accent}" opacity="0.45" text-anchor="end">LinkOne</text>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).send(png);
}
