import { NavLink } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { navItems } from './navItems.js'
import { useApp } from '../../context/AppContext.jsx'

export default function MobileNav() {
  const { openAddExpense } = useApp()
  const items = navItems.filter((n) => n.to !== '/profile') // profile is reachable via header avatar
  const left = items.slice(0, 2), right = items.slice(2)
  const link = ({ to, short, icon: Icon }) => (
    <NavLink key={to} to={to} className={({ isActive }) => `flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
      <Icon size={20} />{short}
    </NavLink>
  )
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end max-w-xl mx-auto">
        {left.map(link)}
        <div className="flex-1 flex justify-center">
          <button onClick={openAddExpense} aria-label="Add Expense" className="-mt-5 h-12 w-12 rounded-full bg-indigo-600 text-white grid place-items-center shadow-lg shadow-indigo-600/40">
            <Plus size={22} />
          </button>
        </div>
        {right.map(link)}
      </div>
    </nav>
  )
}
