import { useEffect, useRef, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import {
  IconCar,
  IconClasses,
  IconComparator,
  IconMapSection,
  IconSelector,
} from '@/components/icons/custom-icons';
import { GradeLogo } from '@/components/icons/grade-logo';

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

type ThemeMode = 'light' | 'dark';
type NavigationId = (typeof navItems)[number]['id'];
type NavigationTargetDetail = {
  sectionId: string;
  until: number;
};

const THEME_STORAGE_KEY = 'grade-theme';

const navItems = [
  { id: 'classes', icon: IconClasses, label: 'Классы' },
  { id: 'selector', icon: IconSelector, label: 'Подбор' },
  { id: 'comparator', icon: IconComparator, label: 'Производство' },
  { id: 'map', icon: IconCar, label: 'Доставка' },
  { id: 'location', icon: IconMapSection, label: 'Расположение' },
] as const;

const applyTheme = (mode: ThemeMode) => {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.style.colorScheme = mode;
};

const readStoredTheme = (): ThemeMode | null => {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return null;
  } catch {
    return null;
  }
};

export function Header({ activeSection, onSectionChange }: HeaderProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const pendingMobileNavigationRef = useRef<NavigationId | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const root = document.documentElement;
    const updateHeight = () => {
      root.style.setProperty('--header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(header);
    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = readStoredTheme();
    const initialTheme: ThemeMode = savedTheme ?? (mediaQuery.matches ? 'dark' : 'light');

    setThemeMode(initialTheme);
    applyTheme(initialTheme);

    const onPreferenceChange = (event: MediaQueryListEvent) => {
      if (readStoredTheme()) return;
      const nextTheme: ThemeMode = event.matches ? 'dark' : 'light';
      setThemeMode(nextTheme);
      applyTheme(nextTheme);
    };

    mediaQuery.addEventListener('change', onPreferenceChange);
    return () => {
      mediaQuery.removeEventListener('change', onPreferenceChange);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlTouchAction = html.style.touchAction;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyTouchAction = body.style.touchAction;

    html.style.overflow = 'hidden';
    html.style.touchAction = 'none';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.touchAction = 'none';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    return () => {
      html.style.overflow = previousHtmlOverflow;
      html.style.touchAction = previousHtmlTouchAction;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.touchAction = previousBodyTouchAction;

      const pendingSectionId = pendingMobileNavigationRef.current;
      pendingMobileNavigationRef.current = null;

      if (!pendingSectionId) {
        window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' });
      } else {
        const target = document.getElementById(pendingSectionId);
        if (!target) {
          window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' });
        } else {
          const headerHeightRaw = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
          const headerHeight = Number.parseInt(headerHeightRaw, 10) || 96;
          const targetTop =
            pendingSectionId === 'classes'
              ? 0
              : Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 20);

          const detail: NavigationTargetDetail = {
            sectionId: pendingSectionId,
            until: Date.now() + 1200,
          };

          onSectionChange(pendingSectionId);
          window.requestAnimationFrame(() => {
            window.dispatchEvent(new CustomEvent<NavigationTargetDetail>('grade:navigation-target', { detail }));
            window.scrollTo({ top: targetTop, behavior: 'smooth' });
          });
        }
      }

      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [isMobileMenuOpen, onSectionChange]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore localStorage failures (private mode / blocked storage).
      }
      return next;
    });
  };

  const scrollToSection = (id: NavigationId) => {
    const target = document.getElementById(id);
    if (!target) return;

    onSectionChange(id);
    const headerHeightRaw = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
    const headerHeight = Number.parseInt(headerHeightRaw, 10) || 96;
    const top =
      id === 'classes'
        ? 0
        : Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 20);

    const detail: NavigationTargetDetail = {
      sectionId: id,
      until: Date.now() + 1200,
    };

    window.dispatchEvent(new CustomEvent<NavigationTargetDetail>('grade:navigation-target', { detail }));
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const navigateFromMenu = (id: NavigationId) => {
    if (!isMobileMenuOpen) {
      scrollToSection(id);
      return;
    }

    pendingMobileNavigationRef.current = id;
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Закрыть мобильное меню"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-x-0 bottom-0 z-[84] bg-card/44 backdrop-blur-[1px] lg:hidden"
          style={{ top: 'calc(var(--header-height) + 0.75rem)' }}
        />
      )}

      <header className="fixed inset-x-0 top-1.5 z-[90] px-2 sm:px-3 md:px-5 lg:px-8 2xl:px-12" ref={headerRef}>
        <div className="glass-overlay mx-auto max-w-[1880px] rounded-2xl border border-border/75 shadow-[0_24px_42px_-34px_rgb(15_23_42/0.45)] sm:rounded-[28px]">
          <div className="px-2.5 sm:px-4 md:px-6">
            <div className="flex items-center justify-between gap-2 py-2.5 sm:gap-3 sm:py-3">
              <button
                onClick={() => navigateFromMenu('classes')}
                className="inline-flex items-center justify-center rounded-2xl px-1.5 py-1.5 sm:px-2"
              >
                <GradeLogo themeMode={themeMode} />
              </button>

              <nav className="hidden items-center gap-2 lg:flex">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`
                        inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium
                        transition-[background-color,border-color,color,box-shadow] duration-300
                        ${
                          isActive
                            ? 'border-primary/30 bg-primary text-primary-foreground shadow-[0_12px_26px_-18px_hsl(var(--primary)/0.75)]'
                            : 'border-border/75 bg-card/78 text-muted-foreground hover:border-primary/25 hover:bg-card/95 hover:text-foreground'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="action-chip hidden h-10 items-center gap-2 rounded-full border border-border/75 bg-card/78 px-3 text-xs font-semibold text-foreground md:text-sm lg:inline-flex"
                  aria-label={themeMode === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
                >
                  {themeMode === 'dark' ? (
                    <Sun className="h-4 w-4 text-primary" />
                  ) : (
                    <Moon className="h-4 w-4 text-primary" />
                  )}
                  <span className="hidden sm:inline">{themeMode === 'dark' ? 'Светлый режим' : 'Темный режим'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-site-menu"
                  className={`action-chip inline-flex h-10 w-10 items-center justify-center rounded-full border lg:hidden ${
                    isMobileMenuOpen
                      ? 'border-primary/35 bg-primary text-white shadow-[0_14px_24px_-18px_hsl(var(--primary)/0.65)]'
                      : 'border-border/75 bg-card/78 text-foreground'
                  }`}
                >
                  <span className="pointer-events-none relative inline-flex h-[18px] w-[18px] items-center justify-center">
                    <Menu
                      aria-hidden
                      className={`absolute h-[18px] w-[18px] transition-all duration-150 ease-out motion-reduce:transition-none ${
                        isMobileMenuOpen ? 'scale-75 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
                      }`}
                    />
                    <X
                      aria-hidden
                      className={`absolute h-[18px] w-[18px] transition-all duration-150 ease-out motion-reduce:transition-none ${
                        isMobileMenuOpen ? 'scale-100 rotate-0 opacity-100' : 'scale-75 rotate-90 opacity-0'
                      }`}
                    />
                  </span>
                  <span className="sr-only">{isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-x-0 z-[89] px-2 transition-opacity duration-150 ease-out motion-reduce:transition-none sm:px-3 md:px-5 lg:hidden ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ top: 'calc(var(--header-height) + 0.75rem)' }}
        aria-hidden={!isMobileMenuOpen}
      >
        <div
          id="mobile-site-menu"
          className="glass-overlay mx-auto max-h-[calc(100dvh-var(--header-height)-1.5rem-env(safe-area-inset-bottom,0px))] w-full max-w-[1880px] overflow-y-auto rounded-2xl border border-border/75 p-2.5 shadow-[0_24px_42px_-34px_rgb(15_23_42/0.45)]"
        >
          <div className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
            Навигация
          </div>
          <nav className="grid grid-cols-1 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigateFromMenu(item.id)}
                  className={`
                    inline-flex min-h-[46px] items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-sm font-semibold
                    transition-[background-color,border-color,color,box-shadow] duration-150 ease-out motion-reduce:transition-none
                    ${
                      isActive
                        ? 'border-primary/30 bg-primary text-primary-foreground shadow-[0_12px_22px_-18px_hsl(var(--primary)/0.75)]'
                        : 'border-border/75 bg-card/78 text-muted-foreground hover:border-primary/25 hover:bg-card/95 hover:text-foreground'
                    }
                  `}
                >
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                      isActive
                        ? 'border-primary-foreground/45 bg-primary-foreground/18'
                        : 'border-border/75 bg-card/80'
                    }`}
                    aria-hidden
                  >
                    <Icon className="h-[15px] w-[15px]" strokeWidth={1.65} />
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}

