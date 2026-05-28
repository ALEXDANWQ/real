import { createContext } from 'react';
import type { ConcreteClass } from '@/data/concreteClasses';

export interface ConcreteSelectionContextValue {
  selectedClassId: string;
  selectedClass: ConcreteClass;
  setSelectedClassId: (id: string) => void;
}

export const ConcreteSelectionContext = createContext<ConcreteSelectionContextValue | null>(null);
