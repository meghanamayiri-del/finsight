import { useNavigate } from 'react-router-dom'
import { Lightbulb } from 'lucide-react'
import Card from '../common/Card.jsx'
import Button from '../common/Button.jsx'
import { recommendation } from '../../data/mockData.js'
import { inr } from '../../utils/format.js'

export default function RecommendationCard() {
  const nav = useNavigate()
  return (
    <Card className="p-5 h-full flex flex-col">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 grid place-items-center"><Lightbulb size={18} /></div>
        <h3 className="text-[15px] font-semibold text-slate-900">Personalized Recommendation</h3>
      </div>
      <p className="mt-3 text-sm text-slate-600 leading-relaxed flex-1">{recommendation.text}</p>
      <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2.5">
        <p className="text-[11px] text-emerald-700">Potential yearly savings</p>
        <p className="text-lg font-semibold text-emerald-700">{inr(recommendation.yearly)}</p>
      </div>
      <Button size="sm" className="mt-4 self-start" onClick={() => nav('/simulator')}>Try What-If</Button>
    </Card>
  )
}
