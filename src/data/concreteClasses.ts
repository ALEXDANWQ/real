import type { IconName } from '@/lib/iconMap';

export interface ConcreteClass {
  id: string;
  name: string;
  strengthMPa: number;
  application: string;
  category: 'light' | 'medium' | 'heavy' | 'ultra';
  description: string;
}

export const concreteClasses: ConcreteClass[] = [
  {
    id: 'b10',
    name: 'B10',
    strengthMPa: 13.1,
    application: 'Подготовительные слои, бетонная подготовка',
    category: 'light',
    description:
      'Применяется для подготовки основания под фундаменты, подбетонки, выравнивающих слоев и временных конструкций.',
  },
  {
    id: 'b15',
    name: 'B15',
    strengthMPa: 19.6,
    application: 'Стяжки, дорожки, ненагруженные площадки',
    category: 'light',
    description:
      'Подходит для стяжек полов, садовых дорожек, отмосток, а также мелких элементов благоустройства без высокой нагрузки.',
  },
  {
    id: 'b20',
    name: 'B20',
    strengthMPa: 26.2,
    application: 'Ленточные фундаменты частных домов',
    category: 'medium',
    description:
      'Используется для фундаментов малоэтажных зданий, площадок, лестничных маршей и несильно нагруженных монолитных элементов.',
  },
  {
    id: 'b25',
    name: 'B25',
    strengthMPa: 32.7,
    application: 'Фундаменты и плиты малоэтажного строительства',
    category: 'medium',
    description:
      'Универсальный класс для монолитных фундаментов, плит перекрытия, стен и колонн при умеренных эксплуатационных нагрузках.',
  },
  {
    id: 'b30',
    name: 'B30',
    strengthMPa: 39.3,
    application: 'Монолитные каркасы и перекрытия',
    category: 'medium',
    description:
      'Применяется в монолитных каркасах жилых и общественных зданий, несущих стенах и колоннах с повышенными требованиями.',
  },
  {
    id: 'b35',
    name: 'B35',
    strengthMPa: 45.8,
    application: 'Мостовые элементы и транспортные сооружения',
    category: 'heavy',
    description:
      'Используется для мостовых опор, эстакад, плит проезжей части, а также ответственных элементов инфраструктуры.',
  },
  {
    id: 'b40',
    name: 'B40',
    strengthMPa: 52.4,
    application: 'Высотные здания и нагруженные колонны',
    category: 'heavy',
    description:
      'Подходит для несущих конструкций высотных зданий, жестких ядeр и элементов, работающих при высоких сжимающих усилиях.',
  },
  {
    id: 'b45',
    name: 'B45',
    strengthMPa: 58.9,
    application: 'Тоннели, метро, подземные сооружения',
    category: 'heavy',
    description:
      'Применяется в подземном строительстве, тюбингах, тоннельных обделках и участках с повышенной водонагруженностью.',
  },
  {
    id: 'b50',
    name: 'B50',
    strengthMPa: 65.5,
    application: 'Гидротехника и специальные объекты',
    category: 'ultra',
    description:
      'Используется для сооружений с высокими требованиями к прочности и долговечности: дамб, плотин, специальных фундаментов.',
  },
  {
    id: 'b55',
    name: 'B55',
    strengthMPa: 72.0,
    application: 'Сильно нагруженные опоры и ядра',
    category: 'ultra',
    description:
      'Подходит для уникальных инженерных задач, высотных каркасов и зон с концентрированными нагрузками.',
  },
  {
    id: 'b60',
    name: 'B60',
    strengthMPa: 78.6,
    application: 'Высокопрочные каркасы и гидросооружения',
    category: 'ultra',
    description:
      'Применяется в несущих системах высокого класса ответственности и объектах, требующих большого запаса прочности.',
  },
  {
    id: 'b70',
    name: 'B70',
    strengthMPa: 91.7,
    application: 'Уникальные высотные и инфраструктурные объекты',
    category: 'ultra',
    description:
      'Используется для особо ответственных конструкций с экстремальными эксплуатационными нагрузками и длительным сроком службы.',
  },
  {
    id: 'b80',
    name: 'B80',
    strengthMPa: 104.8,
    application: 'Специальные инженерные конструкции',
    category: 'ultra',
    description:
      'Предназначен для элементов с очень высоким уровнем напряжений, где требуется сверхвысокая несущая способность.',
  },
  {
    id: 'b90',
    name: 'B90',
    strengthMPa: 117.9,
    application: 'Сверхответственные и экспериментальные объекты',
    category: 'ultra',
    description:
      'Сверхпрочный бетон для конструкций предельного класса ответственности, где критичны минимальные деформации и максимальная прочность.',
  },
];

export interface Comparison {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  calculate: (mpa: number) => string;
}

const round = (value: number, digits = 1): string => value.toFixed(digits);

export const comparisons: Comparison[] = [
  {
    id: 'cars',
    title: 'Легковые автомобили',
    description: 'Эквивалент давления через вес автомобилей',
    icon: 'car',
    calculate: (mpa: number) => {
      const palmAreaM2 = 0.01; // 100 см2
      const pressureN = mpa * 1_000_000 * palmAreaM2;
      const carWeightN = 1_500 * 9.81;
      const carsCount = Math.max(1, Math.round(pressureN / carWeightN));
      return `≈ ${carsCount} легковых авто массой 1.5 т на площадке 10×10 см`;
    },
  },
  {
    id: 'ocean',
    title: 'Глубина воды',
    description: 'Гидростатический эквивалент давления',
    icon: 'water',
    calculate: (mpa: number) => {
      const rho = 1025; // кг/м3 (морская вода)
      const g = 9.81;
      const depth = (mpa * 1_000_000) / (rho * g);
      return `≈ давление морской воды на глубине ${Math.round(depth)} м`;
    },
  },
  {
    id: 'elephants',
    title: 'Африканские слоны',
    description: 'Эквивалент локального давления от массы',
    icon: 'weight',
    calculate: (mpa: number) => {
      const soleAreaM2 = 0.02; // 10×20 см
      const pressureN = mpa * 1_000_000 * soleAreaM2;
      const elephantWeightN = 6_000 * 9.81;
      const elephants = Math.max(1, Math.round(pressureN / elephantWeightN));
      return `≈ ${elephants} слонов массой 6 т на площадке 10×20 см`;
    },
  },
];

export const getCategoryColor = (category: ConcreteClass['category']) => {
  switch (category) {
    case 'light':
      return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
    case 'medium':
      return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
    case 'heavy':
      return 'bg-amber-500/20 text-amber-600 border-amber-500/30';
    case 'ultra':
      return 'bg-rose-500/20 text-rose-600 border-rose-500/30';
  }
};

export const getCategoryLabel = (category: ConcreteClass['category']) => {
  switch (category) {
    case 'light':
      return 'Легкий';
    case 'medium':
      return 'Средний';
    case 'heavy':
      return 'Тяжелый';
    case 'ultra':
      return 'Сверхпрочный';
  }
};

export const findConcreteClassById = (id: string): ConcreteClass | undefined =>
  concreteClasses.find((item) => item.id === id);

export const getDefaultConcreteClassId = (): string => 'b25';

export const formatConcreteStrength = (strengthMPa: number): string => `${round(strengthMPa)} МПа`;

