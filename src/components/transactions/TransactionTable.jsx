import { Eye, Pencil, Trash2, PencilLine, ScanLine } from 'lucide-react'
import Card from '../common/Card.jsx'
import Badge from '../common/Badge.jsx'
import { categoryColors } from '../../data/mockData.js'
import { inr, fmtDate } from '../../utils/format.js'

export const SourceBadge = ({ source }) =>
  source === 'Receipt' ? <Badge tone="indigo"><ScanLine size={11} />Receipt</Badge> : <Badge><PencilLine size={11} />Manual</Badge>

function Actions({ t, onView, onEdit, onDelete }) {
  const b = 'p-1.5 rounded-lg text-slate-400 hover:bg-slate-100'
  return (
    <div className="flex items-center gap-0.5">
      <button className={`${b} hover:text-indigo-600`} aria-label={`View ${t.merchant}`} onClick={() => onView(t)}><Eye size={16} /></button>
      <button className={`${b} hover:text-indigo-600`} aria-label={`Edit ${t.merchant}`} onClick={() => onEdit(t)}><Pencil size={16} /></button>
      <button className={`${b} hover:text-red-600 hover:bg-red-50`} aria-label={`Delete ${t.merchant}`} onClick={() => onDelete(t)}><Trash2 size={16} /></button>
    </div>
  )
}
const Dot = ({ c }) => <span className="inline-block h-2 w-2 rounded-full mr-2" style={{ background: categoryColors[c] }} />

export default function TransactionTable({ rows, ...act }) {
  return (
    <Card className="overflow-hidden">
      <div className="hidden lg:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500">
            <tr>{['Date', 'Merchant', 'Category', 'Subcategory', 'Amount', 'Payment', 'Source', 'Actions'].map((h) => <th key={h} className={`px-4 py-3 ${h === 'Amount' ? 'text-right' : ''}`}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtDate(t.date)}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{t.merchant}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap"><Dot c={t.category} />{t.category}</td>
                <td className="px-4 py-3 text-slate-600">{t.subcategory}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">{inr(t.amount)}</td>
                <td className="px-4 py-3 text-slate-600">{t.method}</td>
                <td className="px-4 py-3"><SourceBadge source={t.source} /></td>
                <td className="px-4 py-3"><Actions t={t} {...act} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="lg:hidden divide-y divide-slate-100">
        {rows.map((t) => (
          <li key={t.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{t.merchant}</p>
                <p className="text-xs text-slate-500 mt-0.5"><Dot c={t.category} />{t.category} → {t.subcategory}</p>
              </div>
              <p className="font-semibold text-slate-900 shrink-0">{inr(t.amount)}</p>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{fmtDate(t.date)}</span><span>·</span><span>{t.method}</span><SourceBadge source={t.source} />
              </div>
              <Actions t={t} {...act} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
