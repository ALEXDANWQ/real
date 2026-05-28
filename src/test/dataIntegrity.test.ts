import { describe, expect, it } from 'vitest';
import { concreteClasses } from '@/data/concreteClasses';
import { spbBuildings } from '@/data/spbBuildings';

describe('data integrity', () => {
  it('keeps concrete classes strictly increasing by strength', () => {
    for (let i = 1; i < concreteClasses.length; i += 1) {
      expect(concreteClasses[i].strengthMPa).toBeGreaterThan(concreteClasses[i - 1].strengthMPa);
    }
  });

  it('keeps exactly 20 buildings and unique identifiers', () => {
    expect(spbBuildings).toHaveLength(20);

    const ids = new Set(spbBuildings.map((item) => item.id));
    const names = new Set(spbBuildings.map((item) => item.name));

    expect(ids.size).toBe(spbBuildings.length);
    expect(names.size).toBe(spbBuildings.length);
  });

  it('references only known concrete classes', () => {
    const available = new Set(concreteClasses.map((item) => item.name));
    for (const building of spbBuildings) {
      expect(available.has(building.concreteClass)).toBe(true);
    }
  });

  it('keeps coordinates in Saint Petersburg area and years in plausible range', () => {
    for (const building of spbBuildings) {
      const [lat, lon] = building.coordinates;
      expect(lat).toBeGreaterThanOrEqual(59.7);
      expect(lat).toBeLessThanOrEqual(60.1);
      expect(lon).toBeGreaterThanOrEqual(29.6);
      expect(lon).toBeLessThanOrEqual(30.6);

      if (building.yearBuilt != null) {
        expect(building.yearBuilt).toBeGreaterThanOrEqual(1800);
        expect(building.yearBuilt).toBeLessThanOrEqual(2026);
      }
    }
  });

  it('uses https source URLs where provided', () => {
    for (const building of spbBuildings) {
      if (building.sourceUrl) {
        expect(building.sourceUrl.startsWith('https://')).toBe(true);
      }
    }
  });
});
