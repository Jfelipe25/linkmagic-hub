import { useState, useCallback } from 'react';
import { Plus, Upload, Loader2 } from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { ProfileData, CustomLink, SOCIAL_PLATFORMS, TemplateType } from '@/types/profile';
import FormSection from './FormSection';
import SocialInput from './SocialInput';
import LinkItem from './LinkItem';
import ColorPicker from './ColorPicker';
import TemplateCard from './TemplateCard';

interface ProfileEditorFormProps {
  profile: ProfileData;
  onChange: (profile: ProfileData) => void;
  onPublish?: () => void;
  publishLabel?: string;
  isPublishing?: boolean;
}

const IMGBB_API_KEY = '6adb05b927a84a01cc6266417c3198dd';

const ProfileEditorForm = ({ profile, onChange, onPublish, publishLabel = 'Publicar · $5 USD', isPublishing }: ProfileEditorFormProps) => {
  const [uploading, setUploading] = useState(false);

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

  const updateLink = useCallback((id: string, field: 'label' | 'url', value: string) => {
    onChange({
      ...profile,
      links: profile.links.map(l => l.id === id ? { ...l, [field]: value } : l),
    });
  }, [profile, onChange]);

  const removeLink = useCallback((id: string) => {
    onChange({ ...profile, links: profile.links.filter(l => l.id !== id) });
  }, [profile, onChange]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) update('avatar', data.data.url);
    } catch (err) {
      console.error('Upload failed', err);
    }
    setUploading(false);
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
      </FormSection>

      <FormSection title="Template" description="Elige el diseño de tu página">
        <div className="flex gap-3">
          {(['minimal', 'dark', 'gradient'] as TemplateType[]).map((t) => (
            <TemplateCard key={t} type={t} selected={profile.template === t} onClick={() => update('template', t)} />
          ))}
        </div>
      </FormSection>

      <FormSection title="Color de acento" description="Personaliza el color principal">
        <ColorPicker selected={profile.accent_color} onChange={(c) => update('accent_color', c)} />
      </FormSection>

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

      {onPublish && (
        <button
          onClick={onPublish} disabled={isPublishing}
          className="w-full h-11 rounded-full gold-gradient text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPublishing && <Loader2 size={16} className="animate-spin" />}
          {publishLabel}
        </button>
      )}
    </div>
  );
};

export default ProfileEditorForm;
