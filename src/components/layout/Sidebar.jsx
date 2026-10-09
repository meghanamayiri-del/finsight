import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Plus, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react'
import { navItems } from './navItems.js'
import Logo from './Logo.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { user } from '../../data/mockData.js'
import { initials } from '../../utils/format.js'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { openAddExpense } = useApp()

  return (
    <aside className={`hidden lg:flex flex-col shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200/70 transition-[width] duration-300 ${collapsed ? 'w-[76px]' : 'w-64'}`}>
      <div className={`flex items-center h-16 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <Logo showText={!collapsed} />
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} aria-label="Collapse sidebar" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {!collapsed && <p className="px-5 text-[11px] leading-snug text-slate-400 -mt-1 mb-3">Smart Expense Tracking. Smarter Financial Decisions.</p>}

      <div className="px-3 mb-2">
        <button onClick={openAddExpense} title="Add Expense"
          className={`w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-medium py-2.5 text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/25`}>
          <Plus size={18} />{!collapsed && 'Add Expense'}
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} title={label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? 'justify-center' : ''} ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100">
        {collapsed && (
          <button onClick={() => setCollapsed(false)} aria-label="Expand sidebar" className="w-full mb-2 grid place-items-center p-2 rounded-lg text-slate-400 hover:bg-slate-100">
            <PanelLeftOpen size={18} />
          </button>
        )}
        <Link to="/profile" className={`flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 ${collapsed ? 'justify-center' : ''}`}>
          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-semibold grid place-items-center">{initials(user.name)}</div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <Settings size={16} className="text-slate-400" />
            </>
          )}
        </Link>
      </div>
    </aside>
  )
}
