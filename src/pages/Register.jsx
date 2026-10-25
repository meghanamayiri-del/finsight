import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/layout/AuthShell.jsx'
import Button from '../components/common/Button.jsx'

const input = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm'
export default function Register() {
  const nav = useNavigate()
  const [err, setErr] = useState('')
  const submit = async (e) => {
  e.preventDefault()

  const d = new FormData(e.target)

  if (d.get('password') !== d.get('confirm')) {
    setErr('Passwords do not match.')
    return
  }

  setErr('')

  try {
    const response = await fetch('https://finsight-1-j99y.onrender.com/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: d.get('name'),
        email: d.get('email'),
        password: d.get('password'),
        income: Number(d.get('income')),
        goal: Number(d.get('goal')),
        currency: 'INR',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setErr(data.detail || 'Registration failed')
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    nav('/dashboard')
  } catch (error) {
    console.error(error)
    setErr('Cannot connect to FinSight backend')
  }
}
  const F = ({ label, name, type = 'text', ph }) => (
    <div><label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label><input name={name} type={type} required placeholder={ph} className={input} /></div>
  )
  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Start tracking your expenses in minutes.</p>
      <form onSubmit={submit} className="space-y-4">
        <F label="Full Name" name="name" ph="Meghana" />
        <F label="Email" name="email" type="email" ph="you@example.com" />
        <F label="Password" name="password" type="password" ph="••••••••" />
        <F label="Confirm Password" name="confirm" type="password" ph="••••••••" />
        <F label="Monthly Income (₹)" name="income" type="number" ph="Enter your monthly income" />
        <F label="Monthly Income (₹)" name="income" type="number" ph="Enter your monthly income" />
        <F label="Monthly Savings Goal (₹)" name="goal" type="number" ph="Enter your savings goal" />
        {err && <p className="text-xs text-red-600" role="alert">{err}</p>}
        <Button type="submit" size="lg" className="w-full">Create Account</Button>
      </form>
      <p className="text-sm text-slate-500 mt-6 text-center">Already have an account? <Link to="/login" className="font-medium text-indigo-600">Sign in</Link></p>
    </AuthShell>
  )
}
