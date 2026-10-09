import { useState } from 'react'

import { CalendarCheck } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import Badge from '../components/common/Badge.jsx'
import Toggle from '../components/common/Toggle.jsx'
import Modal from '../components/common/Modal.jsx'
import { useApp } from '../context/AppContext.jsx'
import { initials, inr } from '../utils/format.js'

const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm'
const L = ({ children }) => <label className="block text-xs font-medium text-slate-600 mb-1.5">{children}</label>

function PasswordModal({ onClose }) {
  const { toast } = useApp()
  const [err, setErr] = useState('')
  const submit = (e) => {
    e.preventDefault()
    const d = new FormData(e.target)
    if (d.get('next').length < 8) return setErr('New password must be at least 8 characters.')
    if (d.get('next') !== d.get('confirm')) return setErr('Passwords do not match.')
    toast('Password updated (demo)'); onClose()
  }
  return (
    <Modal title="Change Password" onClose={onClose} width="sm:max-w-md">
      <form onSubmit={submit} className="space-y-3">
        {[['current', 'Current password'], ['next', 'New password'], ['confirm', 'Confirm new password']].map(([n, l]) => (
          <div key={n}><L>{l}</L><input name={n} type="password" required className={field} /></div>
        ))}
        {err && <p className="text-xs text-red-600" role="alert">{err}</p>}
        <div className="flex justify-end gap-2 pt-1"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Update Password</Button></div>
      </form>
    </Modal>
  )
}

export default function Profile() {
  const { profile, updateProfile, summary } = useApp()
  
  const [income, setIncome] = useState(String(profile.income))
  const [goal, setGoal] = useState(String(profile.goal))
  const [err, setErr] = useState('')
  const [prefs, setPrefs] = useState({ monthly: true, unusual: true, reminders: false })
  

  const save = (e) => {
    e.preventDefault()
    if (!(Number(income) > 0) || Number(goal) < 0) return setErr('Enter a valid income and savings goal.')
    if (Number(goal) > Number(income)) return setErr('Savings goal cannot exceed monthly income.')
    setErr(''); updateProfile({ income: Number(income), goal: Number(goal) })
  }
  const goalMet = summary.savings >= profile.goal
  const toggles = [['monthly', 'Monthly spending alerts', 'A summary when your spending nears your usual total'], ['unusual', 'Unusual spending alerts', 'Flag transactions far above your normal range'], ['reminders', 'Upcoming payment reminders', 'Remind me before recurring bills are due']]

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage your account and financial preferences" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 text-center lg:text-left">
          <div className="mx-auto lg:mx-0 h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-2xl font-semibold grid place-items-center">{initials(profile.name)}</div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">{profile.name}</h2>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500"><CalendarCheck size={14} />Member since {profile.memberSince}</p>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <CardHeader title="Financial information" subtitle="Used for your savings rate and goals" />
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><L>Monthly Income (₹)</L><input type="number" min="0" className={field} value={income} onChange={(e) => setIncome(e.target.value)} /></div>
              <div><L>Monthly Savings Goal (₹)</L><input type="number" min="0" className={field} value={goal} onChange={(e) => setGoal(e.target.value)} /></div>
              <div><L>Preferred Currency</L><select className={`${field} bg-slate-50`} disabled><option>INR (₹)</option></select></div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              This month you've saved {inr(summary.savings)}. <Badge tone={goalMet ? 'positive' : 'warning'}>{goalMet ? 'Goal on track' : 'Below goal'}</Badge>
            </div>
            {err && <p className="text-xs text-red-600" role="alert">{err}</p>}
            <Button type="submit">Save Changes</Button>
          </form>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <CardHeader title="Preferences" />
          <ul className="divide-y divide-slate-100">
            {toggles.map(([k, t, d]) => (
              <li key={k} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0"><p className="text-sm font-medium text-slate-900">{t}</p><p className="text-xs text-slate-500">{d}</p></div>
                <Toggle label={t} checked={prefs[k]} onChange={(v) => setPrefs({ ...prefs, [k]: v })} />
              </li>
            ))}
          </ul>
        </Card>
        
      </div>
      
    </div>
  )
}
