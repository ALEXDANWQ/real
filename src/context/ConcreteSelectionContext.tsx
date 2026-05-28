import { useMemo, useState, type PropsWithChildren } from 'react';
import { concreteClasses, findConcreteClassById, getDefaultConcreteClassId } from '@/data/concreteClasses';
import { ConcreteSelectionContext } from './concrete-selection-context';

export function ConcreteSelectionProvider({ children }: PropsWithChildren) {
  const [selectedClassId, setSelectedClassIdState] = useState<string>(getDefaultConcreteClassId());

  const setSelectedClassId = (id: string) => {
    const exists = concreteClasses.some((item) => item.id === id);
    if (!exists) return;
    setSelectedClassIdState(id);
  };

  const selectedClass = findConcreteClassById(selectedClassId) ?? concreteClasses[0];

  const value = useMemo(
    () => ({
      selectedClassId,
      selectedClass,
      setSelectedClassId,
    }),
    [selectedClassId, selectedClass],
  );

  return <ConcreteSelectionContext.Provider value={value}>{children}</ConcreteSelectionContext.Provider>;
}
