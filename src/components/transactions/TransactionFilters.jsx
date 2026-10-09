import { Search, X } from 'lucide-react'
import Card from '../common/Card.jsx'
import { categories, paymentMethods } from '../../data/mockData.js'
import { monthLabel } from '../../utils/analytics.js'

const sel = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700'
export default function TransactionFilters({ f, setF, months, onClear, active }) {
  const subs = f.category ? categories[f.category] : Object.values(categories).flat()
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value, ...(k === 'category' ? { sub: '' } : {}) })
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={f.q} onChange={set('q')} placeholder="Search merchant or description" aria-label="Search" className={`${sel} pl-9`} />
        </div>
        <select value={f.category} onChange={set('category')} aria-label="Category" className={sel}>
          <option value="">All categories</option>{Object.keys(categories).map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={f.sub} onChange={set('sub')} aria-label="Subcategory" className={sel}>
          <option value="">All subcategories</option>{subs.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={f.method} onChange={set('method')} aria-label="Payment method" className={sel}>
          <option value="">All payment methods</option>{paymentMethods.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select value={f.month} onChange={set('month')} aria-label="Month" className={sel}>
          <option value="">All dates</option>{months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </div>
      {active && (
        <button onClick={onClear} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"><X size={13} />Clear Filters</button>
      )}
    </Card>
  )
}
