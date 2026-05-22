import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/today', { replace: true }), 1000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-5"
      style={{ background: '#0f172a' }}
    >
      {/* Scissors icon — gold, animated scale pulse */}
      <div className="anim-scale-pulse">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6"  cy="6"  r="3" />
          <circle cx="6"  cy="18" r="3" />
          <line x1="20" y1="4"  x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12"  x2="12"  y2="12" />
        </svg>
      </div>

      {/* App name */}
      <div className="text-center" style={{ animation: 'fadeInUp 0.5s ease-out 0.15s both' }}>
        <p className="text-3xl font-bold text-gold-400 tracking-tight">NUCES Salon</p>
        <p className="text-sm text-slate-400 mt-1 font-medium">Arslan's Dashboard</p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
