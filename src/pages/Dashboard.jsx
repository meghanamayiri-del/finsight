import { useState } from 'react'
import { Plus, Wallet, CreditCard, PiggyBank, Percent, Calendar } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import SummaryCard from '../components/dashboard/SummaryCard.jsx'
import SpendingChart, { IncomeExpenseChart } from '../components/dashboard/SpendingChart.jsx'
import CategoryChart, { CategoryBars } from '../components/dashboard/CategoryChart.jsx'
import RecentTransactions from '../components/dashboard/RecentTransactions.jsx'
import SmartInsights from '../components/dashboard/SmartInsights.jsx'
import PredictionCard from '../components/dashboard/PredictionCard.jsx'
import AnomalyAlert from '../components/dashboard/AnomalyAlert.jsx'
import RecommendationCard from '../components/dashboard/RecommendationCard.jsx'
import WhatIfPreview from '../components/dashboard/WhatIfPreview.jsx'
import { useApp } from '../context/AppContext.jsx'
import { user } from '../data/mockData.js'
import { inr } from '../utils/format.js'

const months = ['October 2026', 'September 2026', 'August 2026', 'July 2026', 'June 2026', 'May 2026']
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }

export default function Dashboard() {
  const { summary, categorySpending, transactions, openAddExpense } = useApp()
  const [month, setMonth] = useState(months[0])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{greeting()}, {user.name} 👋</h1>
          <p className="text-sm text-slate-500 mt-1">Here's your financial overview for {month}.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Select month"
              className="appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
              {months.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <Button onClick={openAddExpense}><Plus size={16} />Add Expense</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard icon={Wallet} tone="indigo" label="Monthly Income" value={inr(summary.income)} note="Fixed monthly salary" />
        <SummaryCard icon={CreditCard} tone="amber" label="Total Expenses" value={inr(summary.expenses)} note="Across all categories" />
        <SummaryCard icon={PiggyBank} tone="green" label="Current Savings" value={inr(summary.savings)} note="from last month" />
        <SummaryCard icon={Percent} tone="teal" label="Savings Rate" value={`${summary.rate.toFixed(1)}%`} note="of monthly income saved" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><SpendingChart /></div>
        <CategoryChart data={categorySpending}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryBars data={categorySpending}/>
        <IncomeExpenseChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><RecentTransactions /></div>
        <SmartInsights />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <PredictionCard />
        <AnomalyAlert />
        <RecommendationCard />
      </div>

      <WhatIfPreview />
    </div>
  )
}
