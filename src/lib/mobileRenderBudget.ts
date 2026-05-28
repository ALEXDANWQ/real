export type Mobile3DMode = 'full3d' | 'fallback2d';

type DeviceHints = {
  hardwareConcurrency?: number;
  deviceMemory?: number;
};

export interface MobileRenderBudget {
  targetFps: number;
  uiCommitIntervalMs: number;
  canvasDprMax: number;
  anisotropyCap: number;
}

export interface Mobile3DPolicyInput {
  webglSupported: boolean;
  prefersReducedMotion: boolean;
  isMobile?: boolean;
  deviceHints?: DeviceHints;
}

export const isLowPerformanceDevice = (hints: DeviceHints = {}) => {
  const lowCpu = typeof hints.hardwareConcurrency === 'number' && hints.hardwareConcurrency > 0 && hints.hardwareConcurrency <= 4;
  const lowMemory = typeof hints.deviceMemory === 'number' && hints.deviceMemory > 0 && hints.deviceMemory <= 4;
  return lowCpu || lowMemory;
};

export const resolveMobile3DMode = (input: Mobile3DPolicyInput): Mobile3DMode => {
  if (!input.webglSupported) return 'fallback2d';
  if (!input.isMobile) return 'full3d';

  const hints = input.deviceHints ?? {};
  const cpuCores = hints.hardwareConcurrency ?? 0;
  const memoryGb = hints.deviceMemory ?? 0;
  const veryLowPerformance = (cpuCores > 0 && cpuCores <= 2) || (memoryGb > 0 && memoryGb <= 3);

  if (veryLowPerformance) return 'fallback2d';
  if (input.prefersReducedMotion && isLowPerformanceDevice(hints)) return 'fallback2d';

  return 'full3d';
};

export const getMobileRenderBudget = ({
  isMobile,
  prefersReducedMotion,
  deviceHints,
}: {
  isMobile: boolean;
  prefersReducedMotion: boolean;
  deviceHints?: DeviceHints;
}): MobileRenderBudget => {
  const lowPerformance = isLowPerformanceDevice(deviceHints);

  if (!isMobile) {
    return {
      targetFps: 60,
      uiCommitIntervalMs: prefersReducedMotion ? 64 : 22,
      canvasDprMax: 1.6,
      anisotropyCap: 8,
    };
  }

  if (lowPerformance) {
    return {
      targetFps: 45,
      uiCommitIntervalMs: prefersReducedMotion ? 82 : 38,
      canvasDprMax: 1.1,
      anisotropyCap: 2,
    };
  }

  return {
    targetFps: 55,
    uiCommitIntervalMs: prefersReducedMotion ? 72 : 30,
    canvasDprMax: 1.25,
    anisotropyCap: 4,
  };
};
