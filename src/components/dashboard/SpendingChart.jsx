import { useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts'
import Card, { CardHeader } from '../common/Card.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { inr } from '../../utils/format.js'

const axis = { fontSize: 12, fill: '#94a3b8' }
const k = (v) => `₹${v / 1000}k`
const tip = { contentStyle: { borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,.08)', fontSize: 12 } }

export default function SpendingChart() {
  const { monthlySpending } = useApp()
  const [range, setRange] = useState('6M')
  const data = range === '6M' ? monthlySpending.slice(-6) : monthlySpending
  return (
    <Card className="p-5">
      <CardHeader title="Monthly Spending" subtitle="Total expenses per month"
        action={
          <select value={range} onChange={(e) => setRange(e.target.value)} className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600">
            <option value="6M">6 Months</option><option value="1Y">1 Year</option>
          </select>} />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
            <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={k} domain={['dataMin - 3000', 'dataMax + 2000']} />
            <Tooltip {...tip} formatter={(v) => [inr(v), 'Spent']} />
            <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} fill="url(#spendFill)" activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function IncomeExpenseChart() {
  const { incomeVsExpenses } = useApp()
  return (
    <Card className="p-5">
      <CardHeader title="Income vs Expenses" subtitle="Last 6 months" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={incomeVsExpenses} margin={{ left: -8, right: 8 }} barGap={4}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
            <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={k} />
            <Tooltip {...tip} formatter={(v, n) => [inr(v), n]} cursor={{ fill: '#f8fafc' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="income" name="Income" fill="#14b8a6" radius={[6, 6, 0, 0]} maxBarSize={22} />
            <Bar dataKey="expense" name="Expenses" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
