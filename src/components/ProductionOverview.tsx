import { CalendarDays, FlaskConical, ShieldCheck, Truck, Users } from 'lucide-react';

const productionParagraphs = [
  'В 2017 году компания «РЕАЛ» открыла бетонный завод в г. Великие Луки Псковской области. Производство бетона ведется с использованием качественных материалов. Проверка сырья - важнейшее условие для производства качественной продукции. Поэтому на территории завода работает лаборатория, где весь материал проходит тщательную проверку.',
  'Штат организации полностью состоит из опытных, квалифицированных специалистов, прошедших специальную аттестацию. Многие из них работают в ООО «РЕАЛ» с момента его образования — 1998 года.',
  'ООО «РЕАЛ» обладает полным набором специальной техники, позволяющей вести работу в любых погодных условиях и в любое время года. Добытые полезные ископаемые перерабатываются на стационарных и мобильных дробильно-сортировочных комплексах отечественного и импортного производства. В 2017 году «РЕАЛ» приобрел новую бетоносмесительную установку для производства товарного бетона и строительных растворов различных марок, а также новый специальный транспорт для транспортировки и подачи бетонных смесей потребителям. Сегодня компания продолжает развивать направления деятельности, связанные с инертными материалами, активно вкладывает материальные средства в приобретение нового автотранспорта, спецтехники и оборудования.',
  'Компания «РЕАЛ» продолжает развиваться по сей день. Хотите качественные материалы и сервис на высшем уровне? Обращайтесь к нам! Мы всегда рады продуктивному сотрудничеству!',
];

const keyFacts = [
  {
    icon: CalendarDays,
    title: 'Основан в',
    value: '2017 г.',
    caption: 'Запуск современной производственной площадки',
  },
  {
    icon: FlaskConical,
    title: 'Собственная лаборатория',
    value: 'Контроль сырья',
    caption: 'Проверка качества каждой партии материалов',
  },
  {
    icon: Users,
    title: 'Квалифицированные сотрудники',
    value: '800+',
    caption: 'Специалистов в штате компании',
  },
];

const capabilities = [
  { icon: ShieldCheck, text: 'Аттестованные специалисты с большим практическим опытом' },
  { icon: Truck, text: 'Собственный спецтранспорт для подачи бетонных смесей' },
];

export function ProductionOverview() {
  return (
    <section className="relative overflow-hidden rounded-[1.85rem] bg-[linear-gradient(155deg,hsl(0_0%_100%),hsl(214_62%_99%),hsl(214_48%_96%))] px-4 py-5 shadow-[0_24px_54px_-36px_rgb(15_23_42/0.35)] sm:px-6 sm:py-7 md:px-8 md:py-9 dark:bg-[linear-gradient(155deg,hsl(220_34%_11%),hsl(219_30%_10%),hsl(222_35%_8%))] dark:shadow-[0_28px_58px_-36px_rgb(2_6_23/0.9)]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-6 h-52 w-52 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute bottom-2 left-4 h-40 w-40 rounded-full bg-amber-300/16 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 sm:space-y-8">
        <div className="overflow-hidden rounded-2xl border border-slate-300/90 bg-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_20px_36px_-28px_rgb(15_23_42/0.35)] dark:border-white/15 dark:bg-white/[0.06] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="grid grid-cols-1 divide-y divide-slate-300/90 lg:grid-cols-3 lg:divide-x lg:divide-y-0 dark:divide-white/15">
            {keyFacts.map((fact) => {
              const Icon = fact.icon;

              return (
                <article key={fact.title} className="bg-white/35 px-4 py-4 sm:px-5 sm:py-5 dark:bg-white/[0.01]">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-slate-300">{fact.title}</p>
                  <p className="mt-0.5 text-[clamp(1.2rem,3.4vw,1.95rem)] font-bold leading-tight text-foreground dark:text-white">
                    {fact.value}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground dark:text-slate-300">{fact.caption}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {capabilities.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.text}
                className="grid grid-cols-[auto,1fr] items-center gap-3 rounded-2xl border border-slate-300/90 bg-white/76 px-4 py-3 text-foreground shadow-[0_14px_28px_-24px_rgb(15_23_42/0.32)] dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-100"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-sm leading-[1.35]">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-300/90 bg-white/90 p-4 shadow-[0_20px_38px_-28px_rgb(15_23_42/0.34)] sm:p-6 dark:border-white/15 dark:bg-white/[0.06] dark:shadow-none">
          <div className="space-y-5 text-[clamp(1rem,2.2vw,1.15rem)] leading-relaxed text-foreground dark:text-slate-100">
            {productionParagraphs.map((paragraph, index) => (
              <p key={`paragraph-${index}`}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
