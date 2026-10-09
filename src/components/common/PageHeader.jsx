import { Plus } from 'lucide-react'
import Button from './Button.jsx'
import { useApp } from '../../context/AppContext.jsx'

export default function PageHeader({ title, subtitle, addExpense = false, children }) {
  const { openAddExpense } = useApp()
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      {addExpense ? <Button onClick={openAddExpense}><Plus size={16} />Add Expense</Button> : children}
    </div>
  )
}
