export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN')
export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
export const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
