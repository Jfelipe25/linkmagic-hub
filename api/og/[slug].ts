import type { VercelRequest, VercelResponse } from '@vercel/node';
import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

function loadFont(filename: string): string {
  // Vercel monta el proyecto en /var/task
  const paths = [
    join('/var/task', 'api', 'fonts', filename),
    join(process.cwd(), 'api', 'fonts', filename),
    join(__dirname, '..', 'fonts', filename),
    join(__dirname, 'fonts', filename),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      return readFileSync(p).toString('base64');
    }
  }
  return '';
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

  // Cargar fuentes
  const fontRegularB64 = loadFont('Poppins-Regular.woff2');
  const fontBoldB64    = loadFont('Poppins-Bold.woff2');
  const fontFamily = fontRegularB64 ? 'Poppins' : 'DejaVu Sans';

  // Avatar circular
  let avatarComposite: sharp.OverlayOptions | null = null;
  if (avatar) {
    try {
      const r = await fetch(avatar);
      const buf = Buffer.from(await r.arrayBuffer());
      const resized = await sharp(buf).resize(310, 310, { fit: 'cover' }).toBuffer();
      const mask = Buffer.from(`<svg width="310" height="310"><circle cx="155" cy="155" r="155" fill="white"/></svg>`);
      const circled = await sharp(resized)
        .composite([{ input: mask, blend: 'dest-in' }])
        .png().toBuffer();
      avatarComposite = { input: circled, top: 160, left: 105 };
    } catch (_) {}
  }

  const hex = accent.replace('#', '');
  const aR = parseInt(hex.slice(0, 2), 16);
  const aG = parseInt(hex.slice(2, 4), 16);
  const aB = parseInt(hex.slice(4, 6), 16);

  const safeName = name.length > 26 ? name.slice(0, 26) + '...' : name;
  const safeBio  = bio.length  > 50 ? bio.slice(0, 50)  + '...' : bio;

  const fontStyle = fontRegularB64 ? `<style>
    @font-face { font-family: 'Poppins'; font-weight: 400; src: url('data:font/woff2;base64,${fontRegularB64}') format('woff2'); }
    @font-face { font-family: 'Poppins'; font-weight: 700; src: url('data:font/woff2;base64,${fontBoldB64}') format('woff2'); }
  </style>` : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    ${fontStyle}
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
  <text x="545" y="268" font-family="${fontFamily}" font-weight="700" font-size="54" fill="white">${safeName}</text>
  <text x="545" y="330" font-family="${fontFamily}" font-weight="400" font-size="30" fill="#9ca3af">${safeBio}</text>
  <text x="580" y="425" font-family="${fontFamily}" font-weight="400" font-size="26" fill="rgb(${aR},${aG},${aB})">linkone.bio/u/${slug}</text>
  <text x="1155" y="608" font-family="${fontFamily}" font-weight="700" font-size="22" fill="rgb(${aR},${aG},${aB})" opacity="0.45" text-anchor="end">LinkOne</text>
</svg>`;

  const composites: sharp.OverlayOptions[] = [{ input: Buffer.from(svg), top: 0, left: 0 }];
  if (avatarComposite) composites.unshift(avatarComposite);

  const png = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: { r: 17, g: 17, b: 17, alpha: 1 } }
  }).composite(composites).png().toBuffer();

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).send(png);
}