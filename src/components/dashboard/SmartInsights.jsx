import { Sparkles, TrendingUp, PiggyBank } from 'lucide-react'
import Card, { CardHeader } from '../common/Card.jsx'
import Badge from '../common/Badge.jsx'
import { insights } from '../../data/mockData.js'

const style = {
  warning: { icon: TrendingUp, box: 'bg-amber-50 text-amber-600', tone: 'warning', label: 'Watch' },
  positive: { icon: PiggyBank, box: 'bg-emerald-50 text-emerald-600', tone: 'positive', label: 'Good' },
}
export default function SmartInsights() {
  return (
    <Card className="p-5 h-full">
      <CardHeader title="Smart Insights" action={<Badge tone="indigo"><Sparkles size={11} />Sample data</Badge>} />
      <ul className="space-y-3">
        {insights.map((i) => {
          const s = style[i.severity]
          return (
            <li key={i.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
              <div className={`h-9 w-9 shrink-0 rounded-lg grid place-items-center ${s.box}`}><s.icon size={17} /></div>
              <div className="min-w-0">
                <div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-900">{i.title}</p><Badge tone={s.tone}>{s.label}</Badge></div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{i.text}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
