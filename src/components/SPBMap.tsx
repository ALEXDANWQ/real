import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Filter, KeyRound, RefreshCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTypeIconName, getTypeLabel, spbBuildings, type Building } from '@/data/spbBuildings';
import { getIconByName } from '@/lib/iconMap';
import { loadYandexMaps, type YMapInstance, type YPlacemarkInstance } from '@/lib/yandexMapsLoader';
import { resolveYandexMapsApiKey } from '@/lib/yandexMapsApiKey';

type MapStatus = 'loading' | 'ready' | 'error' | 'no-key';

const typeColorMap: Record<Building['type'], string> = {
  bridge: '#1d4ed8',
  building: '#2563eb',
  infrastructure: '#1e3a8a',
  monument: '#3b82f6',
};

const mapCenter: [number, number] = [59.93, 30.32];
const MAP_FIT_ANIMATION_MS = 420;
const MAP_CENTER_ANIMATION_MS = 440;
const FILTERS_ANIMATION_CLASS =
  'grid overflow-hidden transition-[grid-template-rows,opacity] [transition-duration:420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';
const FILTERS_CONTENT_ANIMATION_CLASS =
  'transform-gpu transition-[opacity,transform] [transition-duration:320ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] motion-reduce:transition-none';

interface SPBMapProps {
  apiKey?: string;
}

const toDataUri = (svg: string) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
const markerSvgCache = new Map<string, string>();

const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getMarkerGlyph = (type: Building['type']) => {
  switch (type) {
    case 'building':
      return `
        <path d="M5 21V6.5L12 4l7 2.5V21" />
        <path d="M9 10v.01M12 10v.01M15 10v.01M9 14v.01M12 14v.01M15 14v.01" />
        <path d="M12 21v-3.5" />
      `;
    case 'bridge':
      return `
        <path d="M6 18V9.2M18 18V9.2" />
        <path d="M6 12h12" />
        <path d="M6 9.2c1.8-1.8 3.8-2.7 6-2.7s4.2.9 6 2.7" />
        <path d="M4.3 12h1.2M18.5 12h1.2" />
      `;
    case 'infrastructure':
      return `
        <rect x="5" y="5" width="14" height="11" rx="2.2" />
        <path d="M8.5 9h2.7M12.8 9h2.7" />
        <path d="M7 16.2 5.7 19M17 16.2 18.3 19" />
        <circle cx="9" cy="13.2" r="1" />
        <circle cx="15" cy="13.2" r="1" />
      `;
    case 'monument':
      return `
        <path d="m12 4-8 3.5h16L12 4Z" />
        <path d="M6.5 7.5v8M10 7.5v8M14 7.5v8M17.5 7.5v8" />
        <path d="M4.5 15.5h15" />
        <path d="M4 20h16" />
      `;
  }
};

const getMarkerSvg = (type: Building['type'], isActive: boolean) => {
  const cacheKey = `${type}:${isActive ? 'active' : 'base'}`;
  const cached = markerSvgCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const accent = typeColorMap[type];
  const outerFill = '#f3f8ff';
  const outerStroke = '#dbeafe';
  const centerFill = accent;
  const centerStroke = 'rgba(244,248,255,0.94)';
  const glyphStroke = '#f8fbff';
  const glyph = getMarkerGlyph(type);

  const icon = toDataUri(`
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="22" fill="${outerFill}" stroke="${outerStroke}" stroke-width="${isActive ? 0.12 : 0.08}" />
      <circle cx="28" cy="28" r="21.2" fill="${centerFill}" stroke="${centerStroke}" stroke-width="0.08" />
      <g transform="translate(19.6 19.6) scale(0.67)" fill="none" stroke="${glyphStroke}" stroke-width="1.18" stroke-linecap="round" stroke-linejoin="round">
        ${glyph}
      </g>
    </svg>
  `);

  markerSvgCache.set(cacheKey, icon);
  return icon;
};

const getMarkerOptions = (building: Building, isActive: boolean) => {
  const markerSize = isActive ? 56 : 50;

  return {
    iconLayout: 'default#image',
    iconImageHref: getMarkerSvg(building.type, isActive),
    iconImageSize: [markerSize, markerSize],
    iconImageOffset: [-Math.round(markerSize / 2), -Math.round(markerSize / 2)],
    zIndex: isActive ? 2200 : 1300,
    iconShape: {
      type: 'Circle',
      coordinates: [0, 0],
      radius: Math.round(markerSize * 0.42),
    },
  };
};

const formatCoordinates = (coordinates: [number, number]) =>
  `${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}`;

const getBuildingsBounds = (
  buildings: Building[],
): [[number, number], [number, number]] | null => {
  if (!buildings.length) return null;

  let minLat = buildings[0].coordinates[0];
  let maxLat = buildings[0].coordinates[0];
  let minLon = buildings[0].coordinates[1];
  let maxLon = buildings[0].coordinates[1];

  for (const building of buildings) {
    const [lat, lon] = building.coordinates;
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
  }

  if (Math.abs(maxLat - minLat) < 0.0001) {
    minLat -= 0.01;
    maxLat += 0.01;
  }
  if (Math.abs(maxLon - minLon) < 0.0001) {
    minLon -= 0.01;
    maxLon += 0.01;
  }

  return [
    [minLat, minLon],
    [maxLat, maxLon],
  ];
};

export function SPBMap({ apiKey }: SPBMapProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [status, setStatus] = useState<MapStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [filterMode, setFilterMode] = useState<'all' | 'manual'>('all');
  const [manualClassFilter, setManualClassFilter] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YMapInstance | null>(null);
  const placemarksRef = useRef<Map<string, YPlacemarkInstance>>(new Map());
  const visiblePlacemarkIdsRef = useRef<Set<string>>(new Set());
  const selectedPlacemarkIdRef = useRef<string | null>(null);
  const ymapsLoadedRef = useRef<Awaited<ReturnType<typeof loadYandexMaps>> | null>(null);

  const resolvedApiKey = (apiKey ?? resolveYandexMapsApiKey()).trim();

  const classCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const building of spbBuildings) {
      counts.set(building.concreteClass, (counts.get(building.concreteClass) ?? 0) + 1);
    }
    return counts;
  }, []);

  const activeClassFilter = useMemo(() => {
    if (filterMode === 'manual') return manualClassFilter;
    return null;
  }, [filterMode, manualClassFilter]);

  const filteredBuildings = useMemo(
    () => (activeClassFilter ? spbBuildings.filter((building) => building.concreteClass === activeClassFilter) : spbBuildings),
    [activeClassFilter],
  );

  const availableClasses = useMemo(() => [...classCounts.keys()].sort(), [classCounts]);
  const buildingsById = useMemo(() => new Map(spbBuildings.map((building) => [building.id, building])), []);
  const SelectedBuildingIcon = selectedBuilding ? getIconByName(getTypeIconName(selectedBuilding.type)) : null;
  const selectedTypeColor = selectedBuilding ? typeColorMap[selectedBuilding.type] : null;

  const applyPlacemarkState = useCallback((placemark: YPlacemarkInstance, building: Building, isActive: boolean) => {
    if (!placemark.options?.set) return;
    const markerOptions = getMarkerOptions(building, isActive);
    for (const [key, value] of Object.entries(markerOptions)) {
      placemark.options.set(key, value);
    }
  }, []);

  const legendItems = useMemo(
    () => [
      { type: 'building' as const, label: 'Здания' },
      { type: 'bridge' as const, label: 'Мосты' },
      { type: 'infrastructure' as const, label: 'Инфраструктура' },
      { type: 'monument' as const, label: 'Спецобъекты' },
    ],
    [],
  );

  const applyMapTheme = useCallback((map: YMapInstance | null, darkTheme: boolean) => {
    if (!map?.options?.set) return;
    // Theme option is applied when supported by the Yandex Maps runtime.
    map.options.set('theme', darkTheme ? 'dark' : 'light');
  }, []);

  const syncVisiblePlacemarks = useCallback((nextBuildings: Building[]) => {
    const map = mapRef.current;
    if (!map) return;

    const nextVisibleIds = new Set(nextBuildings.map((building) => building.id));
    const currentVisibleIds = visiblePlacemarkIdsRef.current;

    for (const id of Array.from(currentVisibleIds)) {
      if (nextVisibleIds.has(id)) continue;
      const placemark = placemarksRef.current.get(id);
      if (placemark) {
        map.geoObjects.remove(placemark);
      }
      currentVisibleIds.delete(id);
    }

    for (const building of nextBuildings) {
      if (currentVisibleIds.has(building.id)) continue;
      const placemark = placemarksRef.current.get(building.id);
      if (!placemark) continue;
      map.geoObjects.add(placemark);
      currentVisibleIds.add(building.id);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setIsDarkTheme(root.classList.contains('dark'));
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const fitMapToBuildings = useCallback((buildings: Building[], duration = MAP_FIT_ANIMATION_MS) => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = getBuildingsBounds(buildings);
    if (!bounds) {
      map.setCenter(mapCenter, 11, { duration, checkZoomRange: true });
      return;
    }

    if (typeof map.setBounds === 'function') {
      map.setBounds(bounds, {
        duration,
        checkZoomRange: true,
        zoomMargin: [42, 42, 42, 42],
      });
      return;
    }

    map.setCenter(mapCenter, 11, { duration, checkZoomRange: true });
  }, []);

  useEffect(() => {
    if (!resolvedApiKey) {
      setErrorMessage(null);
      setStatus('no-key');
      return;
    }

    let canceled = false;
    setErrorMessage(null);
    setStatus('loading');

    loadYandexMaps(resolvedApiKey, { fetchPriority: 'high' })
      .then((ymaps) => {
        if (canceled) return;
        ymapsLoadedRef.current = ymaps;
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (canceled) return;
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error while loading Yandex Maps');
        setStatus('error');
      });

    return () => {
      canceled = true;
    };
  }, [reloadNonce, resolvedApiKey]);

  useEffect(() => {
    if (status !== 'error' || !resolvedApiKey) return;
    const retryTimer = window.setTimeout(() => {
      setReloadNonce((prev) => prev + 1);
    }, 2200);
    return () => window.clearTimeout(retryTimer);
  }, [resolvedApiKey, status]);

  useEffect(() => {
    if (status !== 'ready' || !containerRef.current || !ymapsLoadedRef.current) return;
    if (mapRef.current) return;

    const ymaps = ymapsLoadedRef.current;
    const isMobileControls = window.matchMedia('(max-width: 1023px), (pointer: coarse)').matches;
    const map = new ymaps.Map(containerRef.current, {
      center: mapCenter,
      zoom: 11,
      controls: isMobileControls ? [] : ['zoomControl'],
    });
    mapRef.current = map;
    if (isMobileControls) {
      map.behaviors?.disable?.('scrollZoom');
    } else {
      map.behaviors?.enable?.('scrollZoom');
    }
    map.behaviors?.enable?.('multiTouch');
    map.behaviors?.enable?.('dblClickZoom');
    map.options?.set?.('suppressMapOpenBlock', true);
    map.options?.set?.('yandexMapDisablePoiInteractivity', true);
    map.options?.set?.('avoidFractionalZoom', true);
    map.options?.set?.('checkZoomRange', true);
    applyMapTheme(map, isDarkTheme);

    const allPlacemarks = new Map<string, YPlacemarkInstance>();
    spbBuildings.forEach((building) => {
      const placemark = new ymaps.Placemark(
        building.coordinates,
        {
          hintContent: `${building.name} - ${building.concreteClass}`,
        },
        getMarkerOptions(building, false),
      );

      placemark.events.add('click', () => {
        setSelectedBuilding(building);
      });

      allPlacemarks.set(building.id, placemark);
    });

    placemarksRef.current = allPlacemarks;
    visiblePlacemarkIdsRef.current = new Set();
    syncVisiblePlacemarks(filteredBuildings);

    const mapWithEvents = map as YMapInstance & {
      events?: {
        add?: (eventName: string, handler: () => void) => void;
        remove?: (eventName: string, handler: () => void) => void;
      };
    };

    const fitToViewport = () => {
      map.container?.fitToViewport?.();
    };

    fitToViewport();
    const rafId =
      typeof window.requestAnimationFrame === 'function' ? window.requestAnimationFrame(fitToViewport) : null;
    const timeoutId = window.setTimeout(fitToViewport, 180);
    mapWithEvents.events?.add?.('sizechange', fitToViewport);
    window.addEventListener('resize', fitToViewport);

    return () => {
      if (rafId !== null && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(rafId);
      }
      window.clearTimeout(timeoutId);
      mapWithEvents.events?.remove?.('sizechange', fitToViewport);
      window.removeEventListener('resize', fitToViewport);
      placemarksRef.current = new Map();
      visiblePlacemarkIdsRef.current = new Set();
      selectedPlacemarkIdRef.current = null;
      map.destroy();
      mapRef.current = null;
    };
  }, [applyMapTheme, filteredBuildings, isDarkTheme, status, syncVisiblePlacemarks]);

  useEffect(() => {
    if (status !== 'ready') return;
    applyMapTheme(mapRef.current, isDarkTheme);
  }, [applyMapTheme, isDarkTheme, status]);

  useEffect(() => {
    if (!selectedBuilding) return;
    if (filteredBuildings.some((building) => building.id === selectedBuilding.id)) return;
    setSelectedBuilding(null);
  }, [filteredBuildings, selectedBuilding]);

  useEffect(() => {
    if (status !== 'ready') return;
    syncVisiblePlacemarks(filteredBuildings);
  }, [filteredBuildings, status, syncVisiblePlacemarks]);

  useEffect(() => {
    if (status !== 'ready' || selectedBuilding) return;
    fitMapToBuildings(filteredBuildings, MAP_FIT_ANIMATION_MS);
  }, [filteredBuildings, fitMapToBuildings, selectedBuilding, status]);

  useEffect(() => {
    if (status !== 'ready') return;

    const nextSelectedId = selectedBuilding?.id ?? null;
    const previousSelectedId = selectedPlacemarkIdRef.current;
    if (nextSelectedId === previousSelectedId) return;

    if (previousSelectedId) {
      const previousPlacemark = placemarksRef.current.get(previousSelectedId);
      const previousBuilding = buildingsById.get(previousSelectedId);
      if (previousPlacemark && previousBuilding) {
        applyPlacemarkState(previousPlacemark, previousBuilding, false);
      }
    }

    if (nextSelectedId) {
      const nextPlacemark = placemarksRef.current.get(nextSelectedId);
      const nextBuilding = buildingsById.get(nextSelectedId);
      if (nextPlacemark && nextBuilding) {
        applyPlacemarkState(nextPlacemark, nextBuilding, true);
        selectedPlacemarkIdRef.current = nextSelectedId;
        return;
      }
    }

    selectedPlacemarkIdRef.current = null;
  }, [applyPlacemarkState, buildingsById, selectedBuilding?.id, status]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!selectedBuilding) {
      fitMapToBuildings(filteredBuildings, MAP_FIT_ANIMATION_MS);
      return;
    }
    mapRef.current.setCenter(selectedBuilding.coordinates, 14, { duration: MAP_CENTER_ANIMATION_MS, checkZoomRange: true });
  }, [filteredBuildings, fitMapToBuildings, selectedBuilding]);

  return (
    <div className="surface-panel relative overflow-hidden animate-rise-in-soft">
      <div className="relative border-b border-border/70 bg-card/80 p-3 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div>
              <h3 className="text-base font-bold text-foreground sm:text-lg">Карта объектов Санкт-Петербурга</h3>
              <p className="text-xs text-muted-foreground sm:text-sm">{filteredBuildings.length} объектов на карте</p>
            </div>
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters((prev) => !prev)}
            className="min-h-[42px] w-full gap-2 rounded-xl sm:w-auto"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </Button>
        </div>

        <div
          className={`${FILTERS_ANIMATION_CLASS} ${
            showFilters
              ? 'pointer-events-auto grid-rows-[1fr] opacity-100'
              : 'pointer-events-none grid-rows-[0fr] opacity-0'
          }`}
          aria-hidden={!showFilters}
        >
          <div className="min-h-0 overflow-hidden">
            <div className={`flex flex-wrap gap-2 pb-0.5 pt-0.5 ${showFilters ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'} ${FILTERS_CONTENT_ANIMATION_CLASS}`}>
            <button
              type="button"
              onClick={() => {
                setFilterMode('all');
                setManualClassFilter(null);
                setSelectedBuilding(null);
              }}
              className={`
                action-chip rounded-xl px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm
                ${
                  filterMode === 'all'
                    ? 'border-primary/30 bg-card/94 text-foreground shadow-[0_12px_24px_-20px_hsl(var(--primary)/0.45)]'
                    : 'border-border/80 bg-card/74 text-muted-foreground'
                }
              `}
            >
              Все объекты ({spbBuildings.length})
            </button>
            {availableClasses.map((cls) => {
              const count = classCounts.get(cls) ?? 0;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => {
                    setFilterMode('manual');
                    setManualClassFilter(cls);
                    setSelectedBuilding(null);
                  }}
                  className={`
                    action-chip rounded-xl px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm
                    ${
                      filterMode === 'manual' && manualClassFilter === cls
                        ? 'border-primary/30 bg-card/94 text-foreground shadow-[0_12px_24px_-20px_hsl(var(--primary)/0.45)]'
                        : 'border-border/80 bg-card/74 text-muted-foreground'
                    }
                  `}
                >
                  {cls} ({count})
                </button>
              );
            })}
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-[clamp(300px,58vh,760px)] sm:h-[clamp(340px,58vh,760px)]">
        {status === 'ready' && (
          <div ref={containerRef} className={`ymap-minimal h-full w-full bg-secondary/20 ${isDarkTheme ? 'ymap-minimal--dark' : ''}`} />
        )}

        {status === 'loading' && (
          <div className="flex h-full items-center justify-center bg-secondary/30">
            <div className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <p className="text-sm text-muted-foreground">Загрузка Яндекс.Карт...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex h-full items-center justify-center bg-secondary/30 p-6">
            <div className="glass-card max-w-md rounded-2xl border border-danger/20 p-5 text-center">
              <h4 className="mb-2 text-lg font-semibold text-foreground">Не удалось загрузить карту</h4>
              <p className="text-sm text-muted-foreground">
                Проверьте подключение к сети и корректность API-ключа Яндекс.Карт.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Повторная попытка выполняется автоматически.</p>
              {errorMessage && (
                <p className="mt-2 rounded-lg border border-border/70 bg-card/70 p-2 text-left text-xs text-muted-foreground">
                  {errorMessage}
                </p>
              )}
              <Button
                onClick={() => {
                  setReloadNonce((prev) => prev + 1);
                }}
                variant="outline"
                className="mt-4 gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Повторить
              </Button>
            </div>
          </div>
        )}

        {status === 'no-key' && (
          <div className="flex h-full items-center justify-center bg-secondary/30 p-6">
            <div className="glass-card max-w-xl rounded-2xl border border-primary/25 p-5">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <KeyRound className="h-5 w-5" />
                <h4 className="text-lg font-semibold">Ключ Яндекс.Карт не задан</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Укажите <code>VITE_YMAPS_API_KEY</code> в окружении, чтобы включить карту.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg border border-border/70 bg-card/70 p-3 text-xs">
{`# .env.local
VITE_YMAPS_API_KEY=ваш_ключ_яндекс_карт`}
              </pre>
            </div>
          </div>
        )}

        {selectedBuilding && (
          <div className="pointer-events-none absolute inset-0 p-2 sm:p-3 md:p-4">
            <div className="glass-overlay pointer-events-auto ml-auto flex max-h-full w-full max-w-[360px] animate-fade-in-scale flex-col overflow-y-auto rounded-xl border border-border/75 shadow-[0_26px_54px_-34px_rgb(15_23_42/0.45)] sm:max-w-[430px] sm:rounded-3xl">
              <div className="p-3 sm:p-5">
                <div className="mb-3 flex items-start gap-2.5 sm:mb-4 sm:gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm sm:h-12 sm:w-12"
                    style={{
                      backgroundColor: selectedTypeColor ?? 'hsl(var(--card))',
                      borderColor: selectedTypeColor ? hexToRgba(selectedTypeColor, 0.48) : 'hsl(var(--border))',
                      color: '#ffffff',
                    }}
                  >
                    {SelectedBuildingIcon && <SelectedBuildingIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary sm:px-2.5 sm:py-1 sm:text-xs">
                        {selectedBuilding.concreteClass}
                      </span>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs"
                        style={{
                          borderColor: selectedTypeColor ? hexToRgba(selectedTypeColor, 0.34) : 'hsl(var(--border))',
                          backgroundColor: selectedTypeColor ? hexToRgba(selectedTypeColor, 0.14) : 'hsl(var(--card))',
                          color: selectedTypeColor ?? 'hsl(var(--foreground))',
                        }}
                      >
                        {getTypeLabel(selectedBuilding.type)}
                      </span>
                    </div>
                    <h4 className="text-[13px] font-bold leading-snug text-foreground sm:text-sm md:text-base">{selectedBuilding.name}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBuilding(null)}
                    className="rounded-lg border border-transparent p-1 text-muted-foreground transition-all duration-300 hover:border-border/70 hover:bg-card/85 hover:text-foreground sm:p-1.5"
                    aria-label="Закрыть карточку объекта"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{selectedBuilding.description}</p>

                <div className="mt-3 grid grid-cols-2 gap-1.5 sm:mt-4 sm:gap-2">
                  <div className="rounded-lg border border-border/80 bg-card/82 px-2.5 py-1.5 sm:px-3 sm:py-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Класс</div>
                    <div className="text-xs font-semibold text-foreground sm:text-sm">{selectedBuilding.concreteClass}</div>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-card/82 px-2.5 py-1.5 sm:px-3 sm:py-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Тип</div>
                    <div className="text-xs font-semibold text-foreground sm:text-sm">{getTypeLabel(selectedBuilding.type)}</div>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-card/82 px-2.5 py-1.5 sm:px-3 sm:py-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Координаты</div>
                    <div className="break-all text-[11px] font-semibold text-foreground sm:text-xs">
                      {formatCoordinates(selectedBuilding.coordinates)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-card/82 px-2.5 py-1.5 sm:px-3 sm:py-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Год</div>
                    <div className="text-xs font-semibold text-foreground sm:text-sm">{selectedBuilding.yearBuilt ?? 'н/д'}</div>
                  </div>
                </div>

                {selectedBuilding.source && (
                  <p className="mt-3 rounded-lg border border-border/80 bg-card/82 px-2.5 py-1.5 text-[11px] text-muted-foreground sm:mt-4 sm:px-3 sm:py-2 sm:text-xs">
                    Источник: {selectedBuilding.source}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border/70 bg-card/62 p-3 text-xs backdrop-blur-md sm:gap-4 sm:p-4 sm:text-sm">
        {legendItems.map((item) => {
          const Icon = getIconByName(getTypeIconName(item.type));
          return (
            <div key={item.type} className="flex items-center gap-2">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70"
                style={{
                  color: typeColorMap[item.type],
                  backgroundColor: hexToRgba(typeColorMap[item.type], 0.14),
                  borderColor: hexToRgba(typeColorMap[item.type], 0.3),
                }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="font-medium text-muted-foreground">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
