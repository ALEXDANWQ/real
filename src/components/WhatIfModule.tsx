import { useState } from 'react';
import { AlertTriangle, CheckCircle, Gauge, Info, XCircle } from 'lucide-react';
import { concreteClasses, findConcreteClassById, getDefaultConcreteClassId } from '@/data/concreteClasses';
import { Slider } from '@/components/ui/slider';
import { buildConcreteClassRecommendation, formatMpa } from '@/lib/engineering';
import { getIconByName, type IconName } from '@/lib/iconMap';
import { getPremiumWhatIfIcon } from '@/components/icons/premium-block-icons';
import { IconDam } from '@/components/icons/custom-icons';

interface Structure {
  id: string;
  name: string;
  icon: IconName;
  requiredMPa: number;
  description: string;
}

const structures: Structure[] = [
  { id: 'sidewalk', name: 'Тротуар', icon: 'person', requiredMPa: 15, description: 'Пешеходные дорожки' },
  { id: 'garage', name: 'Гараж', icon: 'car', requiredMPa: 20, description: 'Пол гаража' },
  { id: 'house', name: 'Частный дом', icon: 'home', requiredMPa: 25, description: 'Фундамент дома' },
  { id: 'apartment', name: 'Многоэтажка', icon: 'building', requiredMPa: 32, description: 'Жилой комплекс' },
  { id: 'bridge', name: 'Мост', icon: 'bridge', requiredMPa: 45, description: 'Автомобильный мост' },
  { id: 'dam', name: 'Плотина', icon: 'dam', requiredMPa: 60, description: 'Гидросооружение' },
];

type ScenarioStatus = 'safe' | 'warning' | 'danger';
const LOAD_BOUNDARY_EPSILON = 1e-6;

export function WhatIfModule() {
  const [selectedClassId, setSelectedClassId] = useState<string>(getDefaultConcreteClassId());
  const [selectedStructure, setSelectedStructure] = useState<Structure>(structures[3]);
  const [loadMultiplier, setLoadMultiplier] = useState([1]);
  const selectedClass = findConcreteClassById(selectedClassId) ?? concreteClasses[0];

  const effectiveLoad = selectedStructure.requiredMPa * loadMultiplier[0];
  const rawSafetyMargin = selectedClass.strengthMPa - effectiveLoad;
  const safetyMargin = Math.abs(rawSafetyMargin) < LOAD_BOUNDARY_EPSILON ? 0 : rawSafetyMargin;
  const loadPercentage = (effectiveLoad / selectedClass.strengthMPa) * 100;
  const cappedLoadPercentage = Math.min(loadPercentage, 100);
  const highestClass = concreteClasses[concreteClasses.length - 1];
  const recommendation = buildConcreteClassRecommendation(effectiveLoad);
  const isMinimumAboveCatalog = recommendation.minimumRequiredMpa > highestClass.strengthMPa + LOAD_BOUNDARY_EPSILON;
  const minimumClassLabel = isMinimumAboveCatalog ? `${highestClass.name}+` : recommendation.minimumClass.name;
  const minimumTargetLabel = formatMpa(recommendation.minimumRequiredMpa);
  const recommendedClassLabel = recommendation.isAboveCatalog ? `${highestClass.name}+` : recommendation.recommendedClass.name;
  const recommendedTargetLabel = formatMpa(recommendation.recommendedRequiredMpa);
  const recommendationReserveLabel = `${Math.round(recommendation.actualReserveRatio * 100)}%`;
  const status: ScenarioStatus =
    loadPercentage < 70 - LOAD_BOUNDARY_EPSILON
      ? 'safe'
      : loadPercentage <= 100 + LOAD_BOUNDARY_EPSILON
        ? 'warning'
        : 'danger';

  const StatusIcon = status === 'safe' ? CheckCircle : status === 'warning' ? AlertTriangle : XCircle;

  const statusLabel = status === 'safe' ? 'Надежно' : status === 'warning' ? 'На границе' : 'Риск';
  const statusTitle =
    status === 'safe'
      ? 'Нагрузка в безопасной зоне'
      : status === 'warning'
        ? 'Нагрузка близка к пределу'
        : 'Класс недостаточен';
  const statusDescription =
    status === 'safe'
      ? `Запас ${formatMpa(safetyMargin)}. Минимум ${minimumClassLabel}, для запаса ${recommendedClassLabel}.`
      : status === 'warning'
        ? `Текущий класс на границе. Минимум ${minimumClassLabel}, рекомендуем ${recommendedClassLabel}.`
        : `Превышение ${formatMpa(Math.abs(safetyMargin))}. Нужен минимум ${minimumClassLabel}.`;

  const statusAccentClass = status === 'safe' ? 'text-success' : status === 'warning' ? 'text-accent' : 'text-danger';
  const statusIconChipClass =
    status === 'safe'
      ? 'border-success/45 bg-success/40 text-success'
      : status === 'warning'
        ? 'border-accent/35 bg-accent/20 text-accent'
        : 'border-danger/35 bg-danger/20 text-danger';
  const statusBadgeClass =
    status === 'safe'
      ? 'border-success/50 bg-success/40 text-success'
      : status === 'warning'
        ? 'border-accent/40 bg-accent/20 text-accent'
        : 'border-danger/40 bg-danger/20 text-danger';
  const statusSummaryPanelClass = 'border-border/60 bg-card/64';

  return (
    <div className="surface-panel overflow-hidden animate-rise-in-soft">
      <div className="space-y-4 p-4 sm:space-y-5 sm:p-5 md:space-y-6 md:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] xl:items-stretch">
          <section className="h-full overflow-hidden rounded-2xl border border-border/70 bg-card/72 px-4 py-3 sm:px-5 sm:py-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Info className="h-4 w-4 text-muted-foreground" />
                Сценарий нагрузки
              </h4>
              <span className="rounded-lg border border-border/75 bg-background/60 px-2.5 py-1 text-xs font-semibold text-foreground">
                {selectedStructure.name}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {structures.map((structure) => {
                const Icon =
                  structure.icon === 'dam'
                    ? IconDam
                    : (getPremiumWhatIfIcon(structure.icon) ?? getIconByName(structure.icon));
                const isSelected = selectedStructure.id === structure.id;

                return (
                  <button
                    key={structure.id}
                    type="button"
                    onClick={() => setSelectedStructure(structure)}
                    className={`group flex h-full flex-col justify-center rounded-2xl border px-3.5 py-4 text-left transition-colors ${
                      isSelected
                        ? 'border-primary/45 bg-primary/12 text-foreground'
                        : 'border-border/80 bg-card text-foreground hover:border-primary/25 hover:bg-card/95'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold leading-tight text-foreground sm:text-[15px]">{structure.name}</div>
                        <div className="mt-0.5 font-mono text-[13px] text-muted-foreground">{formatMpa(structure.requiredMPa)}</div>
                      </div>
                      <span
                        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                          isSelected
                            ? 'border-primary/45 bg-primary/20 text-primary'
                            : 'border-border/75 bg-card/85 text-muted-foreground group-hover:border-primary/25 group-hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.7} />
                      </span>
                    </div>
                    <div className={`text-xs leading-snug sm:text-[13px] ${isSelected ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                      {structure.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="h-full rounded-2xl border border-border/70 bg-card/72 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-foreground">Класс бетона для сценария</h4>
              <span className="rounded-lg border border-border/75 bg-background/60 px-2.5 py-1 text-xs font-semibold text-foreground">
                Мин. {minimumClassLabel} • Реком. {recommendedClassLabel}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
              {concreteClasses.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`inline-flex aspect-square w-full items-center justify-center rounded-[14px] border text-center text-base font-semibold leading-none transition-colors sm:text-lg ${
                    selectedClass.id === cls.id
                      ? 'border-primary bg-primary text-primary-foreground shadow-[0_10px_20px_-16px_hsl(var(--primary)/0.65)]'
                      : 'border-border/75 bg-card text-foreground hover:border-primary/25 hover:bg-card/95'
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-background/40 px-3.5 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Предел</div>
                <div className="mt-1.5 font-mono text-base font-semibold text-foreground">{formatMpa(selectedClass.strengthMPa)}</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/40 px-3.5 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Нагрузка</div>
                <div className="mt-1.5 font-mono text-base font-semibold text-foreground">{formatMpa(effectiveLoad)}</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/40 px-3.5 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Запас</div>
                <div className={`mt-1.5 font-mono text-base font-semibold ${safetyMargin >= 0 ? 'text-success' : 'text-danger'}`}>
                  {safetyMargin >= 0 ? '+' : '-'}
                  {formatMpa(Math.abs(safetyMargin))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] xl:items-stretch">
          <section className="flex h-full min-h-[132px] flex-col justify-center rounded-2xl border border-border/70 bg-card/68 p-3 sm:min-h-[142px] sm:p-3.5">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Gauge className="h-4 w-4 text-primary" />
                Коэффициент нагрузки
              </h4>
              <span className="rounded-lg border border-border/75 bg-background/60 px-2.5 py-1 font-mono text-base font-semibold text-foreground">
                ×{loadMultiplier[0].toFixed(2)}
              </span>
            </div>
            <Slider
              value={loadMultiplier}
              onValueChange={setLoadMultiplier}
              min={0.5}
              max={2}
              step={0.05}
              className="py-1"
            />
            <div className="mt-1 grid gap-1 text-[11px] text-muted-foreground sm:flex sm:justify-between sm:text-xs">
              <span className="sm:whitespace-nowrap">Пониженная ×0.5</span>
              <span className="sm:whitespace-nowrap">Нормальная ×1,25</span>
              <span className="sm:whitespace-nowrap">Повышенная ×2.0</span>
            </div>
          </section>

          <section className={`flex h-full min-h-[132px] flex-col justify-center rounded-2xl border p-3 sm:min-h-[142px] sm:p-3.5 ${statusSummaryPanelClass}`}>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${statusIconChipClass}`}>
                  <StatusIcon className={`h-[17px] w-[17px] ${statusAccentClass}`} />
                </span>
                <div className="min-w-0">
                  <h5 className="text-sm font-semibold text-foreground sm:text-base">{statusTitle}</h5>
                  <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{statusDescription}</p>
                </div>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-xs font-semibold sm:self-center ${statusBadgeClass}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {statusLabel}
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-background/45 px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Нагрузка</div>
                <div className="mt-1 font-mono text-lg font-semibold leading-none text-foreground">{formatMpa(effectiveLoad)}</div>
              </div>
              <div className="rounded-lg bg-background/45 px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Минимум</div>
                <div className="mt-1 font-mono text-lg font-semibold leading-none text-foreground">{minimumClassLabel}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">Цель {minimumTargetLabel}</div>
              </div>
              <div className="rounded-lg bg-background/45 px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Рекомендация</div>
                <div className="mt-1 font-mono text-lg font-semibold leading-none text-foreground">{recommendedClassLabel}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  Цель {recommendedTargetLabel} · +{recommendationReserveLabel}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-border/70 bg-card/72 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium text-foreground">Нагрузка на конструкцию</span>
            <span className="font-mono font-semibold">
              {formatMpa(effectiveLoad)} / {formatMpa(selectedClass.strengthMPa)}
            </span>
          </div>
          <div className="pressure-track relative h-4">
            <div
              className="pressure-fill pressure-fill-smooth h-full bg-primary"
              style={{ transform: `scaleX(${cappedLoadPercentage / 100})` }}
            />
            <div className="pressure-mark" style={{ left: '70%' }} />
          </div>
          <div className="mt-3 grid grid-cols-3 text-[10px] text-muted-foreground sm:hidden">
            <span className="text-left">0%</span>
            <span className="text-center">70%</span>
            <span className="text-right">100%</span>
          </div>
          <div className="pressure-scale mt-3 hidden sm:block">
            <span style={{ left: '0%', transform: 'translateX(0)' }}>0%</span>
            <span style={{ left: '70%' }}>70% — трещины</span>
            <span style={{ left: '100%', transform: 'translateX(-100%)' }}>100% — разрушение</span>
          </div>
        </section>
      </div>
    </div>
  );
}
