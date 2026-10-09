import { Link } from 'react-router-dom'
import { Sparkles, ArrowUpRight, ChevronRight } from 'lucide-react'
import Card from '../common/Card.jsx'
import Badge from '../common/Badge.jsx'
import { prediction } from '../../data/mockData.js'
import { inr } from '../../utils/format.js'

export default function PredictionCard() {
  const max = Math.max(...prediction.categories.map((c) => c.value))
  return (
    <Card className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-semibold text-slate-900">AI Expense Prediction</h3>
        <Badge tone="indigo"><Sparkles size={11} />Sample</Badge>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">Based on your recent spending patterns, your estimated expenses for next month are:</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{inr(prediction.total)}</p>
      <p className="text-xs mt-1 text-amber-600 font-medium inline-flex items-center gap-0.5"><ArrowUpRight size={13} />+{prediction.changePct}% compared with this month</p>
      <ul className="mt-4 space-y-2 flex-1">
        {prediction.categories.map((c) => (
          <li key={c.name} className="text-xs">
            <div className="flex justify-between text-slate-600"><span>{c.name}</span><span className="font-medium text-slate-900">{inr(c.value)}</span></div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-400" style={{ width: `${(c.value / max) * 100}%` }} /></div>
          </li>
        ))}
      </ul>
      <Link to="/predictions" className="mt-4 text-xs font-medium text-indigo-600 inline-flex items-center gap-0.5">View Full Prediction <ChevronRight size={14} /></Link>
    </Card>
  )
}
