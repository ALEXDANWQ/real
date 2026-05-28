import { concreteClasses, type ConcreteClass } from '@/data/concreteClasses';

const SEA_WATER_DENSITY_KG_M3 = 1025;
const GRAVITY_M_S2 = 9.81;
const DEFAULT_RECOMMENDATION_RESERVE = 0.12;
const CRACK_WARNING_LOAD_RATIO = 0.7;
const STRENGTH_EPSILON = 1e-6;

const normalizeNonNegativeFinite = (value: number): number => (Number.isFinite(value) ? Math.max(value, 0) : 0);

// Hydrostatic relation p = rho * g * h for seawater conditions.
export const calcHydroDepthFromMpa = (mpa: number): number =>
  (normalizeNonNegativeFinite(mpa) * 1_000_000) / (SEA_WATER_DENSITY_KG_M3 * GRAVITY_M_S2);

export const calcEffectiveRequiredStrength = (
  baseMpa: number,
  loadMultiplier: number,
  envFactor: number,
): number => baseMpa * loadMultiplier * (1 + envFactor);

export const pickConcreteClassByStrength = (requiredMpa: number): ConcreteClass => {
  const sorted = [...concreteClasses].sort((a, b) => a.strengthMPa - b.strengthMPa);
  const normalizedRequiredMpa = normalizeNonNegativeFinite(requiredMpa);
  return (
    sorted.find((item) => item.strengthMPa + STRENGTH_EPSILON >= normalizedRequiredMpa) ??
    sorted[sorted.length - 1]
  );
};

export interface ConcreteClassRecommendation {
  minimumClass: ConcreteClass;
  recommendedClass: ConcreteClass;
  minimumRequiredMpa: number;
  recommendedRequiredMpa: number;
  actualReserveRatio: number;
  reserveRatio: number;
  crackSafeLoadRatio: number;
  isAboveCatalog: boolean;
}

export const buildConcreteClassRecommendation = (
  requiredMpa: number,
  reserveRatio = DEFAULT_RECOMMENDATION_RESERVE,
): ConcreteClassRecommendation => {
  const normalizedRequiredMpa = normalizeNonNegativeFinite(requiredMpa);
  const normalizedReserveRatio = Number.isFinite(reserveRatio)
    ? Math.min(Math.max(reserveRatio, 0), 1)
    : DEFAULT_RECOMMENDATION_RESERVE;
  const sorted = [...concreteClasses].sort((a, b) => a.strengthMPa - b.strengthMPa);
  const highestClass = sorted[sorted.length - 1];
  const minimumClass = pickConcreteClassByStrength(normalizedRequiredMpa);
  const reserveTargetMpa = normalizedRequiredMpa * (1 + normalizedReserveRatio);
  const crackSafeTargetMpa = normalizedRequiredMpa / CRACK_WARNING_LOAD_RATIO;
  const recommendedRequiredMpa = Math.max(reserveTargetMpa, crackSafeTargetMpa);
  const recommendedClass = pickConcreteClassByStrength(recommendedRequiredMpa);
  const actualReserveRatio =
    normalizedRequiredMpa > STRENGTH_EPSILON
      ? Math.max(recommendedClass.strengthMPa / normalizedRequiredMpa - 1, 0)
      : 0;

  return {
    minimumClass,
    recommendedClass,
    minimumRequiredMpa: normalizedRequiredMpa,
    recommendedRequiredMpa,
    actualReserveRatio,
    reserveRatio: normalizedReserveRatio,
    crackSafeLoadRatio: CRACK_WARNING_LOAD_RATIO,
    isAboveCatalog: recommendedRequiredMpa > highestClass.strengthMPa + STRENGTH_EPSILON,
  };
};

export const formatMpa = (value: number, digits = 1): string => `${value.toFixed(digits)} МПа`;
