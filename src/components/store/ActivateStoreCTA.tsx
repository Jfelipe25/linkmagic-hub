// src/components/store/ActivateStoreCTA.tsx
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Store, Loader2, ShoppingBag, MessageCircle, Image as ImageIcon, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  profileId: string;
  isPaid: boolean;
  countryCode?: string;
  displayPrice?: string;
}

const ActivateStoreCTA = ({ profileId, isPaid, countryCode, displayPrice }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!isPaid) {
      toast.error('Primero debes tener tu cuenta Pro activa');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('activate-store', {
        body: { profile_id: profileId, country_code: countryCode || 'CO' },
      });
      if (error) throw error;
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar el pago');
      setLoading(false);
    }
  };

  const features = [
    { icon: ShoppingBag, text: 'Catálogo de productos con precios' },
    { icon: ImageIcon, text: 'Fotos e imágenes por producto' },
    { icon: Tag, text: 'Organiza por categorías' },
    { icon: MessageCircle, text: 'Checkout directo por WhatsApp' },
  ];

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Store size={24} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">
            Activa tu tienda LinkOne
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Convierte tu link-in-bio en una tienda con catálogo y checkout por WhatsApp.
            Tus clientes arman el pedido y tú lo recibes listo por WhatsApp.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={12} className="text-primary" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {displayPrice || '$130.000 COP'}
                </span>
                <span className="text-xs text-muted-foreground">pago único</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Sin mensualidades. Se activa al instante.
              </p>
            </div>
            <button
              onClick={handleActivate}
              disabled={loading || !isPaid}
              className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Redirigiendo...</>
              ) : (
                <>Activar tienda</>
              )}
            </button>
          </div>

          {!isPaid && (
            <p className="text-xs text-amber-600 mt-3">
              Necesitas tener tu cuenta Pro activa para comprar el módulo de tienda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivateStoreCTA;
