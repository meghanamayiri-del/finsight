import { useState, useEffect  } from 'react'
import { TrendingUp, TrendingDown, Info, Lightbulb } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import PageHeader from '../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import { categoryForecast, categoryAverages, categoryColors } from '../data/mockData.js'
import { inr } from '../utils/format.js'
import { pctChange, fmtPct } from '../utils/analytics.js'


const axis = { fontSize: 12, fill: '#94a3b8' }

export default function Predictions() {
  const [forecast, setForecast] = useState(null)
  const [monthlySpending, setMonthlySpending] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')

  useEffect(() => {
  fetch('http://127.0.0.1:8000/ml/expense-forecast')
    .then((res) => res.json())
    .then((data) => setForecast(data))
    .catch((error) => console.error('Forecast failed:', error))
}, [])

useEffect(() => {
  fetch('http://127.0.0.1:8000/dashboard/monthly-spending')
    .then((res) => res.json())
    .then((data) => setMonthlySpending(data))
    .catch((error) =>
      console.error('Monthly spending fetch failed:', error)
    )
}, [])

const chart = [
  ...monthlySpending.slice(-6).map((item) => ({
    month: new Date(`${item.month}-02`).toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit',
    }),
    actual: item.amount,
    predicted: null,
  })),

  ...(forecast?.forecasts || []).map((item) => ({
    month: new Date(`${item.month}-02`).toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit',
    }),
    actual: null,
    predicted: item.prediction,
  })),
]

const forecasts = forecast?.forecasts || []


const activeForecast =
  forecasts.find((item) => item.month === selectedMonth) ||
  forecasts[0]

const categoryPredictions = activeForecast?.categories || {}

const formatMonth = (month) => {
  if (!month) return ''
  return new Date(`${month}-02`).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}
  const change = forecast
    ? pctChange(forecast.prediction, forecast.current)
    : 0
  const up = change >= 0
  const Arrow = up ? TrendingUp : TrendingDown
  return (
    <div className="space-y-6">
      <PageHeader title="Expense Predictions" subtitle="Understand where your spending is heading" />

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm text-slate-500">Predicted Spending — Next Month</p><Badge tone="indigo">Sample forecast</Badge>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <p className="text-4xl font-semibold tracking-tight text-slate-900">{inr(forecast?.prediction || 0)}</p>
          <span className={`mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${up ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}><Arrow size={14} />{fmtPct(change)} vs this month</span>
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4"></div>
          <div><p className="text-xs text-slate-500">Current monthly average</p><p className="text-lg font-semibold text-slate-900">{inr(forecast?.average || 0)}</p></div>
          <div><p className="text-xs text-slate-500">Predicted change vs average</p><p className="text-lg font-semibold text-slate-900">{fmtPct(
            forecast
              ? pctChange(forecast.prediction, forecast.average)
              : 0
          )}</p>
        </div>
          <div>
            <p className="text-xs text-slate-500">Months analyzed</p>
            <p className="text-lg font-semibold text-slate-900">
              {forecast?.months_used || 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Based on your transaction history
            </p>
          </div>
      </Card>

      <Card className="p-5">
      <CardHeader
        title="Spending Trend"
        subtitle="Last 6 months actual spending and next 3 months predicted"
      />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart} margin={{ left: -8, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} domain={['dataMin - 3000', 'dataMax + 2000']} />
              <Tooltip formatter={(v, n) => [inr(v), n]} contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
              <Line name="Actual" type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line
                name="Predicted"
                type="monotone"
                dataKey="predicted"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div>
        
<div className="flex flex-wrap items-center justify-between gap-3 mb-3">
  <h2 className="text-[15px] font-semibold text-slate-900">
    Category-wise Forecast
  </h2>

  <select
    value={selectedMonth || forecasts[0]?.month || ''}
    onChange={(e) => setSelectedMonth(e.target.value)}
    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
  >
    {forecasts.map((item) => (
      <option key={item.month} value={item.month}>
        {formatMonth(item.month)}
      </option>
    ))}
  </select>
</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          
        {Object.entries(categoryPredictions).map(([name, pred]) => {
          const base = categoryAverages[name] ?? 0
          const ch = pctChange(pred, base)

          const color =
            categoryColors[name] ||
            categoryColors[
              Object.keys(categoryColors).find(
                (key) => key.toLowerCase() === name.toLowerCase()
              )
            ] ||
            '#94a3b8'

          return (
            <Card key={name} className="p-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: color }}
                />
                <p className="text-sm font-medium text-slate-900 truncate">
                  {name}
                </p>
              </div>

              <p className="mt-3 text-xl font-semibold text-slate-900">
                {inr(pred)}
              </p>

              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>Avg {inr(base)}</span>
                <Badge
                  tone={ch > 8 ? 'warning' : ch < 0 ? 'positive' : 'neutral'}
                >
                  {fmtPct(ch)}
                </Badge>
              </div>
            </Card>
          )
        })}

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2"><Info size={16} className="text-indigo-600" /><h3 className="text-[15px] font-semibold text-slate-900">How is this predicted?</h3></div>
          <p className="text-sm text-slate-600 leading-relaxed">FinSight analyzes your historical spending patterns and monthly expenses to estimate your expected spending for the coming month.</p>
          <p className="text-xs text-slate-400 mt-3">This forecast is generated from your actual transaction history using a linear regression model.</p>
        </Card>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <div className="flex items-center gap-2 mb-2"><Lightbulb size={16} className="text-amber-600" /><h3 className="text-[15px] font-semibold text-amber-900">Trend to watch</h3></div>
          <p className="text-sm text-amber-900/80 leading-relaxed">Your food spending has increased for the last 3 months. If this trend continues, it may become your highest expense category next month.</p>
        </div>
      </div>
    </div>
  )
}
