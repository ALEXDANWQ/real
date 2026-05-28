declare global {
  interface Window {
    ymaps?: {
      ready: (cb: () => void) => void;
      Map: new (
        element: HTMLElement,
        options: {
          center: [number, number];
          zoom: number;
          controls?: string[];
        },
      ) => YMapInstance;
      Placemark: new (
        coordinates: [number, number],
        properties?: Record<string, unknown>,
        options?: Record<string, unknown>,
      ) => YPlacemarkInstance;
    };
  }
}

export interface YPlacemarkInstance {
  events: {
    add: (eventName: string, handler: () => void) => void;
  };
  options?: {
    set?: (keyOrOptions: string | Record<string, unknown>, value?: unknown) => void;
  };
}

export interface YMapCollection {
  add: (item: YPlacemarkInstance) => void;
  remove: (item: YPlacemarkInstance) => void;
}

export interface YMapInstance {
  geoObjects: YMapCollection;
  container?: {
    fitToViewport?: () => void;
  };
  behaviors?: {
    disable?: (name: string) => void;
    enable?: (name: string) => void;
  };
  options?: {
    set?: (key: string, value: unknown) => void;
  };
  setBounds?: (
    bounds: [[number, number], [number, number]],
    options?: Record<string, unknown>,
  ) => void;
  setCenter: (center: [number, number], zoom?: number, options?: Record<string, unknown>) => void;
  destroy: () => void;
}

interface YMapsNamespace {
  Map: Window['ymaps']['Map'];
  Placemark: Window['ymaps']['Placemark'];
  ready: Window['ymaps']['ready'];
}

export interface LoadYandexMapsOptions {
  fetchPriority?: 'high' | 'low' | 'auto';
}

let loaderPromise: Promise<YMapsNamespace> | null = null;

const SCRIPT_ID = 'yandex-maps-api-script';
const SCRIPT_LOAD_TIMEOUT_MS = 15000;

function getYMapsNamespace(): YMapsNamespace | null {
  if (!window.ymaps?.Map || !window.ymaps?.Placemark || !window.ymaps?.ready) {
    return null;
  }

  return {
    Map: window.ymaps.Map,
    Placemark: window.ymaps.Placemark,
    ready: window.ymaps.ready,
  };
}

function removeLoaderScript() {
  const script = document.getElementById(SCRIPT_ID);
  script?.parentElement?.removeChild(script);
}

export function loadYandexMaps(apiKey: string, options: LoadYandexMapsOptions = {}): Promise<YMapsNamespace> {
  const normalizedApiKey = apiKey.trim();
  if (!normalizedApiKey) {
    return Promise.reject(new Error('API key is empty'));
  }

  const scriptFetchPriority = options.fetchPriority ?? 'auto';

  const existingNamespace = getYMapsNamespace();
  if (existingNamespace) {
    return Promise.resolve(existingNamespace);
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise<YMapsNamespace>((resolve, reject) => {
    const encodedKey = encodeURIComponent(normalizedApiKey);
    const source = `https://api-maps.yandex.ru/2.1/?apikey=${encodedKey}&lang=ru_RU`;
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (script && !script.src.includes(`apikey=${encodedKey}`)) {
      removeLoaderScript();
      script = null;
    }

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = source;
      script.dataset.status = 'loading';
      document.head.appendChild(script);
    }
    script.setAttribute('fetchpriority', scriptFetchPriority);

    let settled = false;
    let timeoutId: number | null = null;

    const cleanup = () => {
      if (!script) return;
      script.removeEventListener('load', onScriptLoad);
      script.removeEventListener('error', onScriptError);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };

    const rejectWith = (message: string, removeScript = false) => {
      if (settled) return;
      settled = true;
      cleanup();
      loaderPromise = null;
      if (script) {
        script.dataset.status = 'failed';
      }
      if (removeScript) {
        removeLoaderScript();
      }
      reject(new Error(message));
    };

    const resolveWith = (namespace: YMapsNamespace) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (script) {
        script.dataset.status = 'ready';
      }
      resolve(namespace);
    };

    const onReady = () => {
      const namespace = getYMapsNamespace();
      if (!namespace) {
        rejectWith(
          'Yandex Maps API script loaded, but ymaps did not initialize. Check API key, domain restrictions, and browser extensions.',
          true,
        );
        return;
      }

      namespace.ready(() => {
        const readyNamespace = getYMapsNamespace();
        if (!readyNamespace) {
          rejectWith('Yandex Maps API did not become ready after initialization.', true);
          return;
        }
        resolveWith(readyNamespace);
      });
    };

    const onScriptLoad = () => {
      onReady();
    };

    const onScriptError = () => {
      rejectWith('Failed to load Yandex Maps API script.', true);
    };

    script.addEventListener('load', onScriptLoad, { once: true });
    script.addEventListener('error', onScriptError, { once: true });

    timeoutId = window.setTimeout(() => {
      rejectWith('Timed out while loading Yandex Maps API script.', true);
    }, SCRIPT_LOAD_TIMEOUT_MS);

    if (getYMapsNamespace()) {
      onReady();
      return;
    }

    const readyState = script.readyState;
    if (readyState === 'loaded' || readyState === 'complete') {
      onScriptLoad();
    }
  });

  return loaderPromise;
}

export function resetYandexLoaderForTests() {
  loaderPromise = null;
}
