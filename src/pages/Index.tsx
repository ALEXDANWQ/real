import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Sparkles } from 'lucide-react';
import { concreteClasses, findConcreteClassById, getDefaultConcreteClassId } from '@/data/concreteClasses';
import { ConcreteCard } from '@/components/ConcreteCard';
import { Header } from '@/components/Header';
import { useInViewOnce } from '@/hooks/use-in-view-once';
import { IconLab, IconLayers, IconMapSection } from '@/components/icons/custom-icons';
import { ProductionOverview } from '@/components/ProductionOverview';
import { DeliveryOverview } from '@/components/DeliveryOverview';
import { FactoryLocationMap } from '@/components/FactoryLocationMap';

const MixSelector = lazy(() => import('@/components/MixSelector').then((mod) => ({ default: mod.MixSelector })));
const DetailPanel = lazy(() =>
  import('@/components/DetailPanel').then((mod) => ({ default: mod.DetailPanel })),
);

const sectionIds = ['classes', 'selector', 'comparator', 'map', 'location'] as const;

const sectionAnchorStyle: CSSProperties = {
  scrollMarginTop: 'calc(var(--header-height, 96px) + 24px)',
};

const pageLayoutClass = 'mx-auto w-full max-w-[1880px] px-3 sm:px-5 lg:px-8 2xl:px-12';
const PANEL_CLOSE_MS = 420;
const PREFETCH_IDLE_TIMEOUT_MS = 1800;
const PREFETCH_FALLBACK_DELAY_MS = 560;
const VIEWPORT_PREFETCH_MARGIN = '240px';
const MOBILE_MEDIA_QUERY = '(max-width: 1023px), (pointer: coarse)';

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
  deviceMemory?: number;
};

const hasConstrainedConnection = () => {
  if (typeof navigator === 'undefined') return false;
  const { connection } = navigator as NavigatorWithConnection;
  if (!connection) return false;

  if (connection.saveData) return true;
  const effectiveType = connection.effectiveType?.toLowerCase();
  return effectiveType === '2g' || effectiveType === 'slow-2g' || effectiveType === '3g';
};

const canPrefetchHeavyModules = () => {
  if (typeof navigator === 'undefined') return false;
  if (hasConstrainedConnection()) return false;

  const navigatorWithHints = navigator as NavigatorWithConnection;
  const cpuCores = navigatorWithHints.hardwareConcurrency ?? 8;
  const memory = navigatorWithHints.deviceMemory ?? 8;
  return cpuCores > 4 && memory > 4;
};

const isMobileViewport = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
};

function SectionFallback({ className = 'h-[420px]' }: { className?: string }) {
  return (
    <div className={`glass-card rounded-3xl border border-border/75 p-6 ${className}`}>
      <div className="h-full animate-pulse rounded-2xl bg-secondary/70" />
    </div>
  );
}

const Index = () => {
  const [selectedClassId, setSelectedClassId] = useState<string>(getDefaultConcreteClassId());
  const [activeSection, setActiveSection] = useState<string>('classes');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailClosing, setIsDetailClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const navigationLockRef = useRef<{ sectionId: string; until: number } | null>(null);
  const selectedClass = findConcreteClassById(selectedClassId) ?? concreteClasses[0];

  const selectorVisibility = useInViewOnce<HTMLDivElement>(VIEWPORT_PREFETCH_MARGIN);

  useEffect(() => {
    const targets = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!targets.length) return;

    let rafId: number | null = null;
    let recalcRafId: number | null = null;
    let orderedTargets: Array<{ id: string; start: number }> = [];

    const computeOrderedTargets = () =>
      targets
        .map((target) => ({
          id: target.id,
          start: target.getBoundingClientRect().top + window.scrollY,
        }))
        .sort((a, b) => a.start - b.start);

    const updateActiveSection = () => {
      rafId = null;

      // Mobile menu locks the page with fixed body positioning.
      // In that state scroll metrics can become unreliable and incorrectly
      // mark sections as active. Keep the previous active section.
      if (document.body.style.position === 'fixed' && document.documentElement.style.overflow === 'hidden') {
        return;
      }

      if (!orderedTargets.length) {
        orderedTargets = computeOrderedTargets();
        if (!orderedTargets.length) return;
      }

      const headerHeightRaw = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
      const headerHeight = Number.parseInt(headerHeightRaw, 10) || 96;

      const navigationLock = navigationLockRef.current;
      if (navigationLock) {
        const lockTarget = orderedTargets.find((target) => target.id === navigationLock.sectionId);
        if (lockTarget) {
          const lockTop = lockTarget.start - headerHeight - 20;
          const delta = Math.abs(window.scrollY - Math.max(0, lockTop));
          if (delta <= 8 || Date.now() > navigationLock.until) {
            navigationLockRef.current = null;
          } else {
            setActiveSection((prev) => (prev === navigationLock.sectionId ? prev : navigationLock.sectionId));
            return;
          }
        } else {
          navigationLockRef.current = null;
        }
      }

      const probeY = window.scrollY + headerHeight + 32;
      let nextSectionId = orderedTargets[0].id;

      for (let index = 0; index < orderedTargets.length; index += 1) {
        const target = orderedTargets[index];
        if (probeY >= target.start - 1) {
          nextSectionId = target.id;
          continue;
        }
        break;
      }

      const reachedBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (reachedBottom) {
        nextSectionId = orderedTargets[orderedTargets.length - 1].id;
      }

      setActiveSection((prev) => (prev === nextSectionId ? prev : nextSectionId));
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateActiveSection);
    };

    const recalcTargets = () => {
      orderedTargets = computeOrderedTargets();
      scheduleUpdate();
    };

    const scheduleRecalcTargets = () => {
      if (recalcRafId !== null) return;
      recalcRafId = window.requestAnimationFrame(() => {
        recalcRafId = null;
        recalcTargets();
      });
    };

    const releaseNavigationLock = () => {
      if (!navigationLockRef.current) return;
      navigationLockRef.current = null;
      scheduleUpdate();
    };

    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'PageDown' ||
        event.key === 'PageUp' ||
        event.key === 'Home' ||
        event.key === 'End' ||
        event.key === ' ' ||
        event.key === 'Spacebar'
      ) {
        releaseNavigationLock();
      }
    };

    const handleNavigationTarget = (event: Event) => {
      const customEvent = event as CustomEvent<{ sectionId: string; until: number }>;
      if (!customEvent.detail?.sectionId) return;

      navigationLockRef.current = {
        sectionId: customEvent.detail.sectionId,
        until: customEvent.detail.until,
      };
      setActiveSection(customEvent.detail.sectionId);
      scheduleRecalcTargets();
      scheduleUpdate();
    };

    const layoutObserver = new ResizeObserver(scheduleRecalcTargets);
    targets.forEach((target) => layoutObserver.observe(target));
    recalcTargets();

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleRecalcTargets);
    window.addEventListener('load', scheduleRecalcTargets);
    window.addEventListener('wheel', releaseNavigationLock, { passive: true });
    window.addEventListener('touchstart', releaseNavigationLock, { passive: true });
    window.addEventListener('keydown', handleKeyboardNavigation);
    window.addEventListener('grade:navigation-target', handleNavigationTarget as EventListener);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (recalcRafId !== null) {
        window.cancelAnimationFrame(recalcRafId);
      }
      layoutObserver.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleRecalcTargets);
      window.removeEventListener('load', scheduleRecalcTargets);
      window.removeEventListener('wheel', releaseNavigationLock);
      window.removeEventListener('touchstart', releaseNavigationLock);
      window.removeEventListener('keydown', handleKeyboardNavigation);
      window.removeEventListener('grade:navigation-target', handleNavigationTarget as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isDetailOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isDetailOpen]);

  useEffect(() => {
    const runPrefetch = () => {
      void import('@/components/DetailPanel');

      if (hasConstrainedConnection()) return;

      void import('@/components/StrengthTest');

      if (canPrefetchHeavyModules() && !isMobileViewport()) {
        void import('@/components/Cube3D');
      }
    };

    type IdleWindow = Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const idleWindow = window as IdleWindow;
    let idleCleanup: (() => void) | null = null;
    const rafId = window.requestAnimationFrame(() => {
      if (idleWindow.requestIdleCallback) {
        const idleId = idleWindow.requestIdleCallback(runPrefetch, { timeout: PREFETCH_IDLE_TIMEOUT_MS });
        idleCleanup = () => idleWindow.cancelIdleCallback?.(idleId);
        return;
      }

      const timeoutId = window.setTimeout(runPrefetch, PREFETCH_FALLBACK_DELAY_MS);
      idleCleanup = () => window.clearTimeout(timeoutId);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      idleCleanup?.();
    };
  }, []);

  const openDetails = (classId: string) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSelectedClassId(classId);
    setIsDetailClosing(false);
    setIsDetailOpen(true);
  };

  const closeDetails = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    setIsDetailClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsDetailOpen(false);
      setIsDetailClosing(false);
      closeTimerRef.current = null;
    }, PANEL_CLOSE_MS);
  };

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  return (
    <div className="relative min-h-screen min-h-[100dvh] bg-background" style={{ paddingTop: 'calc(var(--header-height, 96px) + 0.9rem)' }}>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-float sm:-left-32 sm:top-20 sm:h-80 sm:w-80" />
        <div className="absolute -right-20 top-[24rem] h-72 w-72 rounded-full bg-accent/10 blur-3xl animate-float [animation-delay:0.8s] sm:-right-28 sm:top-[30rem] sm:h-96 sm:w-96" />
      </div>
      <Header activeSection={activeSection} onSectionChange={setActiveSection} />

      <section className="pb-8 pt-4 sm:pb-12 sm:pt-7 md:pb-16 md:pt-12 2xl:pb-20">
        <div className={pageLayoutClass}>
          <div className="max-w-5xl animate-rise-in-soft">
            <div className="glass-card mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 px-3.5 py-1.5 animate-fade-in sm:mb-6 sm:px-4 sm:py-2">
              <Sparkles className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
              <span className="text-xs font-medium text-primary sm:text-sm">Интерактивная бетонная лаборатория</span>
            </div>

            <h2 className="animate-fade-in text-[clamp(2rem,9.8vw,3.9rem)] font-bold tracking-tight text-foreground stagger-1">
              Классы прочности <span className="text-foreground">бетона</span>
            </h2>

            <p className="mb-7 mt-4 max-w-3xl animate-fade-in text-base leading-relaxed text-muted-foreground stagger-2 sm:mt-6 sm:text-lg md:text-xl">
              Исследуйте поведение бетона в интерактивной 3D-среде, сравнивайте инженерные сценарии и подбирайте класс
              смеси под реальную задачу.
            </p>

            <div className="grid grid-cols-1 gap-2.5 animate-fade-in stagger-3 sm:flex sm:flex-wrap sm:gap-3">
              <div className="action-chip inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5">
                <IconLab className="h-[18px] w-[18px] text-primary sm:h-5 sm:w-5" />
                <span className="text-sm font-medium">3D-испытания</span>
              </div>
              <div className="action-chip inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5">
                <IconMapSection className="h-[18px] w-[18px] text-accent sm:h-5 sm:w-5" />
                <span className="text-sm font-medium">Карта применения</span>
              </div>
              <div className="action-chip inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5">
                <IconLayers className="h-[18px] w-[18px] text-success sm:h-5 sm:w-5" />
                <span className="text-sm font-medium">Инженерный подбор</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="classes" className="py-10 sm:py-14 md:py-16 2xl:py-20" style={sectionAnchorStyle}>
        <div className={pageLayoutClass}>
          <div className="mb-7 flex flex-col justify-between gap-4 sm:mb-10 sm:gap-5 md:flex-row md:items-end">
            <div>
              <h3 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">Таблица классов</h3>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Выберите класс бетона для виртуального испытания и сравнения с другими сценариями.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {concreteClasses.map((concreteClass, index) => (
              <ConcreteCard
                key={concreteClass.id}
                concreteClass={concreteClass}
                isSelected={isDetailOpen && selectedClass.id === concreteClass.id}
                onClick={() => openDetails(concreteClass.id)}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="selector" className="py-10 sm:py-14 md:py-16 2xl:py-20" style={sectionAnchorStyle}>
        <div className={pageLayoutClass}>
          <div className="mb-7 sm:mb-10">
            <h3 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">Подбор класса бетона</h3>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">Пошаговый инженерный конструктор.</p>
          </div>
          <div ref={selectorVisibility.ref}>
            <Suspense fallback={<SectionFallback className="h-[clamp(360px,62vh,460px)]" />}>
              {selectorVisibility.isVisible ? <MixSelector /> : <SectionFallback className="h-[clamp(360px,62vh,460px)]" />}
            </Suspense>
          </div>
        </div>
      </section>

      <section id="comparator" className="py-10 sm:py-14 md:py-16 2xl:py-20" style={sectionAnchorStyle}>
        <div className={pageLayoutClass}>
          <div className="mb-7 sm:mb-10">
            <h3 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">Производство бетона - завод в Великих Луках</h3>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">Производственная площадка и ключевые данные компании.</p>
          </div>
          <ProductionOverview />
        </div>
      </section>

      <section id="map" className="py-12 sm:py-14 md:py-16 2xl:py-20" style={sectionAnchorStyle}>
        <div className={pageLayoutClass}>
          <div className="mb-7 sm:mb-10">
            <h3 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">Доставка по Псковской, Тверской и Смоленской области</h3>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">Тарифы на доставку и условия работы спецтехники.</p>
          </div>
          <DeliveryOverview />
        </div>
      </section>

      <section id="location" className="py-12 sm:py-14 md:py-16 2xl:py-20" style={sectionAnchorStyle}>
        <div className={pageLayoutClass}>
          <div className="mb-7 sm:mb-10">
            <h3 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">Расположение завода</h3>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Производственная площадка и контактные данные для связи и построения маршрута.
            </p>
          </div>
          <FactoryLocationMap />
        </div>
      </section>

      <Suspense fallback={null}>
        {isDetailOpen && (
          <DetailPanel concreteClass={selectedClass} onClose={closeDetails} isClosing={isDetailClosing} />
        )}
      </Suspense>

      {isDetailOpen && (
        <button
          type="button"
          aria-label="Закрыть панель"
          className={`fixed inset-0 z-[65] bg-slate-950/46 backdrop-blur-md transition-opacity duration-300 will-change-opacity ${
            isDetailClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={closeDetails}
        />
      )}
    </div>
  );
};

export default Index;
