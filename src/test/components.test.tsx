import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConcreteCard } from '@/components/ConcreteCard';
import { ComparisonModule } from '@/components/ComparisonModule';
import { StrengthTest } from '@/components/StrengthTest';
import { concreteClasses } from '@/data/concreteClasses';

vi.mock('@/components/Cube3D', () => ({
  Cube3D: () => <div data-testid="cube-3d" />,
}));

describe('ConcreteCard', () => {
  it('calls onClick and renders class value', () => {
    const onClick = vi.fn();
    render(
      <ConcreteCard concreteClass={concreteClasses[0]} isSelected={false} onClick={onClick} index={0} />,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('B10')).toBeInTheDocument();
  });
});

describe('ComparisonModule', () => {
  it('shows selected comparison details', () => {
    render(<ComparisonModule strengthMPa={32.7} concreteClassName="B25" />);

    fireEvent.click(screen.getByRole('button', { name: /Легковые автомобили/i }));
    expect(screen.getByText(/Прочность/i)).toBeInTheDocument();
    expect(screen.getByText(/легковых авто/i)).toBeInTheDocument();
  });
});

describe('StrengthTest', () => {
  it('starts simulation and shows pause/continue controls', async () => {
    render(<StrengthTest concreteClass={concreteClasses[3]} />);
    await screen.findByTestId('cube-3d');

    fireEvent.click(screen.getByRole('button', { name: /Протестировать прочность/i }));
    expect(screen.getByRole('button', { name: /Пауза/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /С начала/i }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Пауза/i }));
    expect(screen.getByRole('button', { name: /Продолжить/i })).toBeInTheDocument();
  });
});
