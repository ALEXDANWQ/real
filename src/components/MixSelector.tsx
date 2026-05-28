import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { concreteClasses } from '@/data/concreteClasses';
import { calcEffectiveRequiredStrength, formatMpa, pickConcreteClassByStrength } from '@/lib/engineering';
import { getIconByName, type IconName } from '@/lib/iconMap';

interface ConstructionType {
  id: string;
  name: string;
  icon: IconName;
  minClass: string;
  description: string;
}

interface LoadCondition {
  id: string;
  name: string;
  multiplier: number;
  icon: IconName;
}

interface Environment {
  id: string;
  name: string;
  requirement: string;
  icon: IconName;
  factor: number;
}

const constructionTypes: ConstructionType[] = [
  {
    id: 'foundation_small',
    name: 'Фундамент частного дома',
    icon: 'home',
    minClass: 'B20',
    description: 'Ленточный или плитный фундамент для 1-2 этажей',
  },
  {
    id: 'foundation_multi',
    name: 'Фундамент многоэтажки',
    icon: 'building',
    minClass: 'B25',
    description: 'Монолитный фундамент для жилых и офисных зданий',
  },
  {
    id: 'slab',
    name: 'Плита перекрытия',
    icon: 'box',
    minClass: 'B25',
    description: 'Сборные и монолитные межэтажные перекрытия',
  },
  {
    id: 'column',
    name: 'Несущая колонна',
    icon: 'columns',
    minClass: 'B30',
    description: 'Каркасные элементы с повышенной нагрузкой',
  },
  {
    id: 'bridge',
    name: 'Мостовая конструкция',
    icon: 'bridge',
    minClass: 'B35',
    description: 'Опоры и пролеты транспортных мостов',
  },
  {
    id: 'highrise',
    name: 'Высотное здание',
    icon: 'highrise',
    minClass: 'B40',
    description: 'Несущие элементы зданий выше 20 этажей',
  },
  {
    id: 'metro',
    name: 'Тоннель / Метро',
    icon: 'train',
    minClass: 'B45',
    description: 'Подземные сооружения глубокого заложения',
  },
  {
    id: 'dam',
    name: 'Плотина',
    icon: 'dam',
    minClass: 'B50',
    description: 'Плотины, дамбы, шлюзовые камеры',
  },
];

const loadConditions: LoadCondition[] = [
  { id: 'static', name: 'Статическая нагрузка', multiplier: 1, icon: 'arrow-down' },
  { id: 'dynamic', name: 'Динамическая нагрузка', multiplier: 1.15, icon: 'activity' },
  { id: 'seismic', name: 'Сейсмическая зона', multiplier: 1.25, icon: 'zap' },
  { id: 'heavy', name: 'Повышенные нагрузки', multiplier: 1.35, icon: 'dumbbell' },
];

const environments: Environment[] = [
  { id: 'normal', name: 'Нормальные условия', requirement: 'Стандартная защита', icon: 'sun', factor: 0 },
  { id: 'wet', name: 'Влажная среда', requirement: 'Водонепроницаемость W6+', icon: 'droplets', factor: 0.08 },
  { id: 'frost', name: 'Морозы ниже -30°C', requirement: 'Морозостойкость F200+', icon: 'snowflake', factor: 0.1 },
  {
    id: 'aggressive',
    name: 'Агрессивная среда',
    requirement: 'Сульфатостойкий состав',
    icon: 'hazard',
    factor: 0.18,
  },
];

const loadCoefficientHints: Record<LoadCondition['id'], string> = {
  static: 'Базовый случай без динамического усиления: учитывается постоянная или плавно приложенная нагрузка.',
  dynamic: 'Учитывает вибрации и кратковременные ударные эффекты, которые повышают расчетное усилие относительно статики.',
  seismic: 'Добавляет запас на инерционные воздействия при сейсмических колебаниях и неравномерном перераспределении усилий.',
  heavy: 'Применяется при повышенных эксплуатационных нагрузках и локальных концентрациях напряжений.',
};

const environmentFactorHints: Record<Environment['id'], string> = {
  normal: 'Для обычных условий эксплуатации без выраженного ускоренного износа бетона.',
  wet: 'Добавляется запас на долговечность и снижение риска водонасыщения и циклического увлажнения конструкции.',
  frost: 'Учитывается работа бетона при частых циклах замораживания-оттаивания и повышенных требованиях к морозостойкости.',
  aggressive: 'Максимальная поправка для химически агрессивной среды, где требуется повышенная стойкость бетона.',
};

const loadActionTips: Record<LoadCondition['id'], string> = {
  static: 'Подойдет стандартный запас: без дополнительного усиления по динамике.',
  dynamic: 'Нужен запас под вибрации и кратковременные ударные нагрузки.',
  seismic: 'Для сейсмики обязательно закладывайте усиленный запас прочности.',
  heavy: 'При высоких нагрузках нужен повышенный контроль качества и ухода за бетоном.',
};

const environmentActionTips: Record<Environment['id'], string> = {
  normal: 'Достаточно стандартного состава с базовыми требованиями к долговечности.',
  wet: 'Рекомендуется водонепроницаемость не ниже W6 и контроль водоцементного отношения.',
  frost: 'Для морозов выбирайте состав с морозостойкостью не ниже F200.',
  aggressive: 'Используйте сульфатостойкий состав и дополнительные защитные меры.',
};

const hintTooltipClassName =
  'max-w-xs border-border/90 bg-card text-foreground opacity-100 shadow-[0_18px_38px_-28px_rgb(15_23_42/0.45)] text-xs leading-relaxed sm:text-sm';

export function MixSelector() {
  const [step, setStep] = useState(1);
  const [selectedConstruction, setSelectedConstruction] = useState<ConstructionType | null>(null);
  const [selectedLoad, setSelectedLoad] = useState<LoadCondition | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [showResult, setShowResult] = useState(false);

  const recommendation = useMemo(() => {
    if (!selectedConstruction || !selectedLoad || !selectedEnvironment) return null;

    const baseClass = concreteClasses.find((item) => item.name === selectedConstruction.minClass);
    if (!baseClass) return null;

    const requiredStrength = calcEffectiveRequiredStrength(
      baseClass.strengthMPa,
      selectedLoad.multiplier,
      selectedEnvironment.factor,
    );
    const recommendedClass = pickConcreteClassByStrength(requiredStrength);

    return { baseClass, requiredStrength, recommendedClass };
  }, [selectedConstruction, selectedEnvironment, selectedLoad]);

  const conciseRecommendations = useMemo(() => {
    if (!recommendation || !selectedLoad || !selectedEnvironment) return [];

    return [
      `Берите класс не ниже ${recommendation.recommendedClass.name} (${formatMpa(recommendation.recommendedClass.strengthMPa)}).`,
      loadActionTips[selectedLoad.id],
      environmentActionTips[selectedEnvironment.id],
    ];
  }, [recommendation, selectedEnvironment, selectedLoad]);

  const canProceed = () => {
    if (step === 1) return selectedConstruction !== null;
    if (step === 2) return selectedLoad !== null;
    if (step === 3) return selectedEnvironment !== null;
    return false;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => prev + 1);
      return;
    }
    setShowResult(true);
  };

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
      return;
    }
    if (step > 1) setStep((prev) => prev - 1);
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedConstruction(null);
    setSelectedLoad(null);
    setSelectedEnvironment(null);
    setShowResult(false);
  };

  const steps = [
    { stage: 1, label: 'Конструкция', mobileLabel: 'Тип' },
    { stage: 2, label: 'Нагрузки', mobileLabel: 'Нагрузка' },
    { stage: 3, label: 'Среда', mobileLabel: 'Среда' },
  ] as const;
  const stepProgress = (step - 1) / (steps.length - 1);

  return (
    <TooltipProvider delayDuration={140}>
      <div className="surface-panel overflow-hidden animate-rise-in-soft">
      {!showResult && (
        <div className="border-b border-border/70 bg-card/62 p-3.5 sm:p-5">
          <div className="relative">
            <div className="pointer-events-none absolute left-[16.6667%] right-[16.6667%] top-5 h-[2px] rounded-full bg-border/80" />
            <div
              className="pointer-events-none absolute left-[16.6667%] top-5 h-[2px] rounded-full bg-primary/70 transition-all duration-500"
              style={{ width: `calc((100% - 33.3334%) * ${stepProgress})` }}
            />
            <div className="grid grid-cols-3 gap-2">
              {steps.map(({ stage, label, mobileLabel }) => (
                <div key={stage} className="flex min-w-0 flex-col items-center text-center">
                  <div
                    className={`
                      relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold shadow-sm transition-colors duration-300
                      ${step === stage ? 'border-primary/24 bg-primary text-primary-foreground' : ''}
                      ${step > stage ? 'border-primary/24 bg-primary text-primary-foreground' : ''}
                      ${step < stage ? 'border-border/85 bg-muted text-foreground/75' : ''}
                    `}
                  >
                    {step > stage ? <Check className="h-5 w-5" /> : stage}
                  </div>
                  <span
                    className={`mt-2 text-[10px] font-medium sm:mt-3 sm:text-sm ${
                      step >= stage ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <span className="sm:hidden">{mobileLabel}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-3.5 sm:p-5">
        {!showResult && (
          <>
            {step === 1 && (
              <div className="space-y-4 animate-rise-in-soft">
                <h4 className="text-sm font-semibold text-foreground">Выберите тип конструкции</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {constructionTypes.map((type) => {
                    const Icon = getIconByName(type.icon);
                    const isSelected = selectedConstruction?.id === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedConstruction(type)}
                        className={`
                          action-chip relative rounded-2xl p-3.5 text-left sm:p-4
                          ${
                            isSelected
                              ? 'border-primary/28 bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.24)]'
                              : 'border-border/80 bg-card/86'
                          }
                        `}
                      >
                        {isSelected && (
                          <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/20 bg-primary text-primary-foreground">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
                          <span
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
                              isSelected
                                ? 'border-primary/20 bg-primary text-primary-foreground'
                                : 'border-border/90 bg-card text-foreground'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1 pr-9">
                            <div className="text-sm font-semibold leading-snug text-foreground">{type.name}</div>
                            <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{type.description}</div>
                          </div>
                          <span
                            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                              isSelected
                                ? 'border-primary/20 bg-primary text-primary-foreground'
                                : 'border-border/85 bg-muted text-foreground'
                            } self-start sm:self-auto`}
                          >
                            от {type.minClass}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-rise-in-soft">
                <h4 className="text-sm font-semibold text-foreground">Условия нагружения</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {loadConditions.map((load) => {
                    const Icon = getIconByName(load.icon);
                    const isSelected = selectedLoad?.id === load.id;
                    return (
                      <button
                        key={load.id}
                        onClick={() => setSelectedLoad(load)}
                        className={`
                          action-chip relative rounded-2xl p-3.5 text-left sm:p-4
                          ${
                            isSelected
                              ? 'border-primary/28 bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.24)]'
                              : 'border-border/80 bg-card/86'
                          }
                        `}
                      >
                        {isSelected && (
                          <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/20 bg-primary text-primary-foreground">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <div className="flex items-start gap-3">
                          <span
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
                              isSelected
                                ? 'border-primary/20 bg-primary text-primary-foreground'
                                : 'border-border/90 bg-card text-foreground'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1 pr-9">
                            <div className="font-semibold text-foreground">{load.name}</div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="mt-1 inline-flex max-w-full items-center gap-1 text-xs font-medium text-muted-foreground">
                                  Коэффициент ×{load.multiplier.toFixed(2)}
                                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                sideOffset={16}
                                align="start"
                                className={hintTooltipClassName}
                              >
                                {loadCoefficientHints[load.id]}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-rise-in-soft">
                <h4 className="text-sm font-semibold text-foreground">Условия эксплуатации</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {environments.map((env) => {
                    const Icon = getIconByName(env.icon);
                    const isSelected = selectedEnvironment?.id === env.id;
                    return (
                      <button
                        key={env.id}
                        onClick={() => setSelectedEnvironment(env)}
                        className={`
                          action-chip relative rounded-2xl p-3.5 text-left sm:p-4
                          ${
                            isSelected
                              ? 'border-primary/28 bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.24)]'
                              : 'border-border/80 bg-card/86'
                          }
                        `}
                      >
                        {isSelected && (
                          <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/20 bg-primary text-primary-foreground">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <div className="flex items-start gap-3">
                          <span
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
                              isSelected
                                ? 'border-primary/20 bg-primary text-primary-foreground'
                                : 'border-border/90 bg-card text-foreground'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1 pr-9">
                            <div className="font-semibold text-foreground">{env.name}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{env.requirement}</div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="mt-1 inline-flex max-w-full items-center gap-1 text-xs font-medium text-muted-foreground">
                                  Поправка +{Math.round(env.factor * 100)}%
                                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                sideOffset={16}
                                align="start"
                                className={hintTooltipClassName}
                              >
                                {environmentFactorHints[env.id]}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1}
                className="min-h-[44px] w-full justify-center gap-2 rounded-xl sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="min-h-[44px] w-full justify-center gap-2 rounded-xl sm:w-auto"
              >
                {step === 3 ? 'Показать рекомендацию' : 'Далее'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {showResult && recommendation && (
          <div className="grid animate-rise-in-soft gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:items-start">
            <div className="space-y-4 sm:space-y-5">
              <div className="relative overflow-hidden rounded-[1.65rem] border border-primary/30 bg-[linear-gradient(160deg,hsl(0_0%_100%),hsl(42_100%_97%))] p-5 shadow-[0_22px_48px_-34px_hsl(var(--primary)/0.46)] sm:p-7">
                <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/14 blur-2xl" />
                <div className="relative">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/90">Итог подбора</div>
                  <div className="mt-3 text-[clamp(2.1rem,6.2vw,3.5rem)] font-extrabold leading-none text-primary">
                    {recommendation.recommendedClass.name}
                  </div>
                  <div className="mt-2 font-mono text-lg text-foreground sm:text-xl">
                    {formatMpa(recommendation.recommendedClass.strengthMPa)}
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-primary/20 bg-white/90 px-3.5 py-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Базовый минимум</div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        {recommendation.baseClass.name} ({formatMpa(recommendation.baseClass.strengthMPa)})
                      </div>
                    </div>
                    <div className="rounded-xl border border-primary/20 bg-white/90 px-3.5 py-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Расчетная прочность</div>
                      <div className="mt-1 text-sm font-semibold text-foreground">{formatMpa(recommendation.requiredStrength)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/75 bg-white/88 p-4 shadow-[0_16px_30px_-30px_rgb(15_23_42/0.35)] sm:p-5">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
                  <Info className="h-4 w-4 text-primary" />
                  Краткие рекомендации
                </h4>
                <div className="mt-3 space-y-2.5">
                  {conciseRecommendations.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-white px-3 py-2.5">
                      <span className="mt-[2px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                      <p className="text-sm leading-relaxed text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-card/75 px-3.5 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/75" />
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Рекомендация предварительная. Финальный подбор состава выполняется по проекту, геологии и требованиям
                  нормативной документации.
                </p>
              </div>

              <Button variant="outline" onClick={resetWizard} className="w-full sm:w-auto">
                Начать заново
              </Button>
            </div>

            <aside className="relative overflow-hidden rounded-[1.65rem] border border-slate-300/95 bg-[linear-gradient(180deg,hsl(0_0%_100%),hsl(40_100%_98%))] p-5 shadow-[0_28px_56px_-36px_rgb(15_23_42/0.34)] sm:p-6">
              <div aria-hidden className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-primary/12 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-12 -right-8 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative space-y-4">
                <div>
                  <div className="text-sm font-semibold text-muted-foreground">Заявка</div>
                  <h4 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Заказать консультацию</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Подставили ваш результат в заявку. Остается заполнить контакты.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="mix-name">
                      Имя
                    </label>
                    <input
                      id="mix-name"
                      type="text"
                      placeholder="Как к вам обращаться"
                      className="h-11 w-full rounded-xl border border-slate-300/90 bg-white px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary/45"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="mix-phone">
                      Телефон
                    </label>
                    <input
                      id="mix-phone"
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      className="h-11 w-full rounded-xl border border-slate-300/90 bg-white px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-primary/45"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="mix-comment">
                      Комментарий
                    </label>
                    <textarea
                      id="mix-comment"
                      defaultValue={`Нужна консультация по классу ${recommendation.recommendedClass.name} для задачи: ${selectedConstruction?.name}.`}
                      className="min-h-[116px] w-full resize-none rounded-xl border border-slate-300/90 bg-white px-3.5 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary/45"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-primary/22 bg-primary/8 px-3.5 py-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Подобранный класс</div>
                  <div className="mt-1 text-lg font-bold text-primary">{recommendation.recommendedClass.name}</div>
                </div>

                <button
                  type="button"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-primary/40 bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/95"
                >
                  Отправить заявку
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
      </div>
    </TooltipProvider>
  );
}
