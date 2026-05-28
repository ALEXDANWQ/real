import { ArrowUpRight } from 'lucide-react';
import { concreteClasses, type ConcreteClass, getCategoryColor, getCategoryLabel } from '@/data/concreteClasses';

interface ConcreteCardProps {
  concreteClass: ConcreteClass;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

const getCategoryStripColor = (category: ConcreteClass['category']): string => {
  switch (category) {
    case 'light':
      return 'bg-emerald-500';
    case 'medium':
      return 'bg-blue-500';
    case 'heavy':
      return 'bg-amber-500';
    case 'ultra':
      return 'bg-rose-500';
  }
};

export function ConcreteCard({ concreteClass, isSelected, onClick, index }: ConcreteCardProps) {
  const categoryColor = getCategoryColor(concreteClass.category);
  const categoryLabel = getCategoryLabel(concreteClass.category);
  const categoryStripColor = getCategoryStripColor(concreteClass.category);
  const maxStrength = concreteClasses[concreteClasses.length - 1].strengthMPa;

  return (
    <button
      onClick={onClick}
      className={`
        glass-card group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/75 p-4 text-left transition-all duration-300 ease-out sm:p-5
        animate-rise-in-soft opacity-0
        ${
          isSelected
            ? 'border-primary/30 bg-card/92 shadow-[0_14px_28px_-24px_hsl(var(--primary)/0.4)]'
            : 'hover:-translate-y-1 hover:border-primary/28 hover:bg-card/88 hover:shadow-[0_18px_34px_-24px_rgb(15_23_42/0.35)]'
        }
      `}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <div
        className={`mb-3 inline-flex w-fit self-start items-center gap-2 rounded-lg border px-2 py-1 text-[11px] font-semibold tracking-wide transition-colors sm:text-xs ${categoryColor}`}
      >
        <span className="inline-flex items-center gap-0.5">
          <span className={`h-1 w-2 rounded-full ${categoryStripColor}`} />
          <span className={`h-1 w-1.5 rounded-full ${categoryStripColor} opacity-60`} />
        </span>
        {categoryLabel}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <span
          className={`text-2xl font-bold tracking-tight transition-colors duration-300 sm:text-3xl ${
            isSelected ? 'text-foreground' : 'text-foreground group-hover:text-primary'
          }`}
        >
          {concreteClass.name}
        </span>
        <ArrowUpRight
          className={`h-5 w-5 transition-all duration-300 ${
            isSelected
              ? 'text-primary opacity-100'
              : 'translate-y-0.5 text-muted-foreground opacity-40 sm:opacity-0 group-hover:translate-y-0 group-hover:translate-x-0.5 group-hover:opacity-100'
          }`}
        />
      </div>

      <div className="mb-3 flex items-baseline gap-1.5">
        <span className="font-mono text-xl font-semibold text-foreground">{concreteClass.strengthMPa}</span>
        <span className="text-sm text-muted-foreground">МПа</span>
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{concreteClass.application}</p>

      <div className="mt-auto pt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isSelected ? 'bg-primary/70' : 'bg-muted-foreground/20 group-hover:bg-primary/60'
            }`}
            style={{ width: `${(concreteClass.strengthMPa / maxStrength) * 100}%` }}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/0 transition-all duration-500 group-hover:from-white/15 group-hover:to-transparent" />
    </button>
  );
}
