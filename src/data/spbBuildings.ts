import type { IconName } from '@/lib/iconMap';

export interface Building {
  id: string;
  name: string;
  description: string;
  concreteClass: string;
  coordinates: [number, number];
  type: 'bridge' | 'building' | 'infrastructure' | 'monument';
  yearBuilt?: number;
  source?: string;
  sourceUrl?: string;
}

export const spbBuildings: Building[] = [
  {
    id: 'spb-1',
    name: 'Жилой комплекс "Балтийская жемчужина"',
    description: 'Крупный жилой район комплексной застройки на юго-западе города.',
    concreteClass: 'B25',
    coordinates: [59.8508, 30.1458],
    type: 'building',
    yearBuilt: 2015,
    source: 'Официальные материалы застройщика; класс бетона — инженерная оценка для несущих ж/б конструкций',
    sourceUrl: 'https://bpearl.net/',
  },
  {
    id: 'spb-2',
    name: 'ТРЦ "Галерея"',
    description: 'Крупный торгово-развлекательный центр в центральной части города.',
    concreteClass: 'B30',
    coordinates: [59.9299, 30.3612],
    type: 'building',
    yearBuilt: 2010,
    source: 'Официальный сайт ТРЦ и открытые публикации; класс бетона — инженерная оценка',
    sourceUrl: 'https://en.wikipedia.org/wiki/Galeria_(Saint_Petersburg)',
  },
  {
    id: 'spb-3',
    name: 'Большой Обуховский мост',
    description: 'Вантовый мост через Неву, один из ключевых транспортных переходов.',
    concreteClass: 'B45',
    coordinates: [59.8543, 30.4878],
    type: 'bridge',
    yearBuilt: 2004,
    source: 'Официальные сведения о мосте; класс бетона — инженерная оценка для мостовых опор',
    sourceUrl: 'https://en.wikipedia.org/wiki/Big_Obukhovsky_Bridge',
  },
  {
    id: 'spb-4',
    name: 'Лахта Центр',
    description: 'Высотный комплекс с повышенными требованиями к прочности несущих элементов.',
    concreteClass: 'B40',
    coordinates: [59.9871, 30.1775],
    type: 'building',
    yearBuilt: 2019,
    source: 'Официальный сайт Лахта Центра; класс бетона — инженерная оценка для высотного каркаса',
    sourceUrl: 'https://lakhta.center/',
  },
  {
    id: 'spb-5',
    name: 'Станция метро "Адмиралтейская"',
    description: 'Глубокая станция метрополитена с высокими требованиями к подземным конструкциям.',
    concreteClass: 'B45',
    coordinates: [59.9365, 30.3146],
    type: 'infrastructure',
    yearBuilt: 2011,
    source: 'Открытые данные метрополитена; класс бетона — инженерная оценка для подземных сооружений',
    sourceUrl: 'https://ru.wikipedia.org/wiki/Адмиралтейская_(станция_метро)',
  },
  {
    id: 'spb-6',
    name: 'Комплекс защитных сооружений Санкт-Петербурга',
    description: 'Дамба и инженерные элементы защиты города от наводнений.',
    concreteClass: 'B50',
    coordinates: [59.9912, 29.7687],
    type: 'infrastructure',
    yearBuilt: 2011,
    source: 'Дирекция КЗС и официальные публикации; класс бетона — инженерная оценка для гидротехники',
    sourceUrl: 'https://www.dambaspb.ru/',
  },
  {
    id: 'spb-7',
    name: 'Мостовой узел ЗСД (центральный участок)',
    description: 'Ответственные эстакадные и опорные элементы скоростной автомагистрали.',
    concreteClass: 'B55',
    coordinates: [59.9148, 30.2305],
    type: 'bridge',
    yearBuilt: 2016,
    source: 'Официальные материалы ЗСД; класс бетона — инженерная оценка для транспортной инфраструктуры',
    sourceUrl: 'https://whsd.ru/',
  },
  {
    id: 'spb-8',
    name: 'Судоходный шлюз КЗС',
    description: 'Гидротехнические конструкции с интенсивным водонапорным воздействием.',
    concreteClass: 'B60',
    coordinates: [59.9849, 29.7164],
    type: 'infrastructure',
    yearBuilt: 2011,
    source: 'Материалы КЗС; класс бетона — инженерная оценка для гидротехнических конструкций',
    sourceUrl: 'https://dambaspb.ru/kak-ustroen-kzs',
  },
  {
    id: 'spb-9',
    name: 'Газпром Арена',
    description: 'Стадион с крупнопролетными и монолитными железобетонными конструкциями.',
    concreteClass: 'B40',
    coordinates: [59.9729, 30.2217],
    type: 'building',
    yearBuilt: 2017,
    source: 'Официальные материалы стадиона; класс бетона — инженерная оценка для несущих конструкций',
    sourceUrl: 'https://ru.wikipedia.org/wiki/Газпром_Арена',
  },
  {
    id: 'spb-10',
    name: 'Мариинский театр (Новая сцена)',
    description: 'Современный театральный комплекс с монолитным железобетонным каркасом.',
    concreteClass: 'B35',
    coordinates: [59.9258, 30.2967],
    type: 'building',
    yearBuilt: 2013,
    source: 'Официальные публикации о строительстве; класс бетона — инженерная оценка',
    sourceUrl: 'https://www.mariinsky.ru/about/history/mariinsky_ii/',
  },
  {
    id: 'spb-11',
    name: 'Аэропорт Пулково (терминал 1)',
    description: 'Пассажирский терминал с большими пролетами и массивными несущими элементами.',
    concreteClass: 'B35',
    coordinates: [59.8003, 30.2625],
    type: 'building',
    yearBuilt: 2013,
    source: 'Официальные данные аэропорта; класс бетона — инженерная оценка',
    sourceUrl: 'https://ru.wikipedia.org/wiki/Пулково_(аэропорт)',
  },
  {
    id: 'spb-12',
    name: 'Экспофорум',
    description: 'Крупный конгрессно-выставочный центр с монолитными и сборными ж/б конструкциями.',
    concreteClass: 'B30',
    coordinates: [59.7608, 30.3577],
    type: 'building',
    yearBuilt: 2014,
    source: 'Официальный сайт Экспофорума; класс бетона — инженерная оценка',
    sourceUrl: 'https://expoforum.ru/',
  },
  {
    id: 'spb-13',
    name: 'Ладожский вокзал',
    description: 'Крупный транспортный узел с железобетонными несущими элементами.',
    concreteClass: 'B30',
    coordinates: [59.9316, 30.4383],
    type: 'infrastructure',
    yearBuilt: 2003,
    source: 'Открытые данные РЖД и энциклопедические источники; класс бетона — инженерная оценка',
    sourceUrl: 'https://ru.wikipedia.org/wiki/Ладожский_вокзал',
  },
  {
    id: 'spb-14',
    name: 'Невская ратуша',
    description: 'Деловой комплекс с современным монолитным железобетонным каркасом.',
    concreteClass: 'B35',
    coordinates: [59.9389, 30.3715],
    type: 'building',
    yearBuilt: 2013,
    source: 'Официальные материалы проекта; класс бетона — инженерная оценка',
    sourceUrl: 'https://ru.wikipedia.org/wiki/Невская_ратуша',
  },
  {
    id: 'spb-15',
    name: 'Мост Бетанкура',
    description: 'Вантовый мост через Малую Неву с высокими требованиями к долговечности конструкций.',
    concreteClass: 'B40',
    coordinates: [59.951, 30.2598],
    type: 'bridge',
    yearBuilt: 2018,
    source: 'Официальные городские публикации о мосте; класс бетона — инженерная оценка',
    sourceUrl: 'https://ru.wikipedia.org/wiki/Мост_Бетанкура',
  },
  {
    id: 'spb-16',
    name: 'Александра-Невский мост',
    description: 'Крупный городской мостовой переход через Неву.',
    concreteClass: 'B35',
    coordinates: [59.9237, 30.3955],
    type: 'bridge',
    yearBuilt: 1965,
    source: 'Официальные сведения о мостах Санкт-Петербурга; класс бетона — инженерная оценка',
    sourceUrl: 'https://ru.wikipedia.org/wiki/Мост_Александра_Невского_(Санкт-Петербург)',
  },
  {
    id: 'spb-17',
    name: 'Дворцовый мост',
    description: 'Разводной мост через Неву, один из ключевых транспортных объектов центра города.',
    concreteClass: 'B30',
    coordinates: [59.9444, 30.308],
    type: 'bridge',
    yearBuilt: 1916,
    source: 'Официальные и энциклопедические данные; класс бетона — инженерная оценка для реконструированных ж/б элементов',
    sourceUrl: 'https://ru.wikipedia.org/wiki/Дворцовый_мост',
  },
  {
    id: 'spb-18',
    name: 'Троицкий мост',
    description: 'Исторический мостовой переход с современными реконструированными конструктивными элементами.',
    concreteClass: 'B30',
    coordinates: [59.9501, 30.3277],
    type: 'bridge',
    yearBuilt: 1903,
    source: 'Официальные данные о мосте; класс бетона — инженерная оценка',
    sourceUrl: 'https://ru.wikipedia.org/wiki/Троицкий_мост_(Санкт-Петербург)',
  },
  {
    id: 'spb-19',
    name: 'Литейный мост',
    description: 'Транспортный мост через Неву с высокими эксплуатационными нагрузками.',
    concreteClass: 'B30',
    coordinates: [59.9517, 30.339],
    type: 'bridge',
    yearBuilt: 1879,
    source: 'Официальные и энциклопедические сведения; класс бетона — инженерная оценка',
    sourceUrl: 'https://ru.wikipedia.org/wiki/Литейный_мост',
  },
  {
    id: 'spb-20',
    name: 'Станция метро "Беговая"',
    description: 'Современная станция метрополитена, рассчитанная на интенсивную эксплуатацию.',
    concreteClass: 'B40',
    coordinates: [59.9872, 30.203],
    type: 'infrastructure',
    yearBuilt: 2018,
    source: 'Открытые данные метрополитена; класс бетона — инженерная оценка для подземных сооружений',
    sourceUrl: 'https://ru.wikipedia.org/wiki/Беговая_(станция_метро,_Санкт-Петербург)',
  },
];

export const getBuildingsByClass = (concreteClass: string): Building[] =>
  spbBuildings.filter((building) => building.concreteClass === concreteClass);

export const getTypeIconName = (type: Building['type']): IconName => {
  switch (type) {
    case 'bridge':
      return 'bridge';
    case 'building':
      return 'building';
    case 'infrastructure':
      return 'train';
    case 'monument':
      return 'landmark';
  }
};

export const getTypeLabel = (type: Building['type']): string => {
  switch (type) {
    case 'bridge':
      return 'Мост';
    case 'building':
      return 'Здание';
    case 'infrastructure':
      return 'Инфраструктура';
    case 'monument':
      return 'Спецобъект';
  }
};
