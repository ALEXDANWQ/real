import { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw, Scale, Sparkles, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { concreteClasses, findConcreteClassById, getDefaultConcreteClassId } from '@/data/concreteClasses';
import { calcHydroDepthFromMpa } from '@/lib/engineering';
import { getIconByName, type IconName } from '@/lib/iconMap';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { getPremiumComparatorIcon } from '@/components/icons/premium-block-icons';

interface ComparisonObject {
  id: string;
  name: string;
  icon: IconName;
  pressureMPa: number;
  description: string;
}

interface StackedItem {
  object: ComparisonObject;
  count: number;
}

type ComparatorViewMode = 'objects' | 'depth';

const comparisonObjects: ComparisonObject[] = [
  { id: 'finger', name: 'Нажатие рукой', icon: 'hand', pressureMPa: 0.012, description: 'Ориентировочно 10-15 кПа' },
  { id: 'book', name: 'Стопка книг', icon: 'book', pressureMPa: 0.03, description: 'Умеренная бытовая нагрузка' },
  { id: 'car_tire', name: 'Шина автомобиля', icon: 'car', pressureMPa: 0.22, description: 'Типично 2.2 бар (избыточное)' },
  { id: 'weight', name: 'Силовая платформа', icon: 'weight', pressureMPa: 0.35, description: 'Высокая локальная нагрузка' },
  { id: 'diver_10m', name: 'Глубина 10 м', icon: 'person', pressureMPa: 0.1005, description: 'Гидростатика морской воды' },
  { id: 'submarine', name: 'Подводная лодка', icon: 'ship', pressureMPa: 3, description: 'Порядка 300 м глубины' },
];

const depthSteps = [0, 0.25, 0.5, 0.75, 1] as const;

const formatMpa = (value: number, digits = 1): string => `${value.toFixed(digits)} МПа`;
const formatDepth = (value: number): string => `${Math.round(value)} м`;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const easeSmootherStep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

function useAnimatedNumber(target: number, durationMs: number, reducedMotion: boolean) {
  const [animatedValue, setAnimatedValue] = useState(target);
  const previousValueRef = useRef(target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const start = previousValueRef.current;
    if (reducedMotion || durationMs <= 0 || Math.abs(target - start) < 0.001) {
      previousValueRef.current = target;
      setAnimatedValue(target);
      return;
    }

    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = clamp((now - startedAt) / durationMs, 0, 1);
      const nextValue = start + (target - start) * easeSmootherStep(progress);

      previousValueRef.current = nextValue;
      setAnimatedValue(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      previousValueRef.current = target;
      frameRef.current = null;
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [durationMs, reducedMotion, target]);

  return animatedValue;
}

export function AdvancedComparator() {
  const reducedMotion = usePrefersReducedMotion();
  const [selectedClassId, setSelectedClassId] = useState<string>(getDefaultConcreteClassId());
  const [stack, setStack] = useState<StackedItem[]>([]);
  const [viewMode, setViewMode] = useState<ComparatorViewMode>('objects');
  const stackContentRef = useRef<HTMLDivElement | null>(null);
  const [stackContentHeight, setStackContentHeight] = useState(0);
  const showDepthMode = viewMode === 'depth';

  const selectedClass = findConcreteClassById(selectedClassId) ?? concreteClasses[0];
  const totalPressure = useMemo(() => stack.reduce((sum, item) => sum + item.object.pressureMPa * item.count, 0), [stack]);
  const progressPercent = selectedClass.strengthMPa > 0 ? (totalPressure / selectedClass.strengthMPa) * 100 : 0;
  const remainingStrength = Math.max(selectedClass.strengthMPa - totalPressure, 0);
  const equivalentDepth = calcHydroDepthFromMpa(selectedClass.strengthMPa);
  const maxDepth = calcHydroDepthFromMpa(concreteClasses[concreteClasses.length - 1].strengthMPa);
  const depthMarkerPercent = maxDepth > 0 ? clamp((equivalentDepth / maxDepth) * 100, 0, 100) : 0;

  const animatedStrength = useAnimatedNumber(selectedClass.strengthMPa, 320, reducedMotion);
  const animatedDepth = useAnimatedNumber(equivalentDepth, 400, reducedMotion);

  const ShipIcon = getIconByName('ship');
  const tabTransitionMs = reducedMotion ? 150 : 620;
  const depthMarkerTransitionMs = reducedMotion ? 200 : 920;
  const depthHintTransitionMs = reducedMotion ? 150 : 560;
  const stackTransitionMs = reducedMotion ? 160 : 520;
  const smoothEase = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const showStackPanel = stack.length > 0;

  useEffect(() => {
    const node = stackContentRef.current;
    if (!node) return;

    const updateHeight = () => {
      setStackContentHeight(node.scrollHeight);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [stack, showDepthMode]);

  const addToStack = (obj: ComparisonObject) => {
    setStack((prev) => {
      const existing = prev.find((item) => item.object.id === obj.id);
      if (existing) {
        return prev.map((item) => (item.object.id === obj.id ? { ...item, count: item.count + 1 } : item));
      }
      return [...prev, { object: obj, count: 1 }];
    });
  };

  const removeFromStack = (objId: string) => {
    setStack((prev) =>
      prev
        .map((item) => (item.object.id === objId ? { ...item, count: item.count - 1 } : item))
        .filter((item) => item.count > 0),
    );
  };

  const resetStack = () => setStack([]);

  return (
    <div className="surface-panel overflow-hidden animate-rise-in-soft">
      <div className="relative border-b border-border/70 bg-card/80 p-3.5 sm:p-5">
        <div className="flex justify-start">
          <div className="relative inline-grid w-full max-w-[320px] grid-cols-2 overflow-hidden rounded-full border border-border/70 bg-card/80 p-1 shadow-sm sm:w-[240px] sm:max-w-[260px]">
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-y-0.5 left-0.5 rounded-full bg-primary transition-transform will-change-transform ${
                showDepthMode ? 'translate-x-full' : 'translate-x-0'
              }`}
              style={{ width: 'calc(50% - 2px)', transitionTimingFunction: smoothEase, transitionDuration: `${tabTransitionMs}ms` }}
            />
            <button
              type="button"
              onClick={() => setViewMode('objects')}
              className={`relative z-10 inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors ${
                showDepthMode ? 'text-muted-foreground hover:text-foreground' : 'text-primary-foreground'
              }`}
              style={{ transitionTimingFunction: smoothEase, transitionDuration: `${tabTransitionMs}ms` }}
            >
              <Scale className="h-4 w-4" />
              Объекты
            </button>
            <button
              type="button"
              onClick={() => setViewMode('depth')}
              className={`relative z-10 inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors ${
                showDepthMode ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{ transitionTimingFunction: smoothEase, transitionDuration: `${tabTransitionMs}ms` }}
            >
              <Waves className="h-4 w-4" />
              Глубина
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-3.5 sm:space-y-5 sm:p-5">
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Класс бетона для компаратора</h4>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap sm:overflow-visible sm:pb-0">
            {concreteClasses.map((cls) => {
              const isSelected = selectedClass.id === cls.id;

              return (
                <button
                  key={cls.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedClassId(cls.id);
                    resetStack();
                  }}
                  className={`
                    action-chip shrink-0 rounded-xl px-3 py-2 text-xs sm:px-4 sm:text-sm
                    ${
                      isSelected
                        ? 'border-primary/35 bg-primary font-semibold text-primary-foreground shadow-[0_10px_18px_-14px_hsl(var(--primary)/0.6)] hover:border-primary/35 hover:bg-primary hover:text-primary-foreground hover:scale-[1.03] hover:shadow-[0_14px_24px_-16px_hsl(var(--primary)/0.7)] dark:!border-primary/45 dark:!bg-primary dark:!text-white dark:hover:!bg-primary'
                        : 'border-border/80 bg-card/72 text-foreground'
                    }
                  `}
                >
                  {cls.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-primary/22 p-4 text-center shadow-[0_16px_32px_-24px_hsl(var(--primary)/0.45)] sm:p-6">
          <div className="text-sm font-medium text-muted-foreground">Прочность {selectedClass.name}</div>
          <div className="my-2.5 number-display text-3xl font-bold text-primary tabular-nums sm:my-3 sm:text-5xl">
            {formatMpa(animatedStrength, 1)}
          </div>
          <div className="min-h-[1.5rem]">
            <div
              className={`flex items-center justify-center gap-2 text-xs text-muted-foreground transition-opacity sm:text-sm ${showDepthMode ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionTimingFunction: smoothEase, transitionDuration: `${depthHintTransitionMs}ms` }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Эквивалентно давлению воды на глубине <span className="font-semibold text-primary">{formatDepth(animatedDepth)}</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/55">
          <div className={`${showDepthMode ? 'hidden' : 'block'} p-3 sm:p-5`}>
            <div className="overflow-visible pr-0.5">
              <div className="mx-auto flex w-full max-w-[1080px] flex-col">
                <div>
                  <h4 className="mb-2.5 text-center text-sm font-semibold text-foreground">Добавьте объекты</h4>
                  <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
                    {comparisonObjects.map((obj) => {
                      const Icon = getPremiumComparatorIcon(obj.icon) ?? getIconByName(obj.icon);

                      return (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => addToStack(obj)}
                          className="action-chip rounded-xl border-border/80 bg-card/72 p-3 text-left sm:p-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-primary/18 bg-gradient-to-br from-primary/12 via-primary/6 to-transparent text-primary shadow-[inset_0_1px_0_hsl(var(--primary)/0.14)] sm:h-10 sm:w-10">
                              <Icon className="h-[18px] w-[18px] text-primary sm:h-5 sm:w-5" strokeWidth={1.65} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-foreground">{obj.name}</div>
                              <div className="text-[11px] leading-snug text-muted-foreground sm:text-xs">{obj.description}</div>
                            </div>
                            <Plus className="h-[18px] w-[18px] text-primary sm:h-5 sm:w-5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-[max-height,opacity,margin] ${
                    showStackPanel ? 'mt-5 opacity-100' : 'mt-0 opacity-0'
                  }`}
                  style={{
                    maxHeight: showStackPanel ? `${stackContentHeight || 1}px` : '0px',
                    transitionTimingFunction: smoothEase,
                    transitionDuration: `${stackTransitionMs}ms`,
                  }}
                  aria-hidden={!showStackPanel}
                >
                  <div ref={stackContentRef} className={`space-y-3 ${showStackPanel ? 'visible' : 'invisible pointer-events-none'}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">Ваша стопка давления</h4>
                      <Button variant="ghost" size="sm" onClick={resetStack} className="gap-2 rounded-xl">
                        <RotateCcw className="h-4 w-4" />
                        Сбросить
                      </Button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {stack.map((item, itemIndex) => {
                        const Icon = getPremiumComparatorIcon(item.object.icon) ?? getIconByName(item.object.icon);
                        const shouldAnimateItem = itemIndex > 0;

                        return (
                          <div
                            key={item.object.id}
                            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border border-primary/22 bg-card/88 px-4 py-2.5 shadow-sm ${
                              shouldAnimateItem ? 'opacity-0 animate-fade-in-scale' : ''
                            }`}
                            style={
                              shouldAnimateItem
                                ? { animationDelay: `${itemIndex * 80}ms`, animationFillMode: 'forwards' }
                                : undefined
                            }
                          >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary/20 bg-primary/8 text-primary">
                              <Icon className="h-4 w-4 text-primary" strokeWidth={1.65} />
                            </span>
                            <span className="text-sm font-semibold text-foreground">×{item.count}</span>
                            <button
                              type="button"
                              onClick={() => removeFromStack(item.object.id)}
                              className="rounded-lg p-1.5 text-danger transition-colors hover:bg-danger/10"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3 border-t border-border/60 bg-card/40 pb-1 pt-3 sm:border-t-0 sm:bg-transparent sm:pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-foreground">Накопленное давление</span>
                    <span className="font-mono font-semibold">
                      {formatMpa(totalPressure, 2)} / {formatMpa(selectedClass.strengthMPa)}
                    </span>
                  </div>

                  <div className="pressure-track relative h-4">
                    <div
                      className="pressure-fill pressure-fill-smooth h-full bg-primary"
                      style={{ transform: `scaleX(${Math.min(progressPercent, 100) / 100})` }}
                    />
                    <div className="pressure-mark" style={{ left: '70%' }} />
                  </div>

                  <div className="mt-2 grid grid-cols-3 text-[10px] text-muted-foreground sm:hidden">
                    <span className="text-left">0%</span>
                    <span className="text-center">70%</span>
                    <span className="text-right">100%</span>
                  </div>

                  <div className="pressure-scale hidden sm:block">
                    <span style={{ left: '0%', transform: 'translateX(0)' }}>0%</span>
                    <span style={{ left: '70%' }}>70% - трещины</span>
                    <span style={{ left: '100%', transform: 'translateX(-100%)' }}>100% - разрушение</span>
                  </div>

                  <div className="text-center text-xs sm:text-sm">
                    {progressPercent < 100 ? (
                      <span className="text-muted-foreground">
                        Добавьте еще <span className="font-semibold text-primary">{formatMpa(remainingStrength, 2)}</span> до предела прочности.
                      </span>
                    ) : (
                      <span className="font-semibold text-danger">
                        Предел прочности превышен: конструкция теряет несущую способность.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${showDepthMode ? 'block' : 'hidden'} h-[clamp(430px,56dvh,620px)] p-3 sm:p-5`}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-blue-100/92 via-blue-300/86 to-blue-700/85 shadow-inner dark:from-blue-900/42 dark:via-blue-800/58 dark:to-blue-950/92">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/20" />

              <div className="absolute inset-x-4 bottom-4 top-4 sm:inset-x-6 sm:bottom-5 sm:top-5">
                {depthSteps.map((step) => (
                  <div
                    key={step}
                    className="absolute inset-x-0"
                    style={{
                      top: `${step * 100}%`,
                      transform: step === 0 ? 'translateY(0)' : step === 1 ? 'translateY(-100%)' : 'translateY(-50%)',
                    }}
                  >
                    <div className="border-t border-dashed border-primary/45" />
                    <span className="absolute -right-1 -translate-y-1/2 whitespace-nowrap rounded-full border border-primary/30 bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-primary sm:-right-2 sm:px-2 sm:text-xs dark:bg-blue-950/55">
                      {formatDepth(step * maxDepth)}
                    </span>
                  </div>
                ))}

                <div
                  className="absolute inset-x-0 z-20 transition-all ease-out"
                  style={{
                    top: `${depthMarkerPercent}%`,
                    transform: 'translateY(-50%)',
                    transitionTimingFunction: smoothEase,
                    transitionDuration: `${depthMarkerTransitionMs}ms`,
                  }}
                >
                  <div className="absolute inset-x-0 border-t-2 border-primary" />

                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/35 bg-white/95 shadow-[0_10px_18px_-12px_hsl(var(--primary)/0.55)] sm:h-10 sm:w-10 dark:bg-blue-950/70">
                      <ShipIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+0.5rem)]">
                      <div className="inline-flex h-6 items-center justify-center whitespace-nowrap rounded-full border border-primary/30 bg-white/95 px-2 text-[11px] font-semibold text-primary shadow-[0_10px_18px_-12px_hsl(var(--primary)/0.55)] sm:h-8 sm:px-3 sm:text-sm dark:bg-blue-950/70">
                        {formatDepth(animatedDepth)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
