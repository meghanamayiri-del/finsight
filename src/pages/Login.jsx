import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/layout/AuthShell.jsx'
import Button from '../components/common/Button.jsx'

const input = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm'

export default function Login() {
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()

    const d = new FormData(e.target)

    try {
      const response = await fetch('https://finsight-1-j99y.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: d.get('email'),
          password: d.get('password'),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.detail || 'Login failed')
        return
      }

      // Save login information
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      nav('/dashboard')
    } catch (error) {
      console.error(error)
      alert('Cannot connect to FinSight backend')
    }
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Welcome back
      </h1>

      <p className="text-sm text-slate-500 mt-1 mb-6">
        Sign in to your FinSight account.
      </p>

      <form onSubmit={submit} className="space-y-4">

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Email
          </label>

          <input
            name="email"
            type="email"
            required
            className={input}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Password
          </label>

          <input
            name="password"
            type="password"
            required
            className={input}
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          Sign In
        </Button>

      </form>

      <p className="text-sm text-slate-500 mt-6 text-center">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-indigo-600"
        >
          Create account
        </Link>
      </p>
    </AuthShell>
  )
}