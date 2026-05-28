import { CircleDollarSign, Fuel, ShieldCheck, Truck } from 'lucide-react';

const mixerRates = [
  'автобетоносмеситель до 9 м³ — 190 руб./1 км пути;',
  'автобетоносмеситель до 10 м³ — 200 руб./1 км пути;',
  'автобетоносмеситель до 12 м³ — 230 руб./1 км пути.',
];

const pumpRates = [
  'первые три часа работы — 20 000 руб;',
  'каждый последующий час работы — 3 000 руб.',
];

const dumpTruckRates = [
  'Цена доставки по г. Великие Луки — 2000 руб.',
  'Цена за г. Великие Луки — 160 руб./1 км пути.',
];

export function DeliveryOverview() {
  return (
    <section className="relative overflow-hidden rounded-[1.85rem] bg-[linear-gradient(155deg,hsl(0_0%_100%),hsl(214_62%_99%),hsl(214_48%_96%))] px-4 py-5 shadow-[0_24px_54px_-36px_rgb(15_23_42/0.35)] sm:px-6 sm:py-7 md:px-8 md:py-9 dark:bg-[linear-gradient(155deg,hsl(220_34%_11%),hsl(219_30%_10%),hsl(222_35%_8%))] dark:shadow-[0_28px_58px_-36px_rgb(2_6_23/0.9)]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-8 h-52 w-52 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute bottom-4 left-3 h-40 w-40 rounded-full bg-amber-300/16 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-300/90 bg-white/85 px-3 py-2.5 text-sm text-foreground shadow-[0_10px_22px_-22px_rgb(15_23_42/0.35)] dark:border-white/15 dark:bg-white/[0.05] dark:text-slate-100">
            Псковская область
          </div>
          <div className="rounded-xl border border-slate-300/90 bg-white/85 px-3 py-2.5 text-sm text-foreground shadow-[0_10px_22px_-22px_rgb(15_23_42/0.35)] dark:border-white/15 dark:bg-white/[0.05] dark:text-slate-100">
            Тверская область
          </div>
          <div className="rounded-xl border border-slate-300/90 bg-white/85 px-3 py-2.5 text-sm text-foreground shadow-[0_10px_22px_-22px_rgb(15_23_42/0.35)] dark:border-white/15 dark:bg-white/[0.05] dark:text-slate-100">
            Смоленская область
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <article className="rounded-2xl border border-slate-300/90 bg-white/90 p-4 shadow-[0_16px_34px_-26px_rgb(15_23_42/0.35)] sm:p-5 dark:border-white/15 dark:bg-white/[0.05]">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="text-xl font-bold text-foreground dark:text-white">Автобетоносмеситель</h4>

            <div className="mt-4 space-y-4 text-[clamp(1rem,2vw,1.12rem)] leading-relaxed text-foreground dark:text-slate-100">
              <p>Цена доставки по г. Великие Луки — 5000 руб.</p>
              <div>
                <p className="font-semibold">Цена за г. Великие Луки:</p>
                <ul className="mt-2 space-y-1.5">
                  {mixerRates.map((rate) => (
                    <li key={rate} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{rate}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p>Возможен самовывоз продукции с отгрузкой в автотранспорт покупателя.</p>
              <p>Расчетное время разгрузки одного автобетоносмесителя, включенное в стоимость доставки — 1 час.</p>
              <p>
                В случае превышения времени разгрузки над расчетным по вине Покупателя, Покупатель оплачивает работу автобетоносмесителя
                на объекте из расчета — 3 000 руб. с НДС 20 % за каждый дополнительный час в пределах 3-х часов.
              </p>
            </div>
          </article>

          <div className="space-y-4">
            <article className="rounded-2xl border border-slate-300/90 bg-white/90 p-4 shadow-[0_16px_34px_-26px_rgb(15_23_42/0.35)] sm:p-5 dark:border-white/15 dark:bg-white/[0.05]">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Fuel className="h-5 w-5" />
              </div>
              <h4 className="text-xl font-bold text-foreground dark:text-white">Автобетононасос</h4>
              <ul className="mt-4 space-y-2 text-[clamp(1rem,2vw,1.12rem)] leading-relaxed text-foreground dark:text-slate-100">
                {pumpRates.map((rate) => (
                  <li key={rate} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{rate}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[clamp(1rem,2vw,1.12rem)] leading-relaxed text-foreground dark:text-slate-100">
                Перебазировка насоса — 190 руб./км.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-300/90 bg-white/90 p-4 shadow-[0_16px_34px_-26px_rgb(15_23_42/0.35)] sm:p-5 dark:border-white/15 dark:bg-white/[0.05]">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CircleDollarSign className="h-5 w-5" />
              </div>
              <h4 className="text-xl font-bold text-foreground dark:text-white">Самосвал</h4>
              <ul className="mt-4 space-y-2 text-[clamp(1rem,2vw,1.12rem)] leading-relaxed text-foreground dark:text-slate-100">
                {dumpTruckRates.map((rate) => (
                  <li key={rate} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{rate}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[clamp(1rem,2vw,1.12rem)] leading-relaxed text-foreground dark:text-slate-100">
                Перебазировка насоса — 190 руб./км.
              </p>
            </article>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/35 bg-primary/8 px-4 py-3.5 text-center shadow-[0_14px_26px_-20px_hsl(var(--primary)/0.52)] dark:bg-primary/15">
          <div className="inline-flex items-center gap-2 text-[clamp(1.05rem,2.2vw,1.45rem)] font-bold text-foreground dark:text-white">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Минимальный заказ любой продукции — от 0,5 м³.
          </div>
        </div>
      </div>
    </section>
  );
}

