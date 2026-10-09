import { useState,useEffect  } from 'react'
import { RotateCcw, Calculator } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts'
import PageHeader from '../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { categoryColors  } from '../data/mockData.js'
import { inr } from '../utils/format.js'

const names = ['Food', 'Travel & Transport', 'Shopping', 'Entertainment']
const initial = { Food: 20, 'Travel & Transport': 10, Shopping: 15, Entertainment: 10 }
const presets = [
  { label: 'Save 10%', v: Object.fromEntries(names.map((n) => [n, 10])) },
  { label: 'Save 20%', v: Object.fromEntries(names.map((n) => [n, 20])) },
  { label: 'Aggressive Saving', v: { Food: 35, 'Travel & Transport': 25, Shopping: 40, Entertainment: 50 } },
]

export default function Simulator() {
  const { summary } = useApp()
  const [categoryData, setCategoryData] = useState([])

useEffect(() => {
  fetch('http://127.0.0.1:8000/dashboard/category-spending')
    .then((res) => res.json())
    .then((data) => setCategoryData(data))
    .catch((error) => console.error('Category spending failed:', error))
}, [])


const current = Object.fromEntries(
  categoryData.map((c) => [c.category, Number(c.amount)])
)

  const [red, setRed] = useState(initial)
  // monthly_savings = sum(current_category_amount × reduction); projected = total − savings; yearly = savings × 12
  const monthly = names.reduce((s, n) => s + (current[n] * red[n]) / 100, 0)
  const total = summary.expenses
  const projected = total - monthly
  const data = [{ name: 'Current', value: total, fill: '#94a3b8' }, { name: 'Projected', value: projected, fill: '#6366f1' }, { name: 'Savings', value: monthly, fill: '#14b8a6' }]
  const same = (p) => names.every((n) => red[n] === p[n])

  return (
    <div className="space-y-6">
      <PageHeader title="What-If Savings Simulator" subtitle="See how small changes in your spending could improve your savings" />
      <Card className="p-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0"><Calculator size={17} /></div>
        <p className="text-sm text-slate-600">Adjust your spending categories and see how much you could save. Results are simple calculations from your current spending, not predictions.</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="p-5 lg:col-span-3">
          <CardHeader title="Spending categories" subtitle="Drag to set a reduction from 0% to 50%" />
          <div className="flex flex-wrap gap-2 mb-5">
            {presets.map((p) => (
              <button key={p.label} onClick={() => setRed(p.v)} className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${same(p.v) ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p.label}</button>
            ))}
            <button onClick={() => setRed(initial)} className="inline-flex items-center gap-1 px-2 text-xs text-slate-500 hover:text-slate-700"><RotateCcw size={12} />Reset</button>
          </div>
          <div className="space-y-6">
            {names.map((n) => (
              <div key={n}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: categoryColors[n] }} />{n}</p>
                  <p className="text-xs text-slate-500">Current: {inr(current[n])}/month</p>
                </div>
                <input type="range" min="0" max="50" step="1" value={red[n]} onChange={(e) => setRed({ ...red, [n]: +e.target.value })} aria-label={`${n} reduction`} className="mt-2 w-full accent-indigo-600" />
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Reduce {n} spending by <b>{red[n]}%</b></span>
                  <span className="font-medium text-emerald-600">Saves {inr((current[n] * red[n]) / 100)}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-indigo-600 text-white p-6 shadow-lg shadow-indigo-600/20">
            <p className="text-sm text-indigo-100">If you reduce your selected spending, you could save</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{inr(monthly)}<span className="text-lg font-normal text-indigo-200">/month</span></p>
            <p className="mt-2 text-sm text-indigo-100">That's <b className="text-white">{inr(monthly * 12)}</b> per year</p>
          </div>
          <Card className="p-5">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Current monthly spending</dt><dd className="font-semibold">{inr(total)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Projected monthly spending</dt><dd className="font-semibold">{inr(projected)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Monthly savings</dt><dd className="font-semibold text-emerald-600">{inr(monthly)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Yearly savings</dt><dd className="font-semibold text-emerald-600">{inr(monthly * 12)}</dd></div>
            </dl>
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <CardHeader title="Savings visualization" subtitle="Current vs projected monthly spending" />
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -8, right: 8 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => [inr(v), '']} cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={72}>{data.map((d) => <Cell key={d.name} fill={d.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
