import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import Button from '../common/Button.jsx'
import { anomaly } from '../../data/mockData.js'
import { useApp } from '../../context/AppContext.jsx'

export default function AnomalyAlert() {
  const [open, setOpen] = useState(true)
  const nav = useNavigate()
  const { toast } = useApp()
  if (!open) return (
    <div className="rounded-2xl border border-dashed border-slate-200 p-5 h-full grid place-items-center text-sm text-slate-400">No active alerts</div>
  )
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 h-full flex flex-col">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-red-100 text-red-600 grid place-items-center"><ShieldAlert size={18} /></div>
        <h3 className="text-[15px] font-semibold text-red-900">Unusual Spending Detected</h3>
      </div>
      <p className="mt-3 text-sm text-red-900/80 leading-relaxed flex-1">{anomaly.text}</p>
      <div className="mt-4 flex gap-2">
        <Button variant="danger" size="sm" onClick={() => nav('/transactions')}>View Transaction</Button>
        <Button variant="secondary" size="sm" onClick={() => { setOpen(false); toast('Alert dismissed') }}>Dismiss</Button>
      </div>
    </div>
  )
}
