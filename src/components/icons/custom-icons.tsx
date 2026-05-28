import * as React from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import mapMenuIcon from '@/assets/location_pin_gps_placeholder_map_marker_icon_191619.png';
import scenarioMenuIcon from '@/assets/danger_triangle_icon_183758.png';

const createCustomIcon = (displayName: string, children: React.ReactNode): LucideIcon => {
  const Component = React.forwardRef<SVGSVGElement, LucideProps>(({ size = 24, color = 'currentColor', strokeWidth = 1.8, className, ...props }, ref) => (
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
  ));

  Component.displayName = displayName;
  return Component as unknown as LucideIcon;
};

export const IconLayers = createCustomIcon(
  'IconLayers',
  <>
    <path d="M12 3 3 7.6 12 12l9-4.4L12 3Z" />
    <path d="M3 12.5 12 17l9-4.5" />
    <path d="M3 17.4 12 22l9-4.6" />
  </>,
);

export const IconMap = createCustomIcon(
  'IconMap',
  <>
    <path d="M3 6.5 8.2 4l7.6 2.5L21 4v13.5l-5.2 2.5-7.6-2.5L3 20V6.5Z" />
    <path d="M8.2 4v13.5" />
    <path d="M15.8 6.5V20" />
    <path d="M12.8 7.8a2.3 2.3 0 1 1 4.6 0c0 1.9-2.3 4.4-2.3 4.4s-2.3-2.5-2.3-4.4Z" />
  </>,
);

export const IconHome = createCustomIcon(
  'IconHome',
  <>
    <path d="M3 10.7 12 3l9 7.7" />
    <path d="M5.2 9.8V21h13.6V9.8" />
    <path d="M10 21v-6h4v6" />
  </>,
);

export const IconBuilding = createCustomIcon(
  'IconBuilding',
  <>
    <path d="M4 21V5.8L12 3l8 2.8V21" />
    <path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
  </>,
);

export const IconBox = createCustomIcon(
  'IconBox',
  <>
    <path d="M12 2.8 4 7v10l8 4.2 8-4.2V7l-8-4.2Z" />
    <path d="M4 7 12 11l8-4" />
    <path d="M12 11v10.2" />
  </>,
);

export const IconColumns = createCustomIcon(
  'IconColumns',
  <>
    <path d="M3 7h18" />
    <path d="M5 7v11M9.7 7v11M14.3 7v11M19 7v11" />
    <path d="M3 18h18" />
    <path d="M2 21h20" />
    <path d="m12 3-9 4h18l-9-4Z" />
  </>,
);

export const IconBridge = createCustomIcon(
  'IconBridge',
  <>
    <path d="M6 19V9.2M18 19V9.2" />
    <path d="M6 12h12" />
    <path d="M6 9.2c1.8-1.8 3.8-2.7 6-2.7s4.2.9 6 2.7" />
    <path d="M4.3 12h1.2M18.5 12h1.2" />
  </>,
);

export const IconHighrise = createCustomIcon(
  'IconHighrise',
  <>
    <path d="M5 21V6.5h6V3h8v18" />
    <path d="M8.2 9h.01M11.2 9h.01M8.2 12h.01M11.2 12h.01M8.2 15h.01M11.2 15h.01M15 7h.01M18 7h.01M15 10h.01M18 10h.01M15 13h.01M18 13h.01" />
  </>,
);

export const IconTrain = createCustomIcon(
  'IconTrain',
  <>
    <rect x="5" y="4" width="14" height="13" rx="2.5" />
    <path d="M8.5 8.5h2.8M12.7 8.5h2.8" />
    <path d="M7 17.1 5.5 20M17 17.1 18.5 20" />
    <circle cx="9" cy="14" r="1" />
    <circle cx="15" cy="14" r="1" />
  </>,
);

const damOriginalPaths = [
  'M66,362.2643c12.4609,0,18.2617,4.3995,25.6055,9.9707,8.247,6.25,18.5058,14.0332,37.6953,14.0332,19.1943,0,29.4531-7.7832,37.7-14.0332,7.3486-5.5712,13.1543-9.9707,25.62-9.9707,12.456,0,18.2568,4.3995,25.5957,9.9707,8.2422,6.25,18.501,14.0332,37.6855,14.0332,19.1993,0,29.4629-7.7832,37.71-14.0332,7.3486-5.5712,13.1543-9.9707,25.625-9.9707,12.49,0,18.3008,4.3995,25.6592,9.9756,8.2519,6.25,18.52,14.0283,37.7246,14.0283s29.4727-7.7783,37.7295-14.0283c7.3535-5.5761,13.164-9.9756,25.6494-9.9756a10,10,0,0,0,0-20c-19.2041,0-29.4727,7.7784-37.7295,14.0284-7.3535,5.5761-13.1641,9.9755-25.6494,9.9755s-18.2959-4.3994-25.6494-9.9707c-8.2569-6.2548-18.5254-14.0332-37.7344-14.0332-19.1943,0-29.458,7.7784-37.7051,14.0332-7.3486,5.5713-13.1543,9.9707-25.63,9.9707-12.456,0-18.2568-4.3994-25.5957-9.9707-8.2421-6.25-18.5009-14.0332-37.6855-14.0332-19.1943,0-29.4531,7.7832-37.7,14.0332-7.3486,5.5713-13.1543,9.9707-25.62,9.9707-12.461,0-18.2617-4.3994-25.6055-9.9707C95.4482,350.0475,85.19,342.2643,66,342.2643a10,10,0,0,0,0,20Z',
  'M446,387.5329c-19.2041,0-29.4727,7.7783-37.7246,14.0283-7.3584,5.5713-13.169,9.9707-25.6543,9.9707s-18.2959-4.3994-25.6543-9.9707c-8.252-6.25-18.52-14.0283-37.7295-14.0283-19.1943,0-29.458,7.7783-37.7051,14.0283-7.3486,5.5713-13.1543,9.9707-25.63,9.9707-12.456,0-18.2568-4.3994-25.5957-9.9658-8.2421-6.2549-18.5009-14.0332-37.6855-14.0332-19.19,0-29.4531,7.7783-37.7,14.0283-7.3486,5.5713-13.1494,9.9707-25.62,9.9707-12.461,0-18.2617-4.3994-25.61-9.9658C95.4482,395.3112,85.19,387.5329,66,387.5329a10,10,0,0,0,0,20c12.4609,0,18.2617,4.3994,25.61,9.9658,8.2421,6.2549,18.5009,14.0332,37.69,14.0332s29.4531-7.7783,37.7-14.0283c7.3486-5.5713,13.1494-9.9707,25.62-9.9707,12.456,0,18.2568,4.3994,25.5957,9.9658,8.2422,6.2549,18.501,14.0332,37.6855,14.0332,19.1944,0,29.4629-7.7783,37.71-14.0283,7.3486-5.5713,13.1543-9.9707,25.625-9.9707,12.49,0,18.3008,4.3994,25.6592,9.9707,8.2519,6.25,18.52,14.0283,37.7246,14.0283s29.4727-7.7783,37.7246-14.0283c7.3584-5.5713,13.1689-9.9707,25.6543-9.9707a10,10,0,0,0,0-20Z',
  'M396.1855,340.3552c7.9957-6.0517,20.8289-15.661,41.919-17.663V80.4681H408.1417L384.7036,346.1334C388.73,345.8337,390.6527,344.5489,396.1855,340.3552Z',
  'M119.0939,210.426a43.7929,43.7929,0,0,1,17.8-31.5v-.1a43.8133,43.8133,0,0,1,25.9-8.4h54.8L204.1329,323.1487a73.09,73.09,0,0,1,31.5131,12.3291L246.6848,210.426a43.7933,43.7933,0,0,1,17.8-31.5v-.1a43.8134,43.8134,0,0,1,25.9-8.4h54.8L331.7117,323.2836a75.159,75.159,0,0,1,33.6664,14.3317L388.0648,80.4681H98.1045L76.7037,323.0132a72.96,72.96,0,0,1,31.4038,11.8659Zm149.6905-80h80l-1.8,20.0024h-56.6a63.6848,63.6848,0,0,0-23.8007,4.7638Zm-127.5909,0h80l-1.8,20.0024h-56.6a63.6847,63.6847,0,0,0-23.8006,4.7638Z',
] as const;

export const IconDam = React.forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill={color}
      className={className}
      {...props}
    >
      {damOriginalPaths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  ),
) as unknown as LucideIcon;
IconDam.displayName = 'IconDam';

export const IconWater = createCustomIcon(
  'IconWater',
  <>
    <path d="M6 6h12v8H6z" fill="currentColor" fillOpacity="0.16" stroke="none" />
    <path d="M6 14h12" />
    <path d="M8.2 14V8.8M12 14V7.6M15.8 14V8.8" />
    <path d="M4 18c1-.9 1.8-1.3 2.7-1.3 1.7 0 2.4 1.9 4.1 1.9.9 0 1.8-.4 2.7-1.3" />
    <path d="M10.5 20c1-.9 1.8-1.3 2.7-1.3 1.7 0 2.4 1.9 4.1 1.9.9 0 1.8-.4 2.7-1.3" />
  </>,
);

export const IconArrowDown = createCustomIcon(
  'IconArrowDown',
  <>
    <path d="M12 4v13" />
    <path d="m7.5 12.5 4.5 4.5 4.5-4.5" />
  </>,
);

export const IconActivity = createCustomIcon(
  'IconActivity',
  <>
    <path d="M3 12h3.2l2-4.2 3.2 8.4 2.2-5.2H21" />
  </>,
);

export const IconZap = createCustomIcon(
  'IconZap',
  <>
    <path d="M13.3 2 6.2 12.1h4.5L9.7 22l8.1-11.2h-4.5z" />
  </>,
);

export const IconDumbbell = createCustomIcon(
  'IconDumbbell',
  <>
    <path d="M3.5 10v4M6 9v6M18 9v6M20.5 10v4" />
    <path d="M6 12h12" />
  </>,
);

export const IconSun = createCustomIcon(
  'IconSun',
  <>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5M18.7 18.7l-1.5-1.5M6.8 6.8 5.3 5.3" />
  </>,
);

export const IconDroplets = createCustomIcon(
  'IconDroplets',
  <>
    <path d="M12 3.2c2.7 3.4 4 5.7 4 7.6A4 4 0 1 1 8 10.8c0-1.9 1.3-4.2 4-7.6Z" />
    <path d="M6.2 8.2c1.5 1.8 2.2 3.1 2.2 4.1a2.2 2.2 0 1 1-4.4 0c0-1 .7-2.3 2.2-4.1Z" />
  </>,
);

export const IconSnowflake = createCustomIcon(
  'IconSnowflake',
  <>
    <path d="M12 2.8v18.4" />
    <path d="m7.4 5.2 9.2 13.6" />
    <path d="m16.6 5.2-9.2 13.6" />
    <path d="m9.8 4 2.2 1.2L14.2 4" />
    <path d="m9.8 20 2.2-1.2 2.2 1.2" />
  </>,
);

export const IconHazard = createCustomIcon(
  'IconHazard',
  <>
    <path d="M12 4.1 4.1 19h15.8L12 4.1Z" />
    <path d="M12 9v4.9" />
    <circle cx="12" cy="16.4" r="1.05" />
  </>,
);

export const IconPerson = createCustomIcon(
  'IconPerson',
  <>
    <circle cx="12" cy="7" r="3" />
    <path d="M6.5 21c.8-3.5 2.8-5.2 5.5-5.2S16.7 17.5 17.5 21" />
  </>,
);

export const IconCar = createCustomIcon(
  'IconCar',
  <>
    <path d="M6.5 13.8 8 10.1a1.9 1.9 0 0 1 1.8-1.2h4.4a1.9 1.9 0 0 1 1.8 1.2l1.5 3.7" />
    <rect x="4.2" y="13.6" width="15.6" height="3.9" rx="1.4" />
    <circle cx="8" cy="17.6" r="1.2" />
    <circle cx="16" cy="17.6" r="1.2" />
  </>,
);

export const IconBook = createCustomIcon(
  'IconBook',
  <>
    <rect x="4.2" y="4.4" width="15.6" height="4.2" rx="1.2" />
    <path d="M8.1 4.4v4.2" />
    <rect x="3.4" y="9.9" width="16.4" height="4.2" rx="1.2" />
    <path d="M12 9.9v4.2" />
    <rect x="4.2" y="15.4" width="15.6" height="4.2" rx="1.2" />
    <path d="M15.9 15.4v4.2" />
  </>,
);

export const IconHand = createCustomIcon(
  'IconHand',
  <>
    <path d="M8.8 13V8.8a1.2 1.2 0 1 1 2.4 0V13" />
    <path d="M11.2 13V7.8a1.2 1.2 0 1 1 2.4 0V13" />
    <path d="M13.6 13V8.5a1.2 1.2 0 1 1 2.4 0v4.8" />
    <path d="M16 13.4v-3.2a1.2 1.2 0 1 1 2.4 0v3.7c0 3.2-2.2 5.3-5.3 5.3H10c-1.2 0-2.1-.5-2.8-1.6l-1.5-2.6a1 1 0 1 1 1.8-.9L8.6 16h.2" />
  </>,
);

export const IconWeight = createCustomIcon(
  'IconWeight',
  <>
    <path d="M12 4.1v4.1" />
    <path d="m9.9 6.7 2.1 2.1 2.1-2.1" />
    <rect x="3.8" y="10.2" width="16.4" height="7.2" rx="2.1" />
    <path d="M7.5 13.8h9" />
    <path d="M7.7 17.4v2.1M16.3 17.4v2.1" />
  </>,
);

export const IconShip = createCustomIcon(
  'IconShip',
  <>
    <path d="M12 3v7" />
    <path d="M12 5.5h4l-4 2.2" />
    <path d="M4 12.2h16l-1.8 5.3H5.8L4 12.2Z" />
    <path d="M3 19.2c1 .8 2 .8 3 0s2-.8 3 0 2 .8 3 0 2-.8 3 0 2 .8 3 0 2-.8 3 0" />
  </>,
);

export const IconLab = createCustomIcon(
  'IconLab',
  <>
    <path d="M9 3h6" />
    <path d="M10 3v4.5L4.8 18a2 2 0 0 0 1.8 3h10.8a2 2 0 0 0 1.8-3L14 7.5V3" />
    <path d="M8.2 14h7.6" />
  </>,
);

export const IconLandmark = createCustomIcon(
  'IconLandmark',
  <>
    <path d="m12 3-9 4h18l-9-4Z" />
    <path d="M5 7v8M9.5 7v8M14.5 7v8M19 7v8" />
    <path d="M3 15h18" />
    <path d="M2.5 21h19" />
  </>,
);

export const IconScenario = React.forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', className, ...props }, ref) => {
    const uniqueId = React.useId().replace(/:/g, '');
    const maskId = `icon-scenario-mask-${uniqueId}`;

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        {...props}
      >
        <mask id={maskId} x="0" y="0" width="24" height="24" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
          <image href={scenarioMenuIcon} x="0" y="0" width="24" height="24" preserveAspectRatio="xMidYMid meet" />
        </mask>
        <rect x="0" y="0" width="24" height="24" fill={color} mask={`url(#${maskId})`} />
      </svg>
    );
  },
) as unknown as LucideIcon;
IconScenario.displayName = 'IconScenario';

export const IconMapSection = React.forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = 'currentColor', className, ...props }, ref) => {
    const uniqueId = React.useId().replace(/:/g, '');
    const maskId = `icon-map-section-mask-${uniqueId}`;

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        {...props}
      >
        <mask id={maskId} x="0" y="0" width="24" height="24" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
          <image href={mapMenuIcon} x="-1.8" y="-1.8" width="27.6" height="27.6" preserveAspectRatio="xMidYMid meet" />
        </mask>
        <rect x="0" y="0" width="24" height="24" fill={color} mask={`url(#${maskId})`} />
      </svg>
    );
  },
) as unknown as LucideIcon;
IconMapSection.displayName = 'IconMapSection';

export const IconComparator = IconActivity;
export const IconSelector = IconLab;
export const IconClasses = IconLayers;
