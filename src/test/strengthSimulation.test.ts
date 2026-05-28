import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STRENGTH_SIMULATION_CONFIG,
  getSimulationTotalDurationMs,
  getStrengthSimulationSnapshot,
} from '@/lib/strengthSimulation';

describe('strength simulation', () => {
  const maxLoad = 32.7;

  it('starts in ramp state with zero load', () => {
    const snapshot = getStrengthSimulationSnapshot(0, maxLoad, DEFAULT_STRENGTH_SIMULATION_CONFIG);
    expect(snapshot.stage).toBe('ramp');
    expect(snapshot.cubeState).toBe('intact');
    expect(snapshot.load).toBe(0);
    expect(snapshot.isComplete).toBe(false);
  });

  it('switches to crack state after crack ratio threshold', () => {
    const elapsed = DEFAULT_STRENGTH_SIMULATION_CONFIG.rampDurationMs * 0.8;
    const snapshot = getStrengthSimulationSnapshot(elapsed, maxLoad, DEFAULT_STRENGTH_SIMULATION_CONFIG);
    expect(snapshot.stage).toBe('crack');
    expect(snapshot.cubeState).toBe('cracked');
    expect(snapshot.isShaking).toBe(true);
  });

  it('switches to failure at ramp end', () => {
    const elapsed = DEFAULT_STRENGTH_SIMULATION_CONFIG.rampDurationMs;
    const snapshot = getStrengthSimulationSnapshot(elapsed, maxLoad, DEFAULT_STRENGTH_SIMULATION_CONFIG);
    expect(snapshot.stage).toBe('failure');
    expect(snapshot.cubeState).toBe('destroyed');
    expect(snapshot.load).toBeCloseTo(maxLoad, 4);
  });

  it('switches to complete after hold duration', () => {
    const elapsed = getSimulationTotalDurationMs(DEFAULT_STRENGTH_SIMULATION_CONFIG) + 1;
    const snapshot = getStrengthSimulationSnapshot(elapsed, maxLoad, DEFAULT_STRENGTH_SIMULATION_CONFIG);
    expect(snapshot.stage).toBe('complete');
    expect(snapshot.isComplete).toBe(true);
    expect(snapshot.isShaking).toBe(false);
  });

  it('clamps negative elapsed values', () => {
    const snapshot = getStrengthSimulationSnapshot(-100, maxLoad, DEFAULT_STRENGTH_SIMULATION_CONFIG);
    expect(snapshot.load).toBe(0);
    expect(snapshot.progressPercent).toBe(0);
  });
});
