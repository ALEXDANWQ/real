import { describe, expect, it } from 'vitest';
import { getMobileRenderBudget, resolveMobile3DMode } from '@/lib/mobileRenderBudget';

describe('mobile render budget and 3D policy', () => {
  it('keeps full 3D mode on desktop even for low-end hints when WebGL is available', () => {
    const mode = resolveMobile3DMode({
      webglSupported: true,
      prefersReducedMotion: false,
      isMobile: false,
      deviceHints: {
        hardwareConcurrency: 2,
        deviceMemory: 2,
      },
    });

    expect(mode).toBe('full3d');
  });

  it('falls back to 2D only when WebGL is not available', () => {
    const mode = resolveMobile3DMode({
      webglSupported: false,
      prefersReducedMotion: false,
      isMobile: true,
      deviceHints: {
        hardwareConcurrency: 16,
        deviceMemory: 8,
      },
    });

    expect(mode).toBe('fallback2d');
  });

  it('falls back to 2D on very low-end mobile devices', () => {
    const mode = resolveMobile3DMode({
      webglSupported: true,
      prefersReducedMotion: false,
      isMobile: true,
      deviceHints: {
        hardwareConcurrency: 2,
        deviceMemory: 3,
      },
    });

    expect(mode).toBe('fallback2d');
  });

  it('uses tighter mobile budget on low-end mobile devices', () => {
    const budget = getMobileRenderBudget({
      isMobile: true,
      prefersReducedMotion: false,
      deviceHints: {
        hardwareConcurrency: 4,
        deviceMemory: 3,
      },
    });

    expect(budget.targetFps).toBe(45);
    expect(budget.canvasDprMax).toBeLessThanOrEqual(1.1);
    expect(budget.uiCommitIntervalMs).toBeGreaterThanOrEqual(38);
  });
});
