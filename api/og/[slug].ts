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

  // Descargar y preparar avatar como círculo
  let avatarComposite: sharp.OverlayOptions | null = null;
  if (avatar) {
    try {
      const r = await fetch(avatar);
      const buf = Buffer.from(await r.arrayBuffer());

      // Redimensionar avatar a 310x310
      const resized = await sharp(buf)
        .resize(310, 310, { fit: 'cover' })
        .toBuffer();

      // Máscara circular
      const circle = Buffer.from(
        `<svg width="310" height="310"><circle cx="155" cy="155" r="155" fill="white"/></svg>`
      );
      const circled = await sharp(resized)
        .composite([{ input: circle, blend: 'dest-in' }])
        .png()
        .toBuffer();

      avatarComposite = { input: circled, top: 160, left: 105 };
    } catch (_) {}
  }

  // Parsear accent color a RGB
  const hex = accent.replace('#', '');
  const aR = parseInt(hex.slice(0, 2), 16);
  const aG = parseInt(hex.slice(2, 4), 16);
  const aB = parseInt(hex.slice(4, 6), 16);

  const safeName = name.length > 26 ? name.slice(0, 26) + '…' : name;
  const safeBio  = bio.length  > 50 ? bio.slice(0, 50)  + '…' : bio;

  // SVG solo para fondo y formas (sin texto)
  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <radialGradient id="g" cx="30%" cy="50%" r="70%">
        <stop offset="0%" stop-color="rgb(${aR},${aG},${aB})" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#111111"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="#111111"/>
    <rect width="1200" height="630" fill="url(#g)"/>
    <rect x="0" y="0" width="1200" height="6" fill="rgb(${aR},${aG},${aB})"/>
    <circle cx="260" cy="315" r="172" fill="rgb(${aR},${aG},${aB})" opacity="0.08"/>
    <circle cx="260" cy="315" r="163" fill="#1a1a1a"/>
    <circle cx="260" cy="315" r="158" fill="none" stroke="rgb(${aR},${aG},${aB})" stroke-width="3" opacity="0.6"/>
    <line x1="480" y1="155" x2="480" y2="475" stroke="rgb(${aR},${aG},${aB})" stroke-width="1" opacity="0.2"/>
    <rect x="545" y="372" width="520" height="1" fill="rgb(${aR},${aG},${aB})" opacity="0.3"/>
    <circle cx="557" cy="416" r="7" fill="rgb(${aR},${aG},${aB})"/>
  </svg>`;

  // SVG solo para texto (sharp renderiza mejor texto simple sin fuentes externas)
  const textSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <text x="545" y="268" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="54" font-weight="bold" fill="white">${safeName}</text>
    <text x="545" y="330" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="30" fill="#9ca3af">${safeBio}</text>
    <text x="580" y="425" font-family="DejaVu Sans Mono, Liberation Mono, Courier, monospace" font-size="26" fill="rgb(${aR},${aG},${aB})">linkone.bio/u/${slug}</text>
    <text x="1155" y="608" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="22" font-weight="bold" fill="rgb(${aR},${aG},${aB})" opacity="0.45" text-anchor="end">LinkOne</text>
  </svg>`;

  // Componer imagen con sharp
  const composites: sharp.OverlayOptions[] = [
    { input: Buffer.from(textSvg), top: 0, left: 0 },
  ];
  if (avatarComposite) composites.unshift(avatarComposite);

  const png = await sharp(Buffer.from(bgSvg))
    .composite(composites)
    .png()
    .toBuffer();

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).send(png);
}