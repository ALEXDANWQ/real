export type CubeState = 'intact' | 'cracked' | 'destroyed';
export type SimulationStage = 'idle' | 'ramp' | 'crack' | 'failure' | 'complete';

export interface StrengthSimulationConfig {
  crackRatio: number;
  rampDurationMs: number;
  failureHoldMs: number;
}

export interface StrengthSimulationSnapshot {
  stage: SimulationStage;
  cubeState: CubeState;
  load: number;
  progressPercent: number;
  isShaking: boolean;
  isComplete: boolean;
}

export const DEFAULT_STRENGTH_SIMULATION_CONFIG: StrengthSimulationConfig = {
  crackRatio: 0.7,
  rampDurationMs: 5000,
  failureHoldMs: 500,
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export const getSimulationTotalDurationMs = (
  config: StrengthSimulationConfig = DEFAULT_STRENGTH_SIMULATION_CONFIG,
) => config.rampDurationMs + config.failureHoldMs;

export function getStrengthSimulationSnapshot(
  elapsedMs: number,
  maxLoad: number,
  config: StrengthSimulationConfig = DEFAULT_STRENGTH_SIMULATION_CONFIG,
): StrengthSimulationSnapshot {
  const safeMaxLoad = Math.max(0.001, maxLoad);
  const elapsedSafe = Math.max(0, elapsedMs);
  const rampProgress = clamp(elapsedSafe / config.rampDurationMs, 0, 1);
  const load = rampProgress * safeMaxLoad;
  const crackLoad = safeMaxLoad * config.crackRatio;
  const progressPercent = clamp((load / safeMaxLoad) * 100, 0, 100);

  if (elapsedSafe >= getSimulationTotalDurationMs(config)) {
    return {
      stage: 'complete',
      cubeState: 'destroyed',
      load: safeMaxLoad,
      progressPercent: 100,
      isShaking: false,
      isComplete: true,
    };
  }

  if (elapsedSafe >= config.rampDurationMs) {
    return {
      stage: 'failure',
      cubeState: 'destroyed',
      load: safeMaxLoad,
      progressPercent: 100,
      isShaking: true,
      isComplete: false,
    };
  }

  if (load >= crackLoad) {
    return {
      stage: 'crack',
      cubeState: 'cracked',
      load,
      progressPercent,
      isShaking: true,
      isComplete: false,
    };
  }

  return {
    stage: 'ramp',
    cubeState: 'intact',
    load,
    progressPercent,
    isShaking: false,
    isComplete: false,
  };
}
