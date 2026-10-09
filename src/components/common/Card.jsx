export default function Card({ className = '', children, ...rest }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/70 shadow-card ${className}`} {...rest}>
      {children}
    </div>
  )
}
export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
