import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { TrendingUp, ShoppingBag, CalendarDays, UtensilsCrossed, Repeat, Target, ShieldAlert, HeartPulse, Sparkles } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { categoryAverages, diningAverage, recommendations, healthScore } from '../data/mockData.js'
import { sum, inMonth, pctChange, weekendStats } from '../utils/analytics.js'
import { inr } from '../utils/format.js'

const recIcons = { food: UtensilsCrossed, repeat: Repeat, target: Target }
const sevTone = { high: 'danger', medium: 'warning', low: 'neutral' }

export default function Insights() {
  const nav = useNavigate()
  const { transactions, toast } = useApp()

  const [mlAnomalies, setMlAnomalies] = useState([])
  const [recurring, setRecurring] = useState([])

useEffect(() => {
  fetch('https://finsight-1-j99y.onrender.com/ml/recurring')
    .then((res) => res.json())
    .then((data) => setRecurring(data))
    .catch((error) => console.error('Recurring detection failed:', error))
}, [])

useEffect(() => {
  fetch('https://finsight-1-j99y.onrender.com/ml/anomalies')
    .then((res) => res.json())
    .then((data) => setMlAnomalies(data))
    .catch((error) => console.error('Anomaly detection failed:', error))
}, [])


  const month = inMonth(transactions, '2026-10')
  const total = sum(month)
  const cat = (n) => sum(month.filter((t) => t.category === n))
  const food = cat('Food'), shop = cat('Shopping')
  const dining = sum(month.filter((t) => t.category === 'Food' && t.subcategory !== 'Groceries'))
  const ws = weekendStats(month)
  const wsPct = pctChange(ws.weekend, ws.weekday)
  const score = Math.round(healthScore.reduce((s, h) => s + h.score, 0) / healthScore.length)
  const label = score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : 'Needs attention'

  const cards = [
    { icon: TrendingUp, tone: 'bg-amber-50 text-amber-600', title: `Food spending ${food >= categoryAverages.Food ? 'increased' : 'decreased'} ${Math.abs(pctChange(food, categoryAverages.Food)).toFixed(0)}% this month`, text: `${inr(food)} vs a typical ${inr(categoryAverages.Food)}.` },
    { icon: ShoppingBag, tone: 'bg-indigo-50 text-indigo-600', title: `Shopping is ${((shop / (total || 1)) * 100).toFixed(0)}% of total expenses`, text: `${inr(shop)} this month, ${inr(Math.max(0, shop - categoryAverages.Shopping))} above your typical level.` },
    { icon: CalendarDays, tone: 'bg-teal-50 text-teal-600', title: `Weekend spending is ${wsPct >= 0 ? 'higher' : 'lower'} than weekdays`, text: `About ${inr(ws.weekend)}/day on weekends vs ${inr(ws.weekday)}/day on weekdays.` },
    { icon: UtensilsCrossed, tone: 'bg-pink-50 text-pink-600', title: `You spent ${dining > diningAverage ? 'more' : 'less'} than your average on dining`, text: `${inr(dining)} on eating out and delivery vs a typical ${inr(diningAverage)}.` },
  ]

const dynamicRecommendations = [
  {
    id: 'food',
    icon: 'food',
    title: 'Review Food Spending',
    text: `You spent ${inr(food)} on food this month. ${
      food > categoryAverages.Food
        ? 'Consider reducing food expenses to get closer to your typical monthly spending.'
        : 'Your food spending is within your typical monthly range.'
    }`,
    impact: Math.max(0, Math.round(food - categoryAverages.Food)),
    action: 'Try What-If',
    to: '/simulator',
  },
  {
    id: 'shopping',
    icon: 'target',
    title: 'Review Shopping Spending',
    text: `You spent ${inr(shop)} on shopping this month. ${
      shop > categoryAverages.Shopping
        ? 'Review optional purchases to reduce expenses.'
        : 'Your shopping spending is within your typical monthly range.'
    }`,
    impact: Math.max(0, Math.round(shop - categoryAverages.Shopping)),
    action: 'View Transactions',
    to: '/transactions',
  },
]
  const r = 52, circ = 2 * Math.PI * r

  return (
    <div className="space-y-8">
      <PageHeader title="Insights & Recommendations" subtitle="Personalized guidance based on your spending patterns" />

      <section>
        <h2 className="text-[15px] font-semibold text-slate-900 mb-3">Spending Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((c) => (
            <Card key={c.title} className="p-4 flex gap-3 hover:shadow-md transition-shadow">
              <div className={`h-10 w-10 shrink-0 rounded-xl grid place-items-center ${c.tone}`}><c.icon size={18} /></div>
              <div className="min-w-0"><p className="text-sm font-medium text-slate-900">{c.title}</p><p className="text-xs text-slate-500 mt-1">{c.text}</p></div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h2 className="text-[15px] font-semibold text-slate-900">Anomaly Detection</h2>
          
          <Badge tone="indigo">
            <Sparkles size={11} />
            Statistical detection
          </Badge>        
          </div>
        <div className="space-y-4">
          {mlAnomalies.map((a, i) => (
            <div key={a.id} className={`rounded-2xl border p-5 ${i === 0 ? 'border-red-200 bg-red-50/60' : 'border-amber-200 bg-amber-50/50'}`}>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className={`h-9 w-9 rounded-xl grid place-items-center ${i === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}><ShieldAlert size={18} /></div>
                <div><h3 className="text-[15px] font-semibold text-slate-900">Unusual Spending Detected</h3><p className="text-xs text-slate-500">{inr(a.amount)} spent at {a.merchant}</p></div>
                <Badge tone={sevTone[a.severity]} className="ml-auto capitalize">{a.severity} severity</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-700">{a.reason}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-xs text-slate-500">Amount</p><p className="font-semibold">{inr(a.amount)}</p></div>
                <div>
                  <p className="text-xs text-slate-500">Average spending</p>
                  <p className="font-semibold">{inr(a.average || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Above average</p>
                  <p className="font-semibold text-red-600">
                    +{inr(a.amount - (a.average || 0))}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => nav(`/transactions?q=${encodeURIComponent(a.merchant)}`)}>View Transaction</Button>
                <Button size="sm" variant="secondary" onClick={() => toast('Marked as expected spending')}>Mark as expected</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[15px] font-semibold text-slate-900 mb-3">Personalized Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dynamicRecommendations.map((rec) => {
            const Icon = recIcons[rec.icon]
            return (
              <Card key={rec.id} className="p-5 flex flex-col">
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 grid place-items-center"><Icon size={18} /></div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{rec.title}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed flex-1">{rec.text}</p>
                <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2"><p className="text-[11px] text-emerald-700">Estimated impact</p><p className="text-sm font-semibold text-emerald-700">{inr(rec.impact)}/month</p></div>
                <Button size="sm" variant="secondary" className="mt-3 self-start" onClick={() => (rec.to ? nav(rec.to) : toast('Shopping budget reminder set (demo)'))}>{rec.action}</Button>
              </Card>
            )
          })}
        </div>
      </section>

      <section>
        <Card className="p-5 sm:p-6">
          <CardHeader title="Financial Health" subtitle="A simple score from your savings and spending habits" action={<HeartPulse size={18} className="text-indigo-500" />} />
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative h-36 w-36 shrink-0 mx-auto sm:mx-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r={r} fill="none" stroke="#eef2ff" strokeWidth="10" />
                <circle cx="60" cy="60" r={r} fill="none" stroke="#6366f1" strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)} />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center"><div><p className="text-3xl font-semibold text-slate-900">{score}<span className="text-sm text-slate-400">/100</span></p><p className="text-xs font-medium text-indigo-600">{label}</p></div></div>
            </div>
            <ul className="flex-1 space-y-3">
              {healthScore.map((h) => (
                <li key={h.label}>
                  <div className="flex justify-between text-xs"><span className="font-medium text-slate-700">{h.label}</span><span className="text-slate-500">{h.score}/100 · {h.note}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${h.score}%` }} /></div>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-5 text-sm text-slate-600">Your savings are strong. Bringing food and shopping closer to your averages would lift your spending-control score the most.</p>
        </Card>
      </section>
      <section>
  <div className="flex flex-wrap items-center gap-2 mb-3">
    <h2 className="text-base font-semibold text-slate-900">Repeated Payments</h2>
    <Badge tone="indigo">
      <Sparkles size={11} /> Data-driven
    </Badge>
  </div>

  {recurring.length === 0 ? (
    <Card className="p-5">
      <p className="text-sm text-slate-500">
        No repeated payments detected yet.
      </p>
    </Card>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {recurring.map((item) => (
        <Card key={item.merchant} className="p-5">
          <p className="text-sm font-semibold text-slate-900">
            {item.merchant}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Appeared {item.count} times in your transactions
          </p>

          <p className="mt-4 text-lg font-semibold text-indigo-700">
            {inr(item.average_amount)}
          </p>

          <p className="text-xs text-slate-500">
            Average payment
          </p>
        </Card>
      ))}
    </div>
  )}
</section>
    </div>
  )
}
