import { LineChart } from 'lucide-react'
export default function Logo({ showText = true }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-9 w-9 shrink-0 rounded-xl bg-indigo-600 text-white grid place-items-center shadow-sm shadow-indigo-600/30">
        <LineChart size={18} />
      </div>
      {showText && <span className="text-lg font-semibold tracking-tight text-slate-900">FinSight</span>}
    </div>
  )
}
