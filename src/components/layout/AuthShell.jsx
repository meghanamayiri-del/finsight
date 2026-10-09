import Logo from './Logo.jsx'
import { ShieldCheck, TrendingUp, PiggyBank } from 'lucide-react'

export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-indigo-700 text-white p-12">
        <div className="flex items-center gap-2.5"><div className="bg-white/15 rounded-xl p-1.5"><Logo showText={false} /></div><span className="text-lg font-semibold">FinSight</span></div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight max-w-md">Smart Expense Tracking. Smarter Financial Decisions.</h2>
          <p className="mt-4 text-indigo-100 max-w-md text-sm leading-relaxed">See where your money goes, spot unusual spending and find simple ways to save more each month.</p>
          <ul className="mt-8 space-y-3 text-sm text-indigo-50">
            <li className="flex items-center gap-3"><TrendingUp size={18} />Clear spending analytics</li>
            <li className="flex items-center gap-3"><PiggyBank size={18} />Savings ideas you can test</li>
            <li className="flex items-center gap-3"><ShieldCheck size={18} />Alerts for unusual activity</li>
          </ul>
        </div>
        <p className="text-xs text-indigo-200">College project demo · sample data only</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo /></div>
          {children}
        </div>
      </div>
    </div>
  )
}
