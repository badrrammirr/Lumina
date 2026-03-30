import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="glass px-4 py-3 text-sm border-glow" style={{ boxShadow: '0 0 20px rgba(99,102,241,0.15)' }}>
        <p className="text-gray-100 font-medium">{payload[0].payload.label}</p>
        <p className="text-primary-400 font-semibold">{payload[0].value}% accuracy</p>
      </div>
    )
  }
  return null
}

export default function PerformanceChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.1)' }} />
        <Bar dataKey="accuracy" radius={[8, 8, 0, 0]} barSize={40}>
          {data.map((entry, i) => (
            <Cell key={i}
              fill={entry.accuracy >= 60 ? '#6366f1' : '#ef4444'}
              style={entry.accuracy >= 60
                ? { filter: `drop-shadow(0 0 8px rgba(99,102,241,0.4))` }
                : { filter: `drop-shadow(0 0 8px rgba(239,68,68,0.3))` }
              } />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}