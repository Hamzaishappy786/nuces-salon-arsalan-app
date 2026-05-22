export default function StatCard({ emoji, label, value, sub, accent = false, wide = false }) {
  return (
    <div
      className={`
        rounded-2xl p-4 flex flex-col gap-1
        ${wide ? 'col-span-2' : ''}
        ${accent
          ? 'bg-gold-500/10 border border-gold-500/30'
          : 'bg-navy-800 border border-white/5'}
      `}
    >
      <span className="text-xl">{emoji}</span>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${accent ? 'text-gold-400' : 'text-slate-100'}`}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-slate-500">{sub}</p>
      )}
    </div>
  )
}
