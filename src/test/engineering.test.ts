import { describe, expect, it } from 'vitest';
import { concreteClasses } from '@/data/concreteClasses';
import {
  buildConcreteClassRecommendation,
  calcEffectiveRequiredStrength,
  calcHydroDepthFromMpa,
  formatMpa,
  pickConcreteClassByStrength,
} from '@/lib/engineering';

describe('engineering helpers', () => {
  it('contains extended class range up to B90', () => {
    expect(concreteClasses[0].name).toBe('B10');
    expect(concreteClasses[concreteClasses.length - 1].name).toBe('B90');
  });

  it('picks exact class when strength matches boundary', () => {
    const exact = concreteClasses[3];
    const selected = pickConcreteClassByStrength(exact.strengthMPa);
    expect(selected.name).toBe(exact.name);
  });

  it('picks nearest higher class for in-between strength', () => {
    const selected = pickConcreteClassByStrength(40);
    expect(selected.name).toBe('B35');
  });

  it('picks highest class for overflow strength', () => {
    const selected = pickConcreteClassByStrength(200);
    expect(selected.name).toBe(concreteClasses[concreteClasses.length - 1].name);
  });

  it('builds minimum and recommended classes with crack-safe reserve margin', () => {
    const recommendation = buildConcreteClassRecommendation(52, 0.12);
    expect(recommendation.minimumClass.name).toBe('B40');
    expect(recommendation.recommendedClass.name).toBe('B60');
    expect(recommendation.recommendedRequiredMpa).toBeCloseTo(74.29, 2);
    expect(recommendation.actualReserveRatio).toBeGreaterThanOrEqual(0.12);
    expect(recommendation.isAboveCatalog).toBe(false);
  });

  it('marks recommendation as above catalog when required strength exceeds max range', () => {
    const recommendation = buildConcreteClassRecommendation(200, 0.12);
    expect(recommendation.minimumClass.name).toBe('B90');
    expect(recommendation.recommendedClass.name).toBe('B90');
    expect(recommendation.isAboveCatalog).toBe(true);
  });

  it('keeps recommended class outside crack-risk zone', () => {
    const recommendation = buildConcreteClassRecommendation(32, 0.12);
    const utilization = 32 / recommendation.recommendedClass.strengthMPa;

    expect(utilization).toBeLessThanOrEqual(recommendation.crackSafeLoadRatio + 1e-6);
    expect(recommendation.recommendedClass.name).toBe('B35');
  });

  it('keeps recommendation crack-safe whenever catalog range allows it', () => {
    const requiredLoads = [15, 20, 25, 32, 45, 60, 90];

    for (const load of requiredLoads) {
      const recommendation = buildConcreteClassRecommendation(load, 0.12);
      const utilization = load / recommendation.recommendedClass.strengthMPa;

      expect(recommendation.isAboveCatalog || utilization <= recommendation.crackSafeLoadRatio + 1e-6).toBe(true);
    }
  });

  it('keeps boundary class stable for exact and near-exact values', () => {
    const boundaryStrength = concreteClasses.find((item) => item.name === 'B30')?.strengthMPa ?? 39.3;
    const exact = pickConcreteClassByStrength(boundaryStrength);
    const near = pickConcreteClassByStrength(boundaryStrength + 1e-7);
    expect(exact.name).toBe('B30');
    expect(near.name).toBe('B30');
  });

  it('normalizes invalid and negative required strength for recommendations', () => {
    const recommendationFromNegative = buildConcreteClassRecommendation(-5, 0.12);
    const recommendationFromNaN = buildConcreteClassRecommendation(Number.NaN, 0.12);
    expect(recommendationFromNegative.minimumClass.name).toBe('B10');
    expect(recommendationFromNaN.minimumClass.name).toBe('B10');
  });

  it('converts MPa to hydro depth with seawater hydrostatics', () => {
    expect(calcHydroDepthFromMpa(1)).toBeCloseTo(99.45, 2);
    expect(calcHydroDepthFromMpa(32.7)).toBeCloseTo(3252.03, 2);
  });

  it('calculates effective required strength from load and environment factors', () => {
    const required = calcEffectiveRequiredStrength(30, 1.2, 0.1);
    expect(required).toBeCloseTo(39.6, 5);
  });

  it('formats MPa values with requested precision', () => {
    expect(formatMpa(32.74)).toBe('32.7 МПа');
    expect(formatMpa(32.74, 2)).toBe('32.74 МПа');
  });
});
