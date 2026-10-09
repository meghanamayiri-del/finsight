import { Link } from 'react-router-dom'
import { ChevronRight, Receipt } from 'lucide-react'
import Card, { CardHeader } from '../common/Card.jsx'
import { categoryColors } from '../../data/mockData.js'
import { inr, fmtDate } from '../../utils/format.js'
import { useApp } from '../../context/AppContext.jsx'

export default function RecentTransactions() {
  const { transactions, openAddExpense } = useApp()
  const recent = transactions.slice(0, 5)
  return (
    <Card className="p-5">
      <CardHeader title="Recent Transactions" action={
        <Link to="/transactions" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-0.5">View All Transactions <ChevronRight size={14} /></Link>} />
      {recent.length === 0 ? (
        <div className="py-10 text-center">
          <Receipt className="mx-auto text-slate-300" size={32} />
          <p className="mt-2 text-sm text-slate-500">No transactions yet.</p>
          <button onClick={openAddExpense} className="mt-2 text-sm font-medium text-indigo-600">Add your first expense</button>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {recent.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <div className="h-10 w-10 shrink-0 rounded-xl grid place-items-center text-sm font-semibold text-white" style={{ background: categoryColors[t.category] || '#94a3b8' }}>{t.merchant[0]}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">{t.merchant}</p>
                <p className="text-xs text-slate-500 truncate">{t.category} → {t.subcategory}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-900">−{inr(t.amount)}</p>
                <p className="text-xs text-slate-400">{fmtDate(t.date)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
