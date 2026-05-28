import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SPBMap } from '@/components/SPBMap';

interface MockPlacemark {
  coordinates: [number, number];
  properties: Record<string, unknown>;
  options: Record<string, unknown>;
  __handlers: Record<string, () => void>;
  events: {
    add: ReturnType<typeof vi.fn>;
  };
}

const createdPlacemarks: MockPlacemark[] = [];

const mapMock = {
  geoObjects: {
    add: vi.fn(),
    remove: vi.fn(),
  },
  behaviors: {
    disable: vi.fn(),
  },
  options: {
    set: vi.fn(),
  },
  container: {
    fitToViewport: vi.fn(),
  },
  setCenter: vi.fn(),
  destroy: vi.fn(),
};

const mapCtorMock = vi.fn(() => mapMock);
const placemarkCtorMock = vi.fn(
  (
    coordinates: [number, number],
    properties: Record<string, unknown> = {},
    options: Record<string, unknown> = {},
  ) => {
    const handlers: Record<string, () => void> = {};

    const placemark: MockPlacemark = {
      coordinates,
      properties,
      options,
      __handlers: handlers,
      events: {
        add: vi.fn((eventName: string, handler: () => void) => {
          handlers[eventName] = handler;
        }),
      },
    };

    createdPlacemarks.push(placemark);
    return placemark;
  },
);

const loadYandexMapsMock = vi.fn(
  async (_apiKey: string, _options?: { fetchPriority?: 'high' | 'low' | 'auto' }) => ({
    Map: mapCtorMock,
    Placemark: placemarkCtorMock,
    ready: (cb: () => void) => cb(),
  }),
);

vi.mock('@/lib/yandexMapsLoader', () => ({
  loadYandexMaps: (apiKey: string, options?: { fetchPriority?: 'high' | 'low' | 'auto' }) =>
    loadYandexMapsMock(apiKey, options),
}));

function renderMap() {
  return render(<SPBMap apiKey="test-key" />);
}

function triggerPlacemarkClickByHint(pattern: RegExp) {
  const placemark = createdPlacemarks.find((item) => pattern.test(String(item.properties.hintContent ?? '')));
  expect(placemark).toBeDefined();
  act(() => {
    placemark?.__handlers.click?.();
  });
}

describe('SPBMap', () => {
  beforeEach(() => {
    createdPlacemarks.length = 0;
    loadYandexMapsMock.mockClear();
    mapCtorMock.mockClear();
    placemarkCtorMock.mockClear();
    mapMock.geoObjects.add.mockClear();
    mapMock.geoObjects.remove.mockClear();
    mapMock.behaviors.disable.mockClear();
    mapMock.options.set.mockClear();
    mapMock.container.fitToViewport.mockClear();
    mapMock.setCenter.mockClear();
    mapMock.destroy.mockClear();
  });

  it('loads Yandex map and renders section title', async () => {
    renderMap();

    expect(screen.getByText(/Карта объектов Санкт-Петербурга/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(loadYandexMapsMock).toHaveBeenCalledWith(
        'test-key',
        expect.objectContaining({ fetchPriority: 'high' }),
      );
      expect(mapCtorMock).toHaveBeenCalled();
      expect(placemarkCtorMock).toHaveBeenCalled();
    });

    expect(screen.queryByText(/VITE_YMAPS_API_KEY/i)).not.toBeInTheDocument();
  });

  it('keeps manual filter active after placemark click', async () => {
    renderMap();

    await waitFor(() => expect(placemarkCtorMock).toHaveBeenCalled());

    expect(screen.queryByRole('button', { name: /^B40\s*\(/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Фильтры/i }));
    fireEvent.click(screen.getByRole('button', { name: /^B40\s*\(/i }));

    let manualB40Button = screen.getByRole('button', { name: /^B40\s*\(/i });
    let allModeButton = screen.getByRole('button', { name: /Все объекты/i });

    expect(manualB40Button.className).toContain('border-primary/30');
    expect(allModeButton.className).not.toContain('border-primary/30');

    triggerPlacemarkClickByHint(/Лахта Центр/i);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Лахта Центр/i })).toBeInTheDocument();
      expect(mapMock.setCenter).toHaveBeenCalled();
    });

    manualB40Button = screen.getByRole('button', { name: /^B40\s*\(/i });
    allModeButton = screen.getByRole('button', { name: /Все объекты/i });

    expect(manualB40Button.className).toContain('border-primary/30');
    expect(allModeButton.className).not.toContain('border-primary/30');
  });

  it('opens and closes object info card', async () => {
    renderMap();

    await waitFor(() => expect(placemarkCtorMock).toHaveBeenCalled());

    triggerPlacemarkClickByHint(/Балтийская жемчужина/i);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Балтийская жемчужина/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Закрыть карточку объекта/i }));

    expect(screen.queryByRole('heading', { name: /Балтийская жемчужина/i })).not.toBeInTheDocument();
  });
});
