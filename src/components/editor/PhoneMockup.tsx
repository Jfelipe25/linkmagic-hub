import { ReactNode } from 'react';

interface PhoneMockupProps {
  children: ReactNode;
}

const PhoneMockup = ({ children }: PhoneMockupProps) => {
  return (
    <div className="relative mx-auto" style={{ width: 300 }}>
      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-[6px] border-[#2a2a2a] bg-[#1a1a1a] shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#2a2a2a] rounded-b-2xl z-10" />
        {/* Screen */}
        <div className="relative w-full overflow-y-auto scrollbar-hide" style={{ height: 580 }}>
          {children}
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
