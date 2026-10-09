export const sum = (list) => list.reduce((s, t) => s + t.amount, 0)
export const inMonth = (list, ym) => list.filter((t) => t.date.startsWith(ym))
export const pctChange = (now, base) => (base ? ((now - base) / base) * 100 : 0)
export const fmtPct = (n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`
export const monthLabel = (ym) =>
  new Date(ym + '-01T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

// Average spend per day on weekends vs weekdays, for the days elapsed in a month's data.
export function weekendStats(list) {
  if (!list.length) return { weekend: 0, weekday: 0 }
  const last = Math.max(...list.map((t) => +t.date.slice(8)))
  const [y, m] = list[0].date.split('-')
  let wd = 0, we = 0
  for (let d = 1; d <= last; d++) { const g = new Date(+y, +m - 1, d).getDay(); g === 0 || g === 6 ? we++ : wd++ }
  const isWe = (t) => { const g = new Date(t.date + 'T00:00:00').getDay(); return g === 0 || g === 6 }
  return { weekend: sum(list.filter(isWe)) / (we || 1), weekday: sum(list.filter((t) => !isWe(t))) / (wd || 1) }
}
