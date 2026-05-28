import realLogo from '@/assets/real-logo-traced.svg';

type ThemeMode = 'light' | 'dark';

interface GradeLogoProps {
  themeMode: ThemeMode;
  className?: string;
}

export function GradeLogo({ themeMode, className = '' }: GradeLogoProps) {
  void themeMode;

  const logoSizeClass = 'h-14 w-auto max-w-[140px] object-contain sm:h-16 sm:max-w-[160px] md:h-[72px] md:max-w-[176px]';
  const logoShadowClass = 'drop-shadow-[0_8px_16px_rgba(157,97,9,0.24)]';

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={realLogo}
        alt="REAL logo"
        width={240}
        height={240}
        loading="eager"
        decoding="async"
        draggable={false}
        className={`${logoSizeClass} ${logoShadowClass}`}
      />
    </div>
  );
}
