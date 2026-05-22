import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/today',    emoji: '📅', label: 'Today'    },
  { to: '/upcoming', emoji: '📆', label: 'Upcoming' },
  { to: '/earnings', emoji: '💰', label: 'Earnings' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: 'linear-gradient(to top, #0b1120 0%, #0f172a 100%)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        minHeight: '64px',
      }}
    >
      {tabs.map(({ to, emoji, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] relative
             transition-colors duration-150 select-none
             ${isActive ? 'text-gold-400' : 'text-slate-500'}`
          }
        >
          {({ isActive }) => (
            <>
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-gold-500"
                />
              )}
              <span className="text-xl leading-none">{emoji}</span>
              <span className={`text-xs font-semibold tracking-wide ${isActive ? 'text-gold-400' : 'text-slate-500'}`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
