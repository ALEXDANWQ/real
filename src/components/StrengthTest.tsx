import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Gauge, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ConcreteClass } from '@/data/concreteClasses';
import { formatMpa } from '@/lib/engineering';
import {
  DEFAULT_STRENGTH_SIMULATION_CONFIG,
  getStrengthSimulationSnapshot,
  type CubeState,
} from '@/lib/strengthSimulation';
import { ComparisonModule } from './ComparisonModule';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useMobileRenderBudget } from '@/hooks/use-mobile-render-budget';

const Cube3D = lazy(() => import('./Cube3D').then((mod) => ({ default: mod.Cube3D })));

interface StrengthTestProps {
  concreteClass: ConcreteClass;
  compact?: boolean;
}

type TestState = 'idle' | 'running' | 'paused' | 'complete';

interface SimulationViewState {
  currentLoad: number;
  cubeState: CubeState;
  isShaking: boolean;
}

const INITIAL_VIEW_STATE: SimulationViewState = {
  currentLoad: 0,
  cubeState: 'intact',
  isShaking: false,
};

const roundLoad = (value: number) => Math.round(value * 10) / 10;

export function StrengthTest({ concreteClass, compact = false }: StrengthTestProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { budget } = useMobileRenderBudget(reducedMotion);
  const [testState, setTestState] = useState<TestState>('idle');
  const [viewState, setViewState] = useState<SimulationViewState>(INITIAL_VIEW_STATE);

  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const elapsedMsRef = useRef(0);
  const viewStateRef = useRef<SimulationViewState>(INITIAL_VIEW_STATE);
  const lastUiCommitRef = useRef(0);

  const maxLoad = concreteClass.strengthMPa;
  const previewHeightClass = compact ? 'h-[clamp(220px,34vh,320px)]' : 'h-[clamp(300px,46vh,520px)]';
  const safeMaxLoad = maxLoad > 0 ? maxLoad : 1;
  const crackThreshold = maxLoad * DEFAULT_STRENGTH_SIMULATION_CONFIG.crackRatio;
  const progressPercent = Math.min(Math.max((viewState.currentLoad / safeMaxLoad) * 100, 0), 100);
  const crackPercent = Math.min(Math.max((crackThreshold / safeMaxLoad) * 100, 0), 100);

  const stopAnimation = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const commitSnapshotToUI = useCallback(
    (
      snapshot: ReturnType<typeof getStrengthSimulationSnapshot>,
      { force = false, timestamp = performance.now() }: { force?: boolean; timestamp?: number } = {},
    ) => {
      const nextState: SimulationViewState = {
        currentLoad: roundLoad(snapshot.load),
        cubeState: snapshot.cubeState,
        isShaking: !reducedMotion && snapshot.isShaking,
      };

      const previous = viewStateRef.current;
      const changed =
        Math.abs(previous.currentLoad - nextState.currentLoad) >= 0.1 ||
        previous.cubeState !== nextState.cubeState ||
        previous.isShaking !== nextState.isShaking;

      if (!force && !changed) return;

      viewStateRef.current = nextState;
      setViewState(nextState);
      lastUiCommitRef.current = timestamp;
    },
    [reducedMotion],
  );

  const clearShakingVisual = useCallback(() => {
    setViewState((previous) => {
      if (!previous.isShaking) return previous;
      const next = { ...previous, isShaking: false };
      viewStateRef.current = next;
      return next;
    });
  }, []);

  const tick = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp - elapsedMsRef.current;
      }
      const elapsedMs = timestamp - startTimeRef.current;
      elapsedMsRef.current = elapsedMs;

      const snapshot = getStrengthSimulationSnapshot(elapsedMs, maxLoad, DEFAULT_STRENGTH_SIMULATION_CONFIG);

      const previousView = viewStateRef.current;
      const uiBudgetExceeded = timestamp - lastUiCommitRef.current >= budget.uiCommitIntervalMs;
      const stateTransition = previousView.cubeState !== snapshot.cubeState;
      const shouldCommit = uiBudgetExceeded || stateTransition || snapshot.isComplete;

      if (shouldCommit) {
        commitSnapshotToUI(snapshot, { force: snapshot.isComplete, timestamp });
      }

      if (snapshot.isComplete) {
        setTestState('complete');
        stopAnimation();
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    },
    [budget.uiCommitIntervalMs, commitSnapshotToUI, maxLoad, stopAnimation],
  );

  const startFrameLoop = useCallback(() => {
    stopAnimation();
    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(tick);
  }, [stopAnimation, tick]);

  const resetTest = useCallback(() => {
    stopAnimation();
    elapsedMsRef.current = 0;
    lastUiCommitRef.current = 0;
    viewStateRef.current = INITIAL_VIEW_STATE;
    setViewState(INITIAL_VIEW_STATE);
    setTestState('idle');
  }, [stopAnimation]);

  const runFromCurrentPoint = useCallback(() => {
    setTestState('running');
    clearShakingVisual();
    startFrameLoop();
  }, [clearShakingVisual, startFrameLoop]);

  const startTest = useCallback(() => {
    elapsedMsRef.current = 0;
    lastUiCommitRef.current = 0;
    viewStateRef.current = INITIAL_VIEW_STATE;
    setViewState(INITIAL_VIEW_STATE);
    runFromCurrentPoint();
  }, [runFromCurrentPoint]);

  const pauseTest = useCallback(() => {
    if (testState !== 'running') return;
    stopAnimation();
    clearShakingVisual();
    setTestState('paused');
  }, [clearShakingVisual, stopAnimation, testState]);

  const resumeTest = useCallback(() => {
    if (testState !== 'paused') return;
    runFromCurrentPoint();
  }, [runFromCurrentPoint, testState]);

  const getStateControlsClass = (stateKey: TestState) =>
    `absolute inset-0 flex flex-wrap items-center justify-center gap-2 transition-opacity duration-200 ease-out will-change-opacity ${
      testState === stateKey ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
    }`;

  useEffect(() => {
    resetTest();
  }, [concreteClass.id, resetTest]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (testState === 'running') {
          stopAnimation();
          clearShakingVisual();
        }
        return;
      }

      if (testState === 'running' && frameRef.current === null) {
        startFrameLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [clearShakingVisual, startFrameLoop, stopAnimation, testState]);

  useEffect(() => () => stopAnimation(), [stopAnimation]);

  return (
    <div className={`${compact ? 'space-y-4' : 'space-y-6'} animate-rise-in-soft`}>
      <Suspense
        fallback={
          <div className={`${previewHeightClass} w-full animate-pulse rounded-2xl bg-secondary/35`} />
        }
      >
        <Cube3D
          state={viewState.cubeState}
          progress={viewState.currentLoad}
          maxProgress={maxLoad}
          isShaking={viewState.isShaking}
          seedKey={concreteClass.id}
          compact={compact}
        />
      </Suspense>

      <div className="text-center">
        <div
          className={`inline-flex items-baseline gap-3 rounded-2xl border border-border/85 bg-card ${compact ? 'px-4 py-3' : 'px-6 py-4'} shadow-[0_12px_26px_-22px_rgb(15_23_42/0.45)]`}
        >
          <Gauge className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
          <span
            className={`${compact ? 'text-3xl' : 'text-4xl'} font-mono font-bold text-foreground ${reducedMotion ? '' : 'animate-number'}`}
          >
            {viewState.currentLoad.toFixed(1)}
          </span>
          <span className={`${compact ? 'text-base' : 'text-lg'} text-muted-foreground`}>/ {formatMpa(maxLoad)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="pressure-track relative h-4">
          <div
            className={`pressure-fill h-full bg-primary ${
              testState === 'running' ? 'pressure-fill-live' : 'pressure-fill-idle'
            } ${
              testState === 'running' && !reducedMotion ? 'animate-progress-pulse' : ''
            }`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
          {testState === 'running' && !reducedMotion && (
            <div className="pointer-events-none absolute inset-0 opacity-20 animate-shimmer" />
          )}
          <div className="pressure-mark" style={{ left: `${crackPercent}%` }} />
        </div>
        <div className="mt-2 grid grid-cols-3 text-[10px] text-muted-foreground sm:hidden">
          <span className="text-left">0 МПа</span>
          <span className="text-center">Трещины</span>
          <span className="text-right">Предел</span>
        </div>
        <div className="pressure-scale hidden sm:block">
          <span style={{ left: '0%', transform: 'translateX(0)' }}>0 МПа</span>
          <span style={{ left: `${crackPercent}%` }}>{formatMpa(crackThreshold)} — трещины</span>
          <span style={{ left: '100%', transform: 'translateX(-100%)' }}>{formatMpa(maxLoad)} — разрушение</span>
        </div>
      </div>

      <div className="flex justify-center">
        <span
          className={`
            inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold
            ${testState === 'idle' ? 'border-border/75 bg-card/70 text-muted-foreground' : ''}
            ${testState === 'running' ? 'border-primary/25 bg-primary/10 text-primary' : ''}
            ${testState === 'paused' ? 'border-accent/30 bg-accent/12 text-accent' : ''}
            ${testState === 'complete' ? 'border-success/30 bg-success/10 text-success' : ''}
          `}
        >
          {testState === 'idle' && 'Готов к запуску'}
          {testState === 'running' && 'Испытание выполняется'}
          {testState === 'paused' && 'Испытание на паузе'}
          {testState === 'complete' && 'Испытание завершено'}
        </span>
      </div>

      <div className={`${compact ? 'pt-1' : 'pt-2'} relative mx-auto min-h-[112px] w-full max-w-[760px] sm:min-h-[56px]`}>
        <div className={getStateControlsClass('idle')}>
          <Button onClick={startTest} size="lg" className="w-full gap-2 rounded-2xl px-5 sm:w-auto sm:px-7">
            <Play className="h-5 w-5" />
            Протестировать прочность
          </Button>
        </div>

        <div className={getStateControlsClass('running')}>
          <Button onClick={pauseTest} size="lg" className="w-full gap-2 rounded-2xl px-5 sm:w-auto sm:px-7">
            <Pause className="h-5 w-5" />
            Пауза
          </Button>
          <Button onClick={resetTest} size="lg" variant="outline" className="w-full gap-2 rounded-2xl px-5 sm:w-auto sm:px-6">
            <RotateCcw className="h-5 w-5" />
            С начала
          </Button>
        </div>

        <div className={getStateControlsClass('paused')}>
          <Button onClick={resumeTest} size="lg" className="w-full gap-2 rounded-2xl px-5 sm:w-auto sm:px-7">
            <Play className="h-5 w-5" />
            Продолжить
          </Button>
          <Button onClick={resetTest} size="lg" variant="outline" className="w-full gap-2 rounded-2xl px-5 sm:w-auto sm:px-6">
            <RotateCcw className="h-5 w-5" />
            С начала
          </Button>
        </div>

        <div className={getStateControlsClass('complete')}>
          <Button onClick={startTest} size="lg" variant="outline" className="w-full gap-2 rounded-2xl px-5 sm:w-auto sm:px-7">
            <RotateCcw className="h-5 w-5" />
            Повторить испытание
          </Button>
        </div>
      </div>

      {testState === 'complete' && !compact && (
        <div className="animate-fade-in pt-4">
          <ComparisonModule strengthMPa={maxLoad} concreteClassName={concreteClass.name} />
        </div>
      )}
    </div>
  );
}
