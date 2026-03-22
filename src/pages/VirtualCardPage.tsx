import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from '@/types/profile';
import { profileFromRow } from '@/lib/profile-utils';
import { Loader2, Share2, ExternalLink, Copy, Check, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const VirtualCardPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) { setNotFound(true); setLoading(false); return; }
      const { data } = await supabase
        .from('profiles').select('*').eq('slug', slug).eq('paid', true).maybeSingle();
      if (!data) setNotFound(true);
      else setProfile(profileFromRow(data));
      setLoading(false);
    };
    fetchProfile();
  }, [slug]);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  const profileUrl = `${window.location.origin}/u/${slug}`;
  const cardUrl = `${window.location.origin}/card/${slug}`;

  // Set OG meta tags para compartir en WhatsApp/redes
  useEffect(() => {
    if (!profile) return;
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    const cardUrl = `${window.location.origin}/card/${slug}`;
    document.title = `${profile.name} | Tarjeta Digital`;
    setMeta('og:title', `${profile.name} | LinkOne`);
    setMeta('og:description', profile.bio || `Tarjeta digital de ${profile.name}`);
    setMeta('og:type', 'profile');
    setMeta('og:url', cardUrl);
    setMeta('og:site_name', 'LinkOne');
    if (profile.avatar) {
      setMeta('og:image', profile.avatar);
      setMeta('og:image:width', '400');
      setMeta('og:image:height', '400');
      setMetaName('twitter:image', profile.avatar);
    }
    setMetaName('twitter:card', 'summary');
    setMetaName('twitter:title', `${profile.name} | LinkOne`);
    setMetaName('twitter:description', profile.bio || `Tarjeta digital de ${profile.name}`);
    return () => { document.title = 'LinkOne'; };
  }, [profile]);
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `${profile?.name} | LinkOne`, url: profileUrl });
    } else {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current || !profile) return;
    setDownloading(true);
    try {
      // Convertir imagen de avatar a base64 para evitar CORS
      if (profile.avatar) {
        const imgs = cardRef.current.querySelectorAll('img');
        await Promise.all(Array.from(imgs).map(async (img) => {
          try {
            const res = await fetch(img.src);
            const blob = await res.blob();
            const b64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            img.src = b64;
          } catch {}
        }));
        // Esperar que carguen
        await new Promise(r => setTimeout(r, 300));
      }

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: '#111111',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `tarjeta-${profile.slug}.png`;
      a.click();
    } catch (err) {
      console.error('Download failed', err);
    }
    setDownloading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <Loader2 className="animate-spin" size={32} style={{ color: '#d4a432' }} />
    </div>
  );

  if (notFound || !profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <p className="text-neutral-400">Perfil no encontrado</p>
    </div>
  );

  const accent = profile.accent_color || '#d4a432';
  // Tema de la tarjeta según el template del perfil
  const themeMap: Record<string, {
    pageBg: string; cardBg: string; cardBorder: string;
    nameColor: string; bioColor: string;
    footerBg: string; footerText: string;
    qrBg: string; qrColor: string; scanText: string; pageGlow: string;
  }> = {
    minimal: {
      pageBg: '#f8f8f8',
      cardBg: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #ffffff 100%)',
      cardBorder: `${accent}40`,
      nameColor: '#111111',
      bioColor: '#555555',
      footerBg: '#f0f0f0',
      footerText: '#888888',
      qrBg: '#f5f5f5',
      qrColor: (accent).replace('#', ''),
      scanText: '#888888',
      pageGlow: `${accent}10`,
    },
    dark: {
      pageBg: '#0a0a0a',
      cardBg: 'linear-gradient(135deg, #1a1a1a 0%, #111111 50%, #1a1a1a 100%)',
      cardBorder: `${accent}30`,
      nameColor: '#ffffff',
      bioColor: '#9ca3af',
      footerBg: '#0d0d0d',
      footerText: '#525252',
      qrBg: '#111111',
      qrColor: (accent).replace('#', ''),
      scanText: '#525252',
      pageGlow: `${accent}18`,
    },
    gradient: {
      pageBg: '#0a0a0a',
      cardBg: `linear-gradient(135deg, ${accent}33 0%, #111111 50%, ${accent}18 100%)`,
      cardBorder: `${accent}50`,
      nameColor: '#ffffff',
      bioColor: '#d1d5db',
      footerBg: `${accent}15`,
      footerText: `${accent}80`,
      qrBg: '#111111',
      qrColor: (accent).replace('#', ''),
      scanText: '#9ca3af',
      pageGlow: `${accent}25`,
    },
    background: {
      pageBg: '#0a0a0a',
      cardBg: `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.75) 100%)`,
      cardBorder: `${accent}40`,
      nameColor: '#ffffff',
      bioColor: '#e5e7eb',
      footerBg: 'rgba(0,0,0,0.6)',
      footerText: '#9ca3af',
      qrBg: 'rgba(0,0,0,0.5)',
      qrColor: (accent).replace('#', ''),
      scanText: '#9ca3af',
      pageGlow: `${accent}20`,
    },
  };

  const theme = themeMap[profile.template] ?? themeMap.dark;
  const { pageBg, cardBg, cardBorder, nameColor, bioColor, footerBg, footerText, qrBg, qrColor, scanText, pageGlow } = theme;
  const qrBgColor = profile.template === 'minimal' ? 'f5f5f5' : '111111';
  const qrUrl = profile.slug
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}&color=${qrColor.replace('#','')}&bgcolor=${qrBgColor}`
    : '';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: pageBg }}>
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at 50% 0%, ${pageGlow} 0%, transparent 60%)`
        }} />

        {/* Card container */}
        <div className="w-full max-w-sm relative z-10">
          {/* Main card */}
          <div ref={cardRef} className="rounded-3xl overflow-hidden shadow-2xl border" style={{
            background: cardBg,
            borderColor: cardBorder
          }}>
            {/* Top accent line */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

            {/* Card body */}
            <div className="p-7">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4 mb-6">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name}
                    className="w-28 h-28 rounded-2xl object-cover flex-shrink-0"
                    style={{ border: `2px solid ${accent}50` }} />
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
                    style={{ background: `${accent}20`, color: accent, border: `2px solid ${accent}30` }}>
                    {profile.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold leading-tight" style={{ color: nameColor }}>{profile.name}</h1>
                  {profile.bio && (
                    <p className="text-sm mt-1" style={{ color: bioColor }}>{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                    <span className="text-xs font-mono" style={{ color: `${accent}99` }}>linkone.bio/u/{profile.slug}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full mb-6" style={{ background: `linear-gradient(90deg, transparent, ${accent}30, transparent)` }} />

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl p-3" style={{ background: qrBg, border: `1px solid ${accent}20` }}>
                  <img src={qrUrl} alt="QR Code" className="w-48 h-48 rounded-xl" />
                </div>
                <p className="text-xs" style={{ color: scanText }}>Escanea para abrir mi perfil</p>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}20, transparent)` }} />

            {/* Footer */}
            <div className="px-7 py-4 flex items-center justify-between" style={{ background: footerBg }}>
              <span className="text-xs font-bold" style={{ color: accent }}>Linkone.bio</span>
              <span className="text-xs" style={{ color: footerText }}>Tarjeta digital</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: accent, color: '#000' }}>
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? 'Copiado' : 'Compartir'}
            </button>
            <button onClick={handleDownloadImage} disabled={downloading}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border transition-colors hover:bg-white/5 disabled:opacity-50"
              style={{ borderColor: `${accent}40`, color: accent }}>
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {downloading ? 'Generando...' : 'Descargar'}
            </button>
          </div>

          {/* Copy link */}
          <button onClick={handleCopy}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm border transition-colors hover:bg-white/5"
            style={{ borderColor: '#ffffff15', color: '#666' }}>
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            <span className="font-mono text-xs truncate">{profileUrl}</span>
          </button>

          {/* PWA Install button */}
          {canInstall && !installed && (
            <button onClick={handleInstall}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border transition-colors hover:bg-white/5"
              style={{ borderColor: `${accent}30`, color: accent }}>
              <span>📲</span>
              Agregar a pantalla de inicio
            </button>
          )}
          {installed && (
            <div className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm"
              style={{ color: '#4ade80' }}>
              <Check size={14} /> Instalado en tu teléfono
            </div>
          )}

          {/* iOS install hint */}
          <p className="mt-4 text-center text-xs text-neutral-600">
            En iPhone: toca <span className="text-neutral-400">Compartir →</span> <span className="text-neutral-400">"Agregar a inicio"</span>
          </p>
        </div>
      </div>

      {/* Bottom safe area */}
      <div className="h-6" />
    </div>
  );
};

export default VirtualCardPage;
