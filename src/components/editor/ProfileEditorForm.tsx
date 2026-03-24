import { useState, useCallback, useEffect } from 'react';
import { Plus, Upload, Loader2, Check, X, Image } from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { ProfileData, CustomLink, SOCIAL_PLATFORMS, TemplateType, DEFAULT_PROFILE } from '@/types/profile';
import type { PricingOption } from '@/hooks/usePricing';
import { supabase } from '@/integrations/supabase/client';
import FormSection from './FormSection';
import SocialInput from './SocialInput';
import LinkItem from './LinkItem';
import ColorPicker from './ColorPicker';
import TemplateCard from './TemplateCard';
import { normalizeUrl } from '@/lib/profile-utils';

interface ProfileEditorFormProps {
  profile: ProfileData;
  onChange: (profile: ProfileData) => void;
  onPublish?: () => void;
  publishLabel?: string;
  isPublishing?: boolean;
  pricingOptions?: PricingOption[];
  selectedPricing?: PricingOption | null;
  onPricingChange?: (option: PricingOption) => void;
}

const IMGBB_API_KEY = '6adb05b927a84a01cc6266417c3198dd';

const ProfileEditorForm = ({ profile, onChange, onPublish, publishLabel = 'Pagar y publicar', isPublishing, pricingOptions = [], selectedPricing, onPricingChange }: ProfileEditorFormProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [slugInput, setSlugInput] = useState(profile.slug);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugTimeout, setSlugTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback(<K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    onChange({ ...profile, [key]: value });
  }, [profile, onChange]);

  const updateSocial = useCallback((key: string, value: string) => {
    onChange({ ...profile, social_links: { ...profile.social_links, [key]: value } });
  }, [profile, onChange]);

  const addLink = useCallback(() => {
    const newLink: CustomLink = { id: crypto.randomUUID(), label: '', url: '' };
    onChange({ ...profile, links: [...profile.links, newLink] });
  }, [profile, onChange]);

  const updateLink = useCallback((id: string, field: 'label' | 'url' | 'schedule_start' | 'schedule_end', value: string) => {
    const finalValue = field === 'url' ? normalizeUrl(value) : value;
    onChange({
      ...profile,
      links: profile.links.map(l => l.id === id ? { ...l, [field]: finalValue } : l),
    });
  }, [profile, onChange]);

  const removeLink = useCallback((id: string) => {
    onChange({ ...profile, links: profile.links.filter(l => l.id !== id) });
  }, [profile, onChange]);

  // Comprime imagen antes de subir
  const compressImage = (file: File, maxWidth: number, quality: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, maxWidth / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality);
      };
      img.src = url;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    update('avatar', localUrl);
    setUploading(true);
    try {
      const compressed = await compressImage(file, 400, 0.85);
      const form = new FormData();
      form.append('image', compressed, 'avatar.jpg');
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) update('avatar', data.data.url);
    } catch (err) {
      console.error('Upload failed', err);
    }
    setUploading(false);
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview inmediato
    const localUrl = URL.createObjectURL(file);
    update('background_image', localUrl);
    setUploadingBg(true);
    try {
      const compressed = await compressImage(file, 1200, 0.80);
      const form = new FormData();
      form.append('image', compressed, 'background.jpg');
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) update('background_image', data.data.url);
    } catch (err) {
      console.error('Upload failed', err);
    }
    setUploadingBg(false);
  };

  // Slug validation
  const normalizeSlug = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 30);

  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      setSlugStatus(data ? 'taken' : 'available');
    } catch {
      setSlugStatus('idle');
    }
  }, []);

  const handleSlugChange = (val: string) => {
    const normalized = normalizeSlug(val);
    setSlugInput(normalized);
    update('slug', normalized);
    if (slugTimeout) clearTimeout(slugTimeout);
    const tid = setTimeout(() => checkSlugAvailability(normalized), 500);
    setSlugTimeoutId(tid);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = profile.links.findIndex(l => l.id === active.id);
      const newIndex = profile.links.findIndex(l => l.id === over.id);
      onChange({ ...profile, links: arrayMove(profile.links, oldIndex, newIndex) });
    }
  };

  return (
    <div className="space-y-5">
      <FormSection title="Perfil" description="Información básica de tu página">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Nombre</label>
          <input
            type="text" value={profile.name} onChange={(e) => update('name', e.target.value)}
            placeholder="Tu nombre" maxLength={50}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Bio <span className="text-xs">({profile.bio.length}/100)</span></label>
          <textarea
            value={profile.bio} onChange={(e) => update('bio', e.target.value.slice(0, 100))}
            placeholder="Una breve descripción" maxLength={100} rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Avatar</label>
          <div className="flex items-center gap-3">
            {profile.avatar && <img src={profile.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />}
            <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-secondary text-sm text-foreground hover:bg-muted transition-colors">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? 'Subiendo...' : 'Subir imagen'}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">URL personalizada</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">linkone.bio/u/</span>
            <input
              type="text" value={slugInput} onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="tu-nombre" maxLength={30}
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {slugStatus === 'checking' && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
            {slugStatus === 'available' && <Check size={16} className="text-green-500" />}
            {slugStatus === 'taken' && <X size={16} className="text-red-500" />}
          </div>
          {slugStatus === 'taken' && <p className="text-xs text-red-500 mt-1">Este nombre ya está en uso</p>}
          {slugStatus === 'available' && <p className="text-xs text-green-500 mt-1">¡Disponible!</p>}
          {slugInput.length > 0 && slugInput.length < 3 && <p className="text-xs text-muted-foreground mt-1">Mínimo 3 caracteres</p>}
        </div>
      </FormSection>

      <FormSection title="Template" description="Elige el diseño de tu página">
        <div className="flex gap-3 flex-wrap">
          {(['minimal', 'dark', 'gradient', 'background'] as TemplateType[]).map((t) => (
            <TemplateCard key={t} type={t} selected={profile.template === t} onClick={() => {
              // Solo resetear font_color si es el color por defecto del template anterior
              const prevDefault = (profile.template === 'dark' || profile.template === 'background') ? '#ffffff' : '#000000';
              const newDefault = (t === 'dark' || t === 'background') ? '#ffffff' : '#000000';
              const shouldReset = profile.font_color === prevDefault;
              onChange({ ...profile, template: t, font_color: shouldReset ? newDefault : profile.font_color });
            }} />
          ))}
        </div>
      </FormSection>

      {profile.template === 'gradient' && (
        <FormSection title="Colores" description="Color de acento y color de letra">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Acento</label>
              <ColorPicker selected={profile.accent_color} onChange={(c) => update('accent_color', c)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Letra</label>
              <ColorPicker selected={profile.font_color} onChange={(c) => update('font_color', c)} />
            </div>
          </div>
        </FormSection>
      )}

      {(profile.template === 'minimal' || profile.template === 'dark' || profile.template === 'background') && (
        <FormSection title="Color de letra" description="Personaliza el color del texto">
          <ColorPicker selected={profile.font_color} onChange={(c) => update('font_color', c)} />
        </FormSection>
      )}

      {profile.template === 'background' && (
        <FormSection title="Imagen de fondo" description="Sube una imagen para el fondo de tu página">
          <div className="flex items-center gap-3">
            {profile.background_image && (
              <img src={profile.background_image} alt="bg" className="w-16 h-10 rounded-md object-cover border border-input" />
            )}
            <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-secondary text-sm text-foreground hover:bg-muted transition-colors">
              {uploadingBg ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />}
              {uploadingBg ? 'Subiendo...' : 'Subir fondo'}
              <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
            </label>
          </div>
        </FormSection>
      )}



      <FormSection title="Redes sociales" description="Añade tus perfiles sociales">
        <div className="space-y-2">
          {SOCIAL_PLATFORMS.map((p) => (
            <SocialInput
              key={p.key} iconName={p.icon} label={p.label}
              value={(profile.social_links as any)?.[p.key] || ''}
              onChange={(v) => updateSocial(p.key, v)}
              placeholder={`URL de ${p.label}`}
            />
          ))}
        </div>
      </FormSection>

      <FormSection title="Links personalizados" description="Agrega botones a tu página">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={profile.links.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {profile.links.map((link) => (
                <LinkItem key={link.id} link={link} onUpdate={updateLink} onRemove={removeLink} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button
          onClick={addLink}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
        >
          <Plus size={14} /> Agregar link
        </button>
      </FormSection>

      <FormSection title="Captura de datos" description="Recibe mensajes de tus visitantes">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground font-medium">Formulario de contacto</p>
            <p className="text-xs text-muted-foreground">Los visitantes podrán enviarte sus datos</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={profile.enable_contact_form || false}
            onClick={() => update('enable_contact_form', !(profile.enable_contact_form || false))}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border-2 transition-colors focus:outline-none ${
              profile.enable_contact_form
                ? 'bg-primary border-primary'
                : 'bg-transparent border-foreground/30'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm ${
              profile.enable_contact_form
                ? 'translate-x-5 bg-white'
                : 'translate-x-0.5 bg-foreground/40'
            }`} />
          </button>
        </div>
      </FormSection>

      {onPublish && pricingOptions && pricingOptions.length > 0 && (
        <FormSection title="País y precio" description="Selecciona tu país para ver el precio">
          <select
            value={selectedPricing?.country_code || ''}
            onChange={(e) => {
              const opt = pricingOptions.find(p => p.country_code === e.target.value);
              if (opt) onPricingChange?.(opt);
            }}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {pricingOptions.map((opt) => (
              <option key={opt.country_code} value={opt.country_code}>
                {opt.country_name} — {opt.display_price}
              </option>
            ))}
          </select>
        </FormSection>
      )}

      {onPublish && (
        <button
          onClick={onPublish} disabled={isPublishing || slugStatus === 'taken'}
          className="w-full h-11 rounded-full gold-gradient text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPublishing && <Loader2 size={16} className="animate-spin" />}
          {selectedPricing ? `Pagar ${selectedPricing.display_price} y publicar` : publishLabel}
        </button>
      )}
    </div>
  );
};

export default ProfileEditorForm;
