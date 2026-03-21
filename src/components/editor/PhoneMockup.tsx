import { ReactNode } from 'react';

interface PhoneMockupProps {
  children: ReactNode;
}

// Ancho real de móvil que se simula
const MOBILE_WIDTH = 390;
// Ancho visual del mockup
const MOCKUP_WIDTH = 260;
// Escala: mockup / real
const SCALE = MOCKUP_WIDTH / MOBILE_WIDTH;
// Alto visual del mockup
const MOCKUP_HEIGHT = 520;
// Alto real del contenido (lo que ve el usuario en el celular)
const CONTENT_HEIGHT = MOCKUP_HEIGHT / SCALE;

const PhoneMockup = ({ children }: PhoneMockupProps) => {
  return (
    <div className="relative mx-auto" style={{ width: MOCKUP_WIDTH }}>
      {/* Phone frame */}
      <div className="relative rounded-[2rem] border-[5px] border-[#2a2a2a] bg-[#1a1a1a] shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#2a2a2a] rounded-b-xl z-10" />
        {/* Screen container - tamaño visual */}
        <div style={{ height: MOCKUP_HEIGHT, overflow: 'hidden', position: 'relative' }}>
          {/* Inner scaler - renderiza a tamaño real y escala */}
          <div style={{
            width: MOBILE_WIDTH,
            height: CONTENT_HEIGHT,
            transform: `scale(${SCALE})`,
            transformOrigin: 'top left',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}>
            {children}
          </div>
        </div>
        {/* Home indicator */}
        <div className="flex justify-center pb-2 pt-1 bg-[#1a1a1a]">
          <div className="w-24 h-1 rounded-full bg-[#444]" />
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
