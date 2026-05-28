import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Clock3, Info, Mail, MapPin, Phone } from 'lucide-react';
import { loadYandexMaps, type YMapInstance, type YPlacemarkInstance } from '@/lib/yandexMapsLoader';

const FACTORY_LOCATION = {
  title: 'Бетонный завод',
  address: '182110, Псковская область, Великие Луки, проспект Октябрьский, на выезде из города',
  phone: '+7 (911) 35-222-65',
  manager: 'Начальник БСУ Худяков Алексей Сергеевич',
  managerPhone: '+7 911 352-22-65',
  email: 'real-beton2017@mail.ru',
  workHours: 'с 8:00 до 17:00',
  latitude: 56.299208037836,
  longitude: 30.515013629728,
};

const INITIAL_ZOOM = 17;
const MINIMAL_MARKER_WIDTH = 30;
const MINIMAL_MARKER_HEIGHT = 40;
const MINIMAL_MARKER_ICON = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 1.75C8.11 1.75 2.5 7.27 2.5 14.05c0 9.15 10.11 19.74 11.94 21.56.3.3.82.3 1.12 0 1.83-1.82 11.94-12.41 11.94-21.56C27.5 7.27 21.89 1.75 15 1.75Z" fill="#1D4ED8" stroke="#F8FBFF" stroke-width="2"/>
    <circle cx="15" cy="13.8" r="4.8" fill="#F8FBFF"/>
    <ellipse cx="15" cy="36.8" rx="6.4" ry="2.2" fill="#1D4ED8" fill-opacity="0.22"/>
  </svg>
`)}`;

type MapStatus = 'loading' | 'ready' | 'error' | 'no-key';

type ContactItemProps = {
  icon: typeof MapPin;
  children: ReactNode;
};

function ContactItem({ icon: Icon, children }: ContactItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-[0_10px_22px_-16px_hsl(var(--primary)/0.62)]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="text-[15px] leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

export function FactoryLocationMap() {
  const [status, setStatus] = useState<MapStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YMapInstance | null>(null);
  const markerRef = useRef<YPlacemarkInstance | null>(null);
  const resolvedApiKey = (import.meta.env.VITE_YMAPS_API_KEY ?? '').trim();

  const staticMapParams = new URLSearchParams({
    lang: 'ru_RU',
    ll: `${FACTORY_LOCATION.longitude},${FACTORY_LOCATION.latitude}`,
    z: String(INITIAL_ZOOM),
    size: '1600,900',
    pt: `${FACTORY_LOCATION.longitude},${FACTORY_LOCATION.latitude},pm2blm`,
    maptype: 'map',
  });
  if (resolvedApiKey) {
    staticMapParams.set('apikey', resolvedApiKey);
  }
  const staticMapSrc = `https://static-maps.yandex.ru/v1?${staticMapParams.toString()}`;

  useEffect(() => {
    if (!resolvedApiKey) {
      setStatus('no-key');
      setErrorMessage(null);
      return;
    }

    let canceled = false;
    setStatus('loading');
    setErrorMessage(null);

    const bootMap = async () => {
      try {
        const ymaps = await loadYandexMaps(resolvedApiKey, { fetchPriority: 'high' });
        if (canceled || !mapContainerRef.current) return;

        const map = new ymaps.Map(mapContainerRef.current, {
          center: [FACTORY_LOCATION.latitude, FACTORY_LOCATION.longitude],
          zoom: INITIAL_ZOOM,
          controls: [],
        });

        map.options?.set?.('suppressMapOpenBlock', true);
        map.options?.set?.('yandexMapDisablePoiInteractivity', true);
        map.options?.set?.('avoidFractionalZoom', true);
        map.options?.set?.('checkZoomRange', true);

        [
          'drag',
          'scrollZoom',
          'dblClickZoom',
          'multiTouch',
          'rightMouseButtonMagnifier',
          'ruler',
          'routeEditor',
        ].forEach((behavior) => map.behaviors?.disable?.(behavior));

        const marker = new ymaps.Placemark(
          [FACTORY_LOCATION.latitude, FACTORY_LOCATION.longitude],
          {},
          {
            iconLayout: 'default#image',
            iconImageHref: MINIMAL_MARKER_ICON,
            iconImageSize: [MINIMAL_MARKER_WIDTH, MINIMAL_MARKER_HEIGHT],
            iconImageOffset: [-Math.round(MINIMAL_MARKER_WIDTH / 2), -MINIMAL_MARKER_HEIGHT],
            zIndex: 2400,
          },
        );

        map.geoObjects.add(marker);
        map.setCenter([FACTORY_LOCATION.latitude, FACTORY_LOCATION.longitude], INITIAL_ZOOM, {
          duration: 0,
          checkZoomRange: true,
        });

        mapRef.current = map;
        markerRef.current = marker;
        setStatus('ready');
      } catch (error: unknown) {
        if (canceled) return;
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить карту.');
      }
    };

    type IdleWindow = Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const idleWindow = window as IdleWindow;
    let disposeScheduledBoot: (() => void) | null = null;

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(() => {
        void bootMap();
      }, { timeout: 1200 });
      disposeScheduledBoot = () => idleWindow.cancelIdleCallback?.(idleId);
    } else {
      const timerId = window.setTimeout(() => {
        void bootMap();
      }, 180);
      disposeScheduledBoot = () => window.clearTimeout(timerId);
    }

    return () => {
      canceled = true;
      disposeScheduledBoot?.();
      if (mapRef.current && markerRef.current) {
        mapRef.current.geoObjects.remove(markerRef.current);
      }
      mapRef.current?.destroy();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [resolvedApiKey]);

  return (
    <div className="surface-panel relative overflow-hidden rounded-[1.75rem] border-border/75">
      <div className="relative h-[clamp(380px,63vh,680px)]">
        <div ref={mapContainerRef} className="pointer-events-none h-full w-full ymap-minimal" />

        {status !== 'ready' && (
          <img
            src={staticMapSrc}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        )}

        {status !== 'ready' && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-card/60">
            <div className="glass-overlay rounded-2xl border border-border/75 px-5 py-4 text-center shadow-[0_16px_30px_-22px_hsl(var(--primary)/0.32)]">
              {status === 'loading' && <p className="text-sm font-medium text-foreground">Загрузка карты...</p>}
              {status === 'no-key' && <p className="text-sm font-medium text-foreground">Карта недоступна: не задан API-ключ.</p>}
              {status === 'error' && (
                <p className="max-w-[340px] text-sm font-medium text-foreground">
                  Карта временно недоступна.{errorMessage ? ` ${errorMessage}` : ''}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-3 sm:inset-5 md:inset-6">
          <div className="glass-overlay pointer-events-auto h-full w-full max-w-[472px] rounded-[1.7rem] border border-border/80 bg-card/95 p-5 shadow-[0_22px_44px_-32px_hsl(var(--primary)/0.32)] sm:p-7 dark:bg-card/90">
            <h3 className="text-[clamp(1.75rem,4.1vw,2.55rem)] font-bold leading-tight text-primary">
              {FACTORY_LOCATION.title}
            </h3>

            <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
              <ContactItem icon={MapPin}>{FACTORY_LOCATION.address}</ContactItem>
              <ContactItem icon={Phone}>
                <a href={`tel:+${FACTORY_LOCATION.phone.replace(/\D+/g, '')}`} className="transition-colors hover:text-primary">
                  {FACTORY_LOCATION.phone}
                </a>
              </ContactItem>
              <ContactItem icon={Mail}>
                <a href={`mailto:${FACTORY_LOCATION.email}`} className="break-all transition-colors hover:text-primary">
                  {FACTORY_LOCATION.email}
                </a>
              </ContactItem>
              <ContactItem icon={Clock3}>{FACTORY_LOCATION.workHours}</ContactItem>
              <ContactItem icon={Info}>
                <p>{FACTORY_LOCATION.manager}</p>
                <a href={`tel:+${FACTORY_LOCATION.managerPhone.replace(/\D+/g, '')}`} className="mt-1 inline-block transition-colors hover:text-primary">
                  {FACTORY_LOCATION.managerPhone}
                </a>
              </ContactItem>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
