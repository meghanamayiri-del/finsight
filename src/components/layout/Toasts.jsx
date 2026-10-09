import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

export default function Toasts() {
  const { toasts } = useApp()
  return (
    <div className="fixed z-[60] top-4 right-4 left-4 sm:left-auto space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pop pointer-events-auto flex items-center gap-2 ml-auto w-fit max-w-full rounded-xl bg-slate-900 text-white text-sm px-4 py-3 shadow-lg">
          {t.type === 'error' ? <AlertCircle size={16} className="text-red-400" /> : <CheckCircle2 size={16} className="text-emerald-400" />}
          {t.message}
        </div>
      ))}
    </div>
  )
}
