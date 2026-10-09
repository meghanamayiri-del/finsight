import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import Card, { CardHeader } from '../common/Card.jsx'
import {  categoryColors } from '../../data/mockData.js'
import { inr } from '../../utils/format.js'

export default function CategoryChart({ data = [] }) {
  const total = data.reduce((s, c) => s + c.value, 0)
  return (
    <Card className="p-5">
      <CardHeader title="Spending by Category" subtitle="This month" />
      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={56} outerRadius={80} paddingAngle={2} stroke="none">
              {data.map((c) => (
                <Cell key={`pie-${c.name}`} fill={categoryColors[c.name]} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [inr(v), n]} contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center"><p className="text-[11px] text-slate-500">Total</p><p className="text-base font-semibold text-slate-900">{inr(total)}</p></div>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {data.map((c, index) => (
          <li key={`${c.name}-${index}`} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: categoryColors[c.name] }} />
            <span className="flex-1 truncate text-slate-600">{c.name}</span>
            <span className="font-medium text-slate-900">{inr(c.value)}</span>
            <span className="w-10 text-right text-slate-400">{((c.value / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function CategoryBars({ data = [] }) {
const top = [...data].sort((a, b) => b.value - a.value).slice(0, 5)
  return (
    <Card className="p-5">
      <CardHeader title="Where Your Money Goes" subtitle="Top 5 categories" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} />
            <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v) => [inr(v), 'Spent']} contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18} label={{ position: 'right', fontSize: 11, fill: '#64748b', formatter: inr }}>
              {top.map((c) => (
                <Cell key={`bar-${c.name}`} fill={categoryColors[c.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
