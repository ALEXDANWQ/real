import type { LucideIcon } from 'lucide-react';
import {
  IconActivity,
  IconArrowDown,
  IconBook,
  IconBox,
  IconBridge,
  IconBuilding,
  IconCar,
  IconColumns,
  IconDam,
  IconDroplets,
  IconDumbbell,
  IconHand,
  IconHazard,
  IconHighrise,
  IconHome,
  IconLab,
  IconLandmark,
  IconPerson,
  IconShip,
  IconSnowflake,
  IconSun,
  IconTrain,
  IconWater,
  IconWeight,
  IconZap,
} from '@/components/icons/custom-icons';

export type IconName =
  | 'home'
  | 'building'
  | 'box'
  | 'columns'
  | 'bridge'
  | 'dam'
  | 'highrise'
  | 'train'
  | 'water'
  | 'arrow-down'
  | 'activity'
  | 'zap'
  | 'dumbbell'
  | 'sun'
  | 'droplets'
  | 'snowflake'
  | 'hazard'
  | 'person'
  | 'car'
  | 'book'
  | 'hand'
  | 'weight'
  | 'ship'
  | 'lab'
  | 'landmark';

export const iconMap: Record<IconName, LucideIcon> = {
  home: IconHome,
  building: IconBuilding,
  box: IconBox,
  columns: IconColumns,
  bridge: IconBridge,
  dam: IconDam,
  highrise: IconHighrise,
  train: IconTrain,
  water: IconWater,
  'arrow-down': IconArrowDown,
  activity: IconActivity,
  zap: IconZap,
  dumbbell: IconDumbbell,
  sun: IconSun,
  droplets: IconDroplets,
  snowflake: IconSnowflake,
  hazard: IconHazard,
  person: IconPerson,
  car: IconCar,
  book: IconBook,
  hand: IconHand,
  weight: IconWeight,
  ship: IconShip,
  lab: IconLab,
  landmark: IconLandmark,
};

export const getIconByName = (name: IconName): LucideIcon => iconMap[name];

