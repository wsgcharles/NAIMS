import React from 'react';

interface NoahLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  lightText?: boolean;
}

export const NoahLogo: React.FC<NoahLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  lightText = false, // Default to dark text for light navigation bars
}) => {
  const sizePixels = {
    sm: 42,
    md: 58,
    lg: 64,
    xl: 74,
  }[size];

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Official Noah's Academy Inc. Taguig City Seal Emblem */}
      <div
        className="relative shrink-0 rounded-full shadow-md transition-transform hover:scale-105 border-2 border-amber-400 overflow-hidden bg-white p-0.5"
        style={{ width: sizePixels, height: sizePixels }}
      >
        <img
          src="/noahs-logo.png"
          alt="Noah's Academy Incorporated Official Seal (Founded 2002 · Taguig City)"
          className="w-full h-full object-contain rounded-full"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span
            className={`font-black tracking-tight leading-none uppercase ${
              size === 'sm'
                ? 'text-sm'
                : size === 'md'
                ? 'text-base sm:text-lg'
                : size === 'lg'
                ? 'text-lg sm:text-xl'
                : 'text-xl sm:text-2xl'
            } ${lightText ? 'text-white' : 'text-[#4C1D95]'}`}
          >
            Noah's Academy Inc.
          </span>
          <span
            className={`font-bold tracking-wider uppercase text-[10px] sm:text-[11px] mt-1 ${
              lightText ? 'text-amber-300' : 'text-[#64748B]'
            }`}
          >
            Arca South Campus · Taguig City
          </span>
        </div>
      )}
    </div>
  );
};
