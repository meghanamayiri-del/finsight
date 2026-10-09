import { useState } from 'react'
import Modal from '../common/Modal.jsx'
import Button from '../common/Button.jsx'
import { SourceBadge } from './TransactionTable.jsx'
import { categories, paymentMethods } from '../../data/mockData.js'
import { inr } from '../../utils/format.js'

const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm'
const L = ({ children }) => <label className="block text-xs font-medium text-slate-600 mb-1.5">{children}</label>

export function ViewModal({ t, onClose, onEdit }) {
  const items = [['Amount', inr(t.amount)], ['Date', new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })],
    ['Category', `${t.category} → ${t.subcategory}`], ['Payment method', t.method], ['Description', t.description || '—']]
  return (
    <Modal title={t.merchant} onClose={onClose}>
      <dl className="divide-y divide-slate-100 text-sm">
        {items.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-900 text-right">{v}</dd></div>)}
        <div className="flex justify-between py-2.5"><dt className="text-slate-500">Source</dt><dd><SourceBadge source={t.source} /></dd></div>
      </dl>
      <div className="flex justify-end gap-2 mt-5"><Button variant="secondary" onClick={onClose}>Close</Button><Button onClick={() => onEdit(t)}>Edit</Button></div>
    </Modal>
  )
}

export function EditModal({ t, onClose, onSave }) {
  const [f, setF] = useState({ ...t, amount: String(t.amount) })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    if (!(Number(f.amount) > 0) || !f.merchant.trim()) return setErr('Merchant and a positive amount are required.')
    onSave(t.id, { merchant: f.merchant.trim(), amount: Number(f.amount), date: f.date, category: f.category, subcategory: f.subcategory, method: f.method, description: f.description })
  }
  return (
    <Modal title="Edit Transaction" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><L>Merchant</L><input className={field} value={f.merchant} onChange={set('merchant')} /></div>
          <div><L>Amount (₹)</L><input type="number" min="0" className={field} value={f.amount} onChange={set('amount')} /></div>
          <div><L>Date</L><input type="date" className={field} value={f.date} onChange={set('date')} /></div>
          <div><L>Payment Method</L><select className={field} value={f.method} onChange={set('method')}>{paymentMethods.map((m) => <option key={m}>{m}</option>)}</select></div>
          <div><L>Category</L><select className={field} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value, subcategory: categories[e.target.value][0] })}>{Object.keys(categories).map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><L>Subcategory</L><select className={field} value={f.subcategory} onChange={set('subcategory')}>{categories[f.category].map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>
        <div><L>Description</L><input className={field} value={f.description || ''} onChange={set('description')} /></div>
        {err && <p className="text-xs text-red-600" role="alert">{err}</p>}
        <div className="flex justify-end gap-2 pt-1"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Save Changes</Button></div>
      </form>
    </Modal>
  )
}

export function DeleteModal({ t, onClose, onConfirm }) {
  return (
    <Modal title="Delete transaction?" onClose={onClose} width="sm:max-w-sm">
      <p className="text-sm text-slate-600">{t.merchant} · {inr(t.amount)} will be removed from your history.</p>
      <div className="flex justify-end gap-2 mt-5"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={() => onConfirm(t.id)}>Delete</Button></div>
    </Modal>
  )
}
