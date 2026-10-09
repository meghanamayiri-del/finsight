import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import Logo from './Logo.jsx'
import { user } from '../../data/mockData.js'
import { initials } from '../../utils/format.js'

// Mobile/tablet top bar (the sidebar covers desktop).
export default function Header() {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white/90 backdrop-blur border-b border-slate-200/70">
      <Logo />
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><Bell size={18} /></button>
        <Link to="/profile" className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-semibold grid place-items-center">{initials(user.name)}</Link>
      </div>
    </header>
  )
}
