import { LayoutDashboard, ArrowLeftRight, TrendingUp, Lightbulb, SlidersHorizontal, User } from 'lucide-react'
export const navItems = [
  { to: '/dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', short: 'Activity', icon: ArrowLeftRight },
  { to: '/predictions', label: 'Predictions', short: 'Forecast', icon: TrendingUp },
  { to: '/insights', label: 'Insights & Recommendations', short: 'Insights', icon: Lightbulb },
  { to: '/simulator', label: 'What-If Simulator', short: 'What-If', icon: SlidersHorizontal },
  { to: '/profile', label: 'Profile', short: 'Profile', icon: User },
]
