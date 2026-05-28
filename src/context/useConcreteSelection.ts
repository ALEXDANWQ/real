import { useContext } from 'react';
import { ConcreteSelectionContext } from './concrete-selection-context';

export function useConcreteSelection() {
  const context = useContext(ConcreteSelectionContext);
  if (!context) {
    throw new Error('useConcreteSelection must be used inside ConcreteSelectionProvider');
  }
  return context;
}
