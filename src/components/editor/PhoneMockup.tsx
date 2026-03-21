import { ReactNode } from 'react';

interface PhoneMockupProps {
  children: ReactNode;
}

const MOBILE_WIDTH = 390;
const MOCKUP_WIDTH = 260;
const SCALE = MOCKUP_WIDTH / MOBILE_WIDTH;
const MOCKUP_HEIGHT = 520;
const CONTENT_HEIGHT = MOCKUP_HEIGHT / SCALE;

const PhoneMockup = ({ children }: PhoneMockupProps) => {
  return (
    <div className="relative mx-auto" style={{ width: MOCKUP_WIDTH }}>
      <div className="relative rounded-[2rem] border-[5px] border-[#2a2a2a] bg-[#1a1a1a] shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#2a2a2a] rounded-b-xl z-10" />
        {/* Screen container */}
        <div style={{ height: MOCKUP_HEIGHT, overflow: 'hidden', position: 'relative' }}>
          {/* Scaler */}
          <div style={{
            width: MOBILE_WIDTH,
            height: CONTENT_HEIGHT,
            transform: `scale(${SCALE})`,
            transformOrigin: 'top left',
            overflow: 'hidden',
          }}>
            {/* Inner wrapper con altura completa para que min-h-full funcione */}
            <div style={{ minHeight: CONTENT_HEIGHT, display: 'flex', flexDirection: 'column' }}>
              {children}
            </div>
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
