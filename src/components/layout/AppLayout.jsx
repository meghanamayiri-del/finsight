import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import MobileNav from './MobileNav.jsx'
import Toasts from './Toasts.jsx'
import AddExpenseModal from '../transactions/AddExpenseModal.jsx'

export default function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <AddExpenseModal />
      <Toasts />
    </div>
  )
}
