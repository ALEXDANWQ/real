import * as React from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import { IconBook, IconCar, IconDam, IconHand, IconWeight } from '@/components/icons/custom-icons';
import type { IconName } from '@/lib/iconMap';

const createPremiumIcon = (displayName: string, children: React.ReactNode): LucideIcon => {
  const Component = React.forwardRef<SVGSVGElement, LucideProps>(
    ({ size = 24, color = 'currentColor', strokeWidth = 1.65, className, ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {children}
      </svg>
    ),
  );

  Component.displayName = displayName;
  return Component as unknown as LucideIcon;
};

const PremiumPerson = createPremiumIcon(
  'PremiumPerson',
  <>
    <circle cx="12" cy="5.8" r="2.2" />
    <path d="M12 8.1v6.1" />
    <path d="M8.8 11.2h6.4" />
    <path d="M12 14.2 9.4 19" />
    <path d="M12 14.2 14.6 19" />
  </>,
);

const PremiumHome = createPremiumIcon(
  'PremiumHome',
  <>
    <path d="m4.2 10.3 7.8-6.1 7.8 6.1" />
    <path d="M6.2 9.2V20h11.6V9.2" />
    <path d="M10.2 20v-5.1h3.6V20" />
  </>,
);

const PremiumBuilding = createPremiumIcon(
  'PremiumBuilding',
  <>
    <path d="M4.9 20V6.2L12 3.8l7.1 2.4V20" />
    <path d="M8.3 9.1h.01M12 9.1h.01M15.7 9.1h.01M8.3 12.6h.01M12 12.6h.01M15.7 12.6h.01M8.3 16.1h.01M12 16.1h.01M15.7 16.1h.01" />
    <path d="M12 20v-2.4" />
  </>,
);

const PremiumBridge = createPremiumIcon(
  'PremiumBridge',
  <>
    <path d="M6 19V9.2M18 19V9.2" />
    <path d="M6 12h12" />
    <path d="M6 9.2c1.8-1.8 3.8-2.7 6-2.7s4.2.9 6 2.7" />
    <path d="M4.3 12h1.2M18.5 12h1.2" />
  </>,
);

const PremiumShip = createPremiumIcon(
  'PremiumShip',
  <>
    <path d="M11.8 4.1v6.3" />
    <path d="M11.8 6.1h3.2l-3.2 1.8" />
    <path d="M4.6 12.4h14.8l-1.7 5.1H6.3l-1.7-5.1Z" />
    <path d="M3.2 19.1c.9.8 1.8.8 2.7 0s1.8-.8 2.7 0 1.8.8 2.7 0 1.8-.8 2.7 0 1.8.8 2.7 0 1.8-.8 2.7 0" />
  </>,
);

const premiumWhatIfIconMap: Partial<Record<IconName, LucideIcon>> = {
  person: PremiumPerson,
  car: IconCar,
  home: PremiumHome,
  building: PremiumBuilding,
  bridge: PremiumBridge,
  dam: IconDam,
};

const premiumComparatorIconMap: Partial<Record<IconName, LucideIcon>> = {
  hand: IconHand,
  book: IconBook,
  car: IconCar,
  weight: IconWeight,
  person: PremiumPerson,
  ship: PremiumShip,
};

export const getPremiumWhatIfIcon = (name: IconName): LucideIcon | null => premiumWhatIfIconMap[name] ?? null;

export const getPremiumComparatorIcon = (name: IconName): LucideIcon | null => premiumComparatorIconMap[name] ?? null;
