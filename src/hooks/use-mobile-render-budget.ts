import { useEffect, useMemo, useState } from 'react';
import { getMobileRenderBudget, type MobileRenderBudget } from '@/lib/mobileRenderBudget';

export interface RuntimeDeviceHints {
  hardwareConcurrency?: number;
  deviceMemory?: number;
}

const MOBILE_QUERY = '(max-width: 1023px), (pointer: coarse)';

const readDeviceHints = (): RuntimeDeviceHints => {
  if (typeof navigator === 'undefined') {
    return {};
  }

  const navigatorWithHints = navigator as Navigator & { deviceMemory?: number };
  return {
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigatorWithHints.deviceMemory,
  };
};

const getInitialIsMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_QUERY).matches;
};

export function useMobileRenderBudget(prefersReducedMotion: boolean): {
  isMobile: boolean;
  deviceHints: RuntimeDeviceHints;
  budget: MobileRenderBudget;
} {
  const [isMobile, setIsMobile] = useState(getInitialIsMobile);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  const deviceHints = useMemo(() => readDeviceHints(), []);

  const budget = useMemo(
    () =>
      getMobileRenderBudget({
        isMobile,
        prefersReducedMotion,
        deviceHints,
      }),
    [deviceHints, isMobile, prefersReducedMotion],
  );

  return { isMobile, deviceHints, budget };
}
