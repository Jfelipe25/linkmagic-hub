import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from '@/types/profile';
import { profileFromRow } from '@/lib/profile-utils';
import { downloadVCard } from '@/lib/vcard';
import { Loader2, Download, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const VirtualCardPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) { setNotFound(true); setLoading(false); return; }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .eq('paid', true)
        .maybeSingle();
      if (!data) setNotFound(true);
      else setProfile(profileFromRow(data));
      setLoading(false);
    };
    fetchProfile();
  }, [slug]);

  const profileUrl = `${window.location.origin}/u/${slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}&color=d4a432`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `${profile?.name} - LinkOne`, url: profileUrl });
    } else {
      navigator.clipboard.writeText(profileUrl);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-neutral-950"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (notFound || !profile) return <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white"><p>{t('profile.notFound')}</p></div>;

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6">
      {/* Virtual Card */}
      <div ref={cardRef} className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '1.6/1' }}>
        {/* Card background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, ${profile.accent_color}44 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${profile.accent_color}22 0%, transparent 50%)`
        }} />
        
        {/* Card content */}
        <div className="relative h-full flex p-6 gap-4">
          {/* Left side */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-12 h-12 rounded-full object-cover border-2" style={{ borderColor: profile.accent_color }} />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: profile.accent_color + '33', color: profile.accent_color }}>
                  {profile.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <h2 className="text-white text-lg font-bold mt-2 leading-tight">{profile.name}</h2>
              {profile.bio && <p className="text-neutral-400 text-xs mt-1 line-clamp-2">{profile.bio}</p>}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: profile.accent_color }}>LinkOne</span>
              <span className="text-neutral-600 text-[10px]">/{profile.slug}</span>
            </div>
          </div>
          
          {/* Right side - QR */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="bg-white rounded-lg p-2">
              <img src={qrUrl} alt="QR" className="w-20 h-20" />
            </div>
            <p className="text-[9px] text-neutral-500 text-center max-w-[100px]">{t('card.scan')}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => downloadVCard(profile)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: profile.accent_color }}
        >
          <Download size={14} /> {t('dash.downloadVcard')}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
        >
          <Share2 size={14} /> Compartir
        </button>
      </div>
    </div>
  );
};

export default VirtualCardPage;
