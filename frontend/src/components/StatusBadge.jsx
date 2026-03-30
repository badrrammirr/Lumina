import React from 'react'

export default function StatusBadge({ ready }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500
      ${ready
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}
      style={ready ? { boxShadow: '0 0 15px rgba(16,185,129,0.15)' } : {}}>
      <span className={`w-2 h-2 rounded-full ${ready ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
      {ready ? 'DB Ready' : 'No Database'}
    </div>
  )
}