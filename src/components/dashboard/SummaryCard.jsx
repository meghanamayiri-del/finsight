import { ArrowUpRight } from 'lucide-react'
import Card from '../common/Card.jsx'

const tones = {
  indigo: 'bg-indigo-50 text-indigo-600',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-emerald-50 text-emerald-600',
  teal: 'bg-teal-50 text-teal-600',
}
export default function SummaryCard({ icon: Icon, label, value, note, tone = 'indigo', trend }) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <div className={`h-9 w-9 rounded-xl grid place-items-center ${tones[tone]}`}><Icon size={18} /></div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
        {trend && <span className="inline-flex items-center gap-0.5 font-medium text-emerald-600"><ArrowUpRight size={13} />{trend}</span>}
        {note}
      </p>
    </Card>
  )
}
