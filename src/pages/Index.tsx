import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProfileData, DEFAULT_PROFILE } from '@/types/profile';
import ProfileEditorForm from '@/components/editor/ProfileEditorForm';
import PhoneMockup from '@/components/editor/PhoneMockup';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const [profile, setProfile] = useState<ProfileData>({ ...DEFAULT_PROFILE });
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!profile.name.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }
    setPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: profile,
      });
      if (error) throw error;
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        toast.error('Error al crear el pago');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar');
    }
    setPublishing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold gold-text">LinkBio Pro</h1>
          <span className="text-xs text-muted-foreground">Tu link-in-bio profesional</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5 max-h-[calc(100vh-140px)] overflow-y-auto pr-2"
          >
            <ProfileEditorForm
              profile={profile}
              onChange={setProfile}
              onPublish={handlePublish}
              isPublishing={publishing}
            />
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex items-start justify-center sticky top-8"
          >
            <PhoneMockup>
              <TemplateRenderer profile={profile} />
            </PhoneMockup>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
