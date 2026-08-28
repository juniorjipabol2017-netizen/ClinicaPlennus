import React from 'react';

interface PlennusLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'dark' | 'light' | 'indigo';
  customLogoUrl?: string;
}

export const PlennusLogo: React.FC<PlennusLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'indigo',
  customLogoUrl,
}) => {
  const dimensions = {
    sm: { icon: 'w-8 h-8', textTitle: 'text-[10px]', textBrand: 'text-sm', subText: 'text-[9px]' },
    md: { icon: 'w-11 h-11', textTitle: 'text-[11px]', textBrand: 'text-lg', subText: 'text-[10px]' },
    lg: { icon: 'w-16 h-16', textTitle: 'text-xs', textBrand: 'text-2xl', subText: 'text-xs' },
    xl: { icon: 'w-20 h-20', textTitle: 'text-sm', textBrand: 'text-3xl', subText: 'text-sm' },
  }[size];

  const textColorClasses = {
    indigo: {
      subtitle: 'text-slate-900 font-black tracking-tight',
      brand: 'text-[#4F46E5] font-light tracking-[0.2em]',
      handle: 'text-slate-400 font-medium tracking-widest',
    },
    dark: {
      subtitle: 'text-slate-900 font-black tracking-tight',
      brand: 'text-slate-900 font-black tracking-tight',
      handle: 'text-slate-500 font-medium tracking-widest',
    },
    light: {
      subtitle: 'text-white font-black tracking-tight',
      brand: 'text-indigo-200 font-light tracking-[0.2em]',
      handle: 'text-indigo-300 font-medium tracking-widest',
    },
  }[textColor] || {
    subtitle: 'text-slate-900 font-black tracking-tight',
    brand: 'text-[#4F46E5] font-light tracking-[0.2em]',
    handle: 'text-slate-400 font-medium tracking-widest',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {customLogoUrl ? (
        <img
          src={customLogoUrl}
          alt="Centro Médico Integrado Plennus"
          className={`${dimensions.icon} object-contain rounded-xl`}
        />
      ) : (
        <div
          className={`${dimensions.icon} bg-[#4F46E5] rounded-xl flex items-center justify-center shadow-md shadow-indigo-200/50 shrink-0 transition-transform duration-200 hover:scale-105`}
        >
          <div className="relative w-1/2 h-1/2 flex items-center justify-center">
            {/* Outer rotated square diamond */}
            <div className="absolute inset-0 border-2 border-white rounded-xs rotate-45"></div>
            {/* Concentric diamond overlay */}
            <div className="absolute inset-0 border-2 border-white/50 rounded-xs"></div>
            {/* Center geometric sky blue dot */}
            <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full shadow-xs"></div>
          </div>
        </div>
      )}

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${dimensions.textTitle} ${textColorClasses.subtitle} uppercase`}>
            CLÍNICA
          </span>
          <span className={`${dimensions.textBrand} ${textColorClasses.brand} uppercase`}>
            PLENNUS
          </span>
          <span className={`${dimensions.subText} ${textColorClasses.handle} uppercase mt-0.5`}>
            @plenn.us
          </span>
        </div>
      )}
    </div>
  );
};

export const ClinicLogo = PlennusLogo;
export default PlennusLogo;

