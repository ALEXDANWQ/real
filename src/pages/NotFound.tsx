import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404: маршрут не найден', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background concrete-texture px-4">
      <div className="glass-card w-full max-w-md rounded-3xl border border-border/75 p-8 text-center shadow-[0_24px_45px_-30px_rgb(15_23_42/0.4)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Ошибка маршрута</p>
        <h1 className="mt-3 text-5xl font-bold">404</h1>
        <p className="mt-4 text-muted-foreground">Страница не найдена или была перемещена.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center rounded-full border border-primary/25 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-px hover:bg-primary/95"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

