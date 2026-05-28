import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdvancedComparator } from '@/components/AdvancedComparator';
import { Header } from '@/components/Header';
import { MixSelector } from '@/components/MixSelector';

describe('mobile adaptivity contracts', () => {
  it('keeps mobile menu trigger and items with touch-friendly sizes', () => {
    render(<Header activeSection="classes" onSectionChange={vi.fn()} />);

    const menuToggle = screen.getByRole('button', { name: /Открыть меню|Закрыть меню/i });
    expect(menuToggle.className).toContain('h-10');
    expect(menuToggle.className).toContain('w-10');

    fireEvent.click(menuToggle);

    const mapItems = screen.getAllByRole('button', { name: /Доставка/i });
    const mobileMapItem = mapItems.find((item) => item.className.includes('min-h-[46px]'));
    expect(mobileMapItem).toBeTruthy();

    const locationItems = screen.getAllByRole('button', { name: /Расположение/i });
    const mobileLocationItem = locationItems.find((item) => item.className.includes('min-h-[46px]'));
    expect(mobileLocationItem).toBeTruthy();
  });

  it('keeps navigation controls in mix selector touch-friendly', () => {
    render(<MixSelector />);

    const nextButton = screen.getByRole('button', { name: /Далее/i });
    expect(nextButton.className).toContain('min-h-[44px]');
  });

  it('keeps advanced comparator usable on mobile with horizontal chips and without internal scroll trap', () => {
    const { container } = render(<AdvancedComparator />);

    const selectedClassChip = screen.getByRole('button', { name: 'B25' });
    expect(selectedClassChip.className).toContain('shrink-0');

    const classChipsContainer = selectedClassChip.parentElement;
    expect(classChipsContainer?.className).toContain('overflow-x-auto');

    const scrollTrapPane = container.querySelector('div.overflow-y-auto.overscroll-contain');
    expect(scrollTrapPane).toBeNull();

    const objectsGrid = container.querySelector('div.grid.grid-cols-1');
    expect(objectsGrid).toBeTruthy();
  });

  it('navigates to section from mobile menu without reverting scroll', () => {
    const onSectionChange = vi.fn();
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });

    const target = document.createElement('section');
    target.id = 'map';
    document.body.appendChild(target);
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      width: 0,
      height: 0,
      x: 0,
      y: 560,
      top: 560,
      right: 0,
      bottom: 560,
      left: 0,
      toJSON: () => ({}),
    });

    render(<Header activeSection="classes" onSectionChange={onSectionChange} />);

    const menuToggle = screen.getByRole('button', { name: /Открыть меню|Закрыть меню/i });
    fireEvent.click(menuToggle);

    const mapItems = screen.getAllByRole('button', { name: /Доставка/i });
    const mobileMapItem = mapItems.find((item) => item.className.includes('min-h-[46px]'));
    expect(mobileMapItem).toBeTruthy();

    if (mobileMapItem) {
      fireEvent.click(mobileMapItem);
    }

    expect(onSectionChange).toHaveBeenCalledWith('map');
    const lastCall = scrollToSpy.mock.calls.at(-1)?.[0];
    expect(lastCall).toMatchObject({ behavior: 'smooth' });

    rafSpy.mockRestore();
    scrollToSpy.mockRestore();
    target.remove();
  });
});

