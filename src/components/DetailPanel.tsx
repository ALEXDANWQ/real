import { lazy, Suspense } from 'react';
import { Ruler, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategoryColor, getCategoryLabel, type ConcreteClass } from '@/data/concreteClasses';
import { formatMpa } from '@/lib/engineering';
import { IconLab, IconLayers } from '@/components/icons/custom-icons';

const StrengthTest = lazy(() => import('./StrengthTest').then((mod) => ({ default: mod.StrengthTest })));

interface DetailPanelProps {
  concreteClass: ConcreteClass | null;
  onClose: () => void;
  isClosing?: boolean;
}

export function DetailPanel({ concreteClass, onClose, isClosing = false }: DetailPanelProps) {
  if (!concreteClass) return null;

  const categoryColor = getCategoryColor(concreteClass.category);
  const categoryLabel = getCategoryLabel(concreteClass.category);
  const panelStyle = {
    maxHeight: 'calc(100dvh - var(--header-height) - 16px - env(safe-area-inset-bottom, 0px))',
  } as const;

  return (
    <div className="pointer-events-none fixed inset-x-1.5 z-[70] sm:inset-x-4 md:inset-x-6 lg:inset-x-10 2xl:inset-x-14" style={{ top: 'calc(var(--header-height) + 8px)' }}>
      <div
        className={`detail-panel-motion pointer-events-auto mx-auto flex w-full max-w-[1880px] flex-col overflow-hidden rounded-[24px] border border-border/80 bg-card shadow-[0_34px_72px_-36px_rgb(15_23_42/0.5)] sm:rounded-[30px] ${
          isClosing ? 'animate-panel-out-bottom' : 'animate-panel-in-bottom'
        }`}
        style={panelStyle}
      >
        <div className="border-b border-border/70 bg-card/95 px-3.5 pb-3 pt-3 sm:px-5 sm:pb-4 md:px-7 md:pb-5">
          <div className="mb-3 flex justify-center">
            <span className="h-1.5 w-14 rounded-full bg-border/95 sm:w-16" />
          </div>

          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div>
              <div className={`mb-3 inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium ${categoryColor}`}>
                {categoryLabel}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl 2xl:text-[2.8rem]">{concreteClass.name}</h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-xl font-semibold text-primary sm:text-2xl">{concreteClass.strengthMPa}</span>
                <span className="text-muted-foreground">МПа</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full border border-border/70 bg-card/75 transition-all duration-300 hover:-translate-y-px hover:bg-card"
              aria-label="Закрыть панель"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-3.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-3.5 sm:px-5 sm:pb-7 sm:pt-5 md:px-8 md:pb-10 md:pt-8">
          <div className="grid h-full gap-3 sm:gap-4 lg:gap-5 2xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.95fr)]">
            <div className="order-2 space-y-4 2xl:order-2">
              <div className="glass-card animate-rise-in-soft rounded-2xl border border-border/75 p-4 shadow-sm stagger-1">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <IconLayers className="h-4 w-4" />
                  Применение
                </h3>
                <p className="text-lg font-medium text-foreground">{concreteClass.application}</p>
              </div>

              <div className="glass-card animate-rise-in-soft rounded-2xl border border-border/75 p-4 shadow-sm stagger-2">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <IconLab className="h-4 w-4" />
                  Описание
                </h3>
                <p className="leading-relaxed text-foreground/80">{concreteClass.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 animate-rise-in-soft stagger-3">
                <div className="glass-card rounded-2xl border border-border/75 p-4">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Ruler className="h-3.5 w-3.5" />
                    Класс
                  </div>
                  <div className="font-mono text-2xl font-bold text-foreground">{concreteClass.name}</div>
                </div>
                <div className="glass-card rounded-2xl border border-primary/22 p-4">
                  <div className="mb-1.5 text-xs text-muted-foreground">Прочность</div>
                  <div className="font-mono text-2xl font-bold text-primary">{formatMpa(concreteClass.strengthMPa)}</div>
                </div>
              </div>
            </div>

            <div className="order-1 animate-rise-in-soft rounded-2xl p-2 sm:p-4 stagger-4 md:p-4 2xl:order-1">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground sm:mb-4 sm:text-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <IconLab className="h-4 w-4 text-primary" />
                </div>
                Виртуальное испытание
              </h3>
              <Suspense
                fallback={
                  <div className="rounded-2xl bg-card/70 p-6">
                    <div className="h-40 animate-pulse rounded-xl bg-secondary/75" />
                  </div>
                }
              >
                <StrengthTest concreteClass={concreteClass} compact />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
