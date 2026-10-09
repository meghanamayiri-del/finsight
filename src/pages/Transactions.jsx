import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Receipt, IndianRupee, CalendarDays, BarChart3, SearchX, Sparkles  } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import SummaryCard from '../components/dashboard/SummaryCard.jsx'
import TransactionFilters from '../components/transactions/TransactionFilters.jsx'
import TransactionTable from '../components/transactions/TransactionTable.jsx'
import { ViewModal, EditModal, DeleteModal } from '../components/transactions/TransactionModals.jsx'
import { useApp } from '../context/AppContext.jsx'
import { sum, inMonth } from '../utils/analytics.js'
import { inr } from '../utils/format.js'

const blank = { q: '', category: '', sub: '', method: '', month: '' }

export default function Transactions() {
  const { transactions, updateTransaction, deleteTransaction } = useApp()
  const [sp] = useSearchParams()
  const [f, setF] = useState({ ...blank, q: sp.get('q') || '' })
  const [view, setView] = useState(null), [edit, setEdit] = useState(null), [del, setDel] = useState(null)

  const [sms, setSms] = useState('')
  const [aiCategory, setAiCategory] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const analyzeSMS = async () => {
  if (!sms.trim()) return

  setAiLoading(true)
  setAiCategory('')

  try {
    const response = await fetch('http://127.0.0.1:8000/ml/categorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: sms,
      }),
    })

    const data = await response.json()
    setAiCategory(data.category)
  } catch (error) {
    console.error('AI categorization failed:', error)
    setAiCategory('Unable to analyze')
  } finally {
    setAiLoading(false)
  }
}

  const months = useMemo(() => [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort().reverse(), [transactions])
  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    return transactions
      .filter((t) => (!q || `${t.merchant} ${t.description || ''}`.toLowerCase().includes(q)) && (!f.category || t.category === f.category)
        && (!f.sub || t.subcategory === f.sub) && (!f.method || t.method === f.method) && (!f.month || t.date.startsWith(f.month)))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, f])
  const active = Object.values(f).some(Boolean)

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" subtitle="View and manage your spending history" addExpense />
      <Card className="p-5 border-indigo-100 bg-indigo-50/40">
  <div className="flex items-center gap-2 mb-3">
    <Sparkles size={18} className="text-indigo-600" />
    <div>
      <h2 className="text-sm font-semibold text-slate-900">AI Bank SMS Scanner</h2>
      <p className="text-xs text-slate-500">
        Paste a bank message and let FinSight detect the expense category.
      </p>
    </div>
  </div>

  <div className="flex flex-col sm:flex-row gap-3">
    <input
      value={sms}
      onChange={(e) => setSms(e.target.value)}
      placeholder="Paste your bank SMS here..."
      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
    />

    <Button onClick={analyzeSMS} disabled={aiLoading || !sms.trim()}>
      {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
    </Button>
  </div>

  {aiCategory && (
    <div className="mt-3 rounded-xl bg-white border border-slate-200 px-4 py-3">
      <p className="text-xs text-slate-500">AI detected category</p>
      <p className="mt-1 text-base font-semibold text-indigo-700 capitalize">
        {aiCategory}
      </p>
    </div>
  )}
</Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard icon={Receipt} tone="indigo" label="Total Transactions" value={transactions.length} note="in your history" />
        <SummaryCard icon={IndianRupee} tone="amber" label="Total Spent" value={inr(sum(transactions))} note="all time" />
        <SummaryCard icon={CalendarDays} tone="teal" label="This Month" value={inr(sum(inMonth(transactions, '2026-10')))} note="October 2026" />
        <SummaryCard icon={BarChart3} tone="green" label="Average Transaction" value={inr(transactions.length ? sum(transactions) / transactions.length : 0)} note="per transaction" />
      </div>
      <TransactionFilters f={f} setF={setF} months={months} active={active} onClear={() => setF(blank)} />
      <p className="text-xs text-slate-500 -mt-2">Showing {rows.length} of {transactions.length} transactions</p>
      {rows.length ? (
        <TransactionTable rows={rows} onView={setView} onEdit={setEdit} onDelete={setDel} />
      ) : (
        <Card className="py-16 text-center">
          <SearchX className="mx-auto text-slate-300" size={36} />
          <p className="mt-3 text-sm font-medium text-slate-800">No transactions found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => setF(blank)}>Clear Filters</Button>
        </Card>
      )}
      {view && <ViewModal t={view} onClose={() => setView(null)} onEdit={(t) => { setView(null); setEdit(t) }} />}
      {edit && <EditModal t={edit} onClose={() => setEdit(null)} onSave={(id, p) => { updateTransaction(id, p); setEdit(null) }} />}
      {del && <DeleteModal t={del} onClose={() => setDel(null)} onConfirm={(id) => { deleteTransaction(id); setDel(null) }} />}
    </div>
  )
}
