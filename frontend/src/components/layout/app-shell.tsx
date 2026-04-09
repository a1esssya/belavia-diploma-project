import { PropsWithChildren, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '@/app/auth-context';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { routes } from '@/lib/routes';

type AppShellProps = PropsWithChildren<{
  compact?: boolean;
  headerSlot?: ReactNode;
}>;

const navItems = [
  { to: routes.trips, label: 'Мои поездки', protectedOnly: true },
];

export function AppShell({ children, compact = false, headerSlot }: AppShellProps) {
  const { status, user, signOut } = useAuth();
  const isAuthenticated = status === 'authenticated';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(73,85,159,0.16),_transparent_28%),linear-gradient(180deg,_#f5f7fc_0%,_#edf2f8_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/70 bg-white/85 px-5 py-4 shadow-card shadow-slate-900/5 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white shadow-lg shadow-brand/20">
                B
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-brand">Belavia</div>
                <div className="text-sm text-slate-500">Личный кабинет пассажира</div>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              {navItems
                .filter((item) => (item.protectedOnly ? isAuthenticated : true))
                .map((item) => (
                  <NavLink
                    className={({ isActive }) =>
                      [
                        'rounded-full px-4 py-2 text-sm font-semibold transition',
                        isActive
                          ? 'bg-brand text-white shadow-md shadow-brand/20'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                      ].join(' ')
                    }
                    key={item.to}
                    to={item.to}
                  >
                    {item.label}
                  </NavLink>
                ))}
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              {headerSlot}
              {isAuthenticated && user ? (
                <>
                  <div className="rounded-full bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
                    {user.email}
                  </div>
                  <SecondaryButton onClick={() => void signOut()} type="button">
                    Выйти
                  </SecondaryButton>
                </>
              ) : null}
            </div>
          </div>
        </header>

        <main
          className={[
            'flex-1',
            compact ? 'mx-auto flex w-full max-w-6xl flex-col justify-center py-8' : 'py-8',
          ].join(' ')}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
