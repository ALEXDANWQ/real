import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdvancedComparator } from '@/components/AdvancedComparator';
import { WhatIfModule } from '@/components/WhatIfModule';

describe('cross-module class selection independence', () => {
  it('does not update comparator when class changes in WhatIf module', () => {
    render(
      <>
        <WhatIfModule />
        <AdvancedComparator />
      </>,
    );

    const getPressedB25 = () =>
      screen
        .getAllByRole('button', { name: 'B25' })
        .find((button) => button.getAttribute('aria-pressed') === 'true');

    expect(getPressedB25()).toBeTruthy();

    const whatIfB40 = screen
      .getAllByRole('button', { name: 'B40' })
      .find((button) => !button.hasAttribute('aria-pressed'));

    expect(whatIfB40).toBeTruthy();
    fireEvent.click(whatIfB40 as HTMLElement);

    expect(screen.getAllByText(/52\.4/).length).toBeGreaterThan(0);
    expect(getPressedB25()).toBeTruthy();
  });
});
