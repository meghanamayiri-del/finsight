import { useNavigate } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import Card from '../common/Card.jsx'
import Button from '../common/Button.jsx'
import { whatIfDefaults } from '../../data/mockData.js'
import { inr } from '../../utils/format.js'

export default function WhatIfPreview() {
  const nav = useNavigate()
  const monthly = whatIfDefaults.reduce((s, c) => s + (c.current * c.reduction) / 100, 0)
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex items-start gap-3 lg:w-1/4">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center"><SlidersHorizontal size={18} /></div>
          <div><h3 className="text-[15px] font-semibold text-slate-900">What If You Changed Your Spending?</h3>
            <p className="text-xs text-slate-500 mt-0.5">A quick preview of small changes.</p></div>
        </div>
        <div className="flex flex-wrap gap-2 lg:flex-1">
          {whatIfDefaults.map((c) => (
            <span key={c.key} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">{c.label} <b className="text-emerald-600">−{c.reduction}%</b></span>
          ))}
        </div>
        <div className="flex items-center gap-6 sm:gap-8">
          <div><p className="text-[11px] text-slate-500">Potential Monthly Savings</p><p className="text-xl font-semibold text-emerald-600">{inr(monthly)}</p></div>
          <div><p className="text-[11px] text-slate-500">Potential Yearly Savings</p><p className="text-xl font-semibold text-emerald-600">{inr(monthly * 12)}</p></div>
        </div>
        <Button onClick={() => nav('/simulator')} className="lg:ml-2">Open Simulator</Button>
      </div>
    </Card>
  )
}
