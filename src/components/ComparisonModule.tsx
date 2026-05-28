import { useMemo, useState } from 'react';
import { comparisons } from '@/data/concreteClasses';
import { formatMpa } from '@/lib/engineering';
import { getIconByName } from '@/lib/iconMap';

interface ComparisonModuleProps {
  strengthMPa: number;
  concreteClassName: string;
}

export function ComparisonModule({ strengthMPa, concreteClassName }: ComparisonModuleProps) {
  const [selectedComparison, setSelectedComparison] = useState<string | null>(null);

  const selected = useMemo(
    () => comparisons.find((comparison) => comparison.id === selectedComparison) ?? null,
    [selectedComparison],
  );
  const SelectedIcon = selected ? getIconByName(selected.icon) : null;

  return (
    <div className="glass-card mt-6 rounded-2xl border border-border/75 p-4 shadow-sm animate-rise-in-soft sm:mt-8 sm:p-6">
      <div className="mb-5 text-center sm:mb-6">
        <h3 className="mb-2 text-base text-muted-foreground sm:text-lg">Результат испытания</h3>
        <p className="text-xl font-semibold sm:text-2xl">
          Прочность <span className="text-primary">{concreteClassName}</span> составляет{' '}
          <span className="font-mono text-primary">{formatMpa(strengthMPa)}</span>
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-center text-sm text-muted-foreground">Сравните результат с инженерными аналогиями:</p>
        <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:grid-cols-3 sm:gap-3">
          {comparisons.map((comparison) => {
            const Icon = getIconByName(comparison.icon);
            const isSelected = selectedComparison === comparison.id;

            return (
              <button
                key={comparison.id}
                onClick={() => setSelectedComparison(isSelected ? null : comparison.id)}
                className={`
                  action-chip rounded-xl p-3.5 text-left sm:p-4
                  ${
                    isSelected
                      ? 'border-primary/35 bg-white/92 shadow-[0_12px_26px_-20px_hsl(var(--primary)/0.45)]'
                      : 'border-border/75 bg-white/72'
                  }
                `}
              >
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/60 sm:h-10 sm:w-10">
                  <Icon className="h-[18px] w-[18px] text-primary sm:h-5 sm:w-5" />
                </div>
                <div className="text-sm font-medium text-foreground">{comparison.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{comparison.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="glass-card mt-6 animate-rise-in-soft rounded-xl border border-primary/22 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/70 bg-white/80">
              {SelectedIcon && <SelectedIcon className="h-5 w-5 text-primary" />}
            </span>
            <div>
              <h4 className="mb-1 font-medium text-foreground">{selected.title}</h4>
              <p className="text-muted-foreground">{selected.calculate(strengthMPa)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
