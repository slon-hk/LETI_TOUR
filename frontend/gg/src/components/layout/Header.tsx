import { Link, useLocation } from 'react-router-dom'
import { useTourStore } from '@/store/tourStore'

export function Header() {
  const location = useLocation()
  const toggleTheme = useTourStore((s) => s.toggleTheme)
  const theme = useTourStore((s) => s.theme)

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="fixed top-0 left-0 w-full z-[1000] flex justify-between items-center
      px-4 sm:px-8 py-3
      bg-white/80 dark:bg-slate-900/80
      backdrop-blur-xl
      border-b border-gray-100/60 dark:border-slate-800/60
      transition-colors duration-300">

      <Link to="/" className="flex items-center gap-3 group">
        {/* Horizontal text logo */}
        <img
          src="/logo-leti-sin-rus-2017.svg"
          alt="ЛЭТИ"
          className="h-7 sm:h-9 logo-adaptive transition-opacity duration-200 group-hover:opacity-80"
        />
      </Link>

      <nav className="flex items-center gap-1 sm:gap-2">
        <NavLink to="/tour" active={isActive('/tour')}>Тур</NavLink>
        <NavLink to="/history" active={isActive('/history')}>История</NavLink>

        <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-1 sm:mx-2" />

        <button
          onClick={toggleTheme}
          aria-label="Переключить тему"
          className="w-9 h-9 flex items-center justify-center rounded-xl
            bg-gray-100 dark:bg-slate-800
            hover:bg-gray-200 dark:hover:bg-slate-700
            transition-all duration-200 hover:scale-105"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 15a5 5 0 100-10 5 5 0 000 10zm8-5a1 1 0 110 2h-1a1 1 0 110-2h1zM5 12a1 1 0 110-2H4a1 1 0 110 2h1zm13.66-6.34a1 1 0 010 1.41l-.71.71a1 1 0 11-1.41-1.41l.71-.71a1 1 0 011.41 0zM6.34 17.66a1 1 0 010 1.41l-.71.71a1 1 0 01-1.41-1.41l.71-.71a1 1 0 011.41 0zm12.02 0l-.71-.71a1 1 0 011.41-1.41l.71.71a1 1 0 01-1.41 1.41zM5.05 5.05a1 1 0 011.41 0l.71.71A1 1 0 115.76 7.17l-.71-.71a1 1 0 010-1.41zM12 20a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
            </svg>
          )}
        </button>
      </nav>
    </header>
  )
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`
        relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl
        transition-all duration-200
        ${active
          ? 'text-leti dark:text-white bg-blue-50 dark:bg-slate-800'
          : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'}
      `}
    >
      {children}
      {active && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-leti dark:bg-blue-400" />
      )}
    </Link>
  )
}
