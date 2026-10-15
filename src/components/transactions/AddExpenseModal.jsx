import { useState, useEffect, useRef } from 'react'
import { X, PencilLine, ScanLine, UploadCloud, Camera, Loader2, CheckCircle2 } from 'lucide-react'
import Button from '../common/Button.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { categories, paymentMethods } from '../../data/mockData.js'

const today = new Date().toLocaleDateString('en-CA')
const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400'
const Label = ({ children }) => <label className="block text-xs font-medium text-slate-600 mb-1.5">{children}</label>

function CategoryPicker({ category, sub, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div><Label>Main Category</Label>
        <select className={field} value={category} onChange={(e) => onChange(e.target.value, categories[e.target.value][0])}>
          {Object.keys(categories).map((c) => <option key={c}>{c}</option>)}
        </select></div>
      <div><Label>Subcategory</Label>
        <select className={field} value={sub} onChange={(e) => onChange(category, e.target.value)}>
          {categories[category].map((s) => <option key={s}>{s}</option>)}
        </select></div>
    </div>
  )
}

function ManualForm({ onDone }) {
  const { addTransaction } = useApp()
  const [f, setF] = useState({ amount: '', merchant: '', date: today, category: 'Food', sub: 'Groceries', method: 'UPI', description: '' })
  const [error, setError] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    if (!(Number(f.amount) > 0)) return setError('Enter an amount greater than 0.')
    if (!f.merchant.trim()) return setError('Enter a merchant name.')
    addTransaction({ merchant: f.merchant.trim(), category: f.category, subcategory: f.sub, date: f.date, amount: Number(f.amount), method: f.method, source: 'Manual', description: f.description })
    onDone()
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><Label>Amount (₹)</Label><input type="number" min="0" inputMode="decimal" className={field} placeholder="0.00" value={f.amount} onChange={set('amount')} /></div>
        <div><Label>Merchant</Label><input className={field} placeholder="e.g. Swiggy" value={f.merchant} onChange={set('merchant')} /></div>
        <div><Label>Date</Label><input type="date" className={field} value={f.date} onChange={set('date')} /></div>
        <div><Label>Payment Method</Label>
          <select className={field} value={f.method} onChange={set('method')}>{paymentMethods.map((m) => <option key={m}>{m}</option>)}</select></div>
      </div>
      <CategoryPicker category={f.category} sub={f.sub} onChange={(category, sub) => setF({ ...f, category, sub })} />
      <div><Label>Description (optional)</Label><textarea rows={2} className={field} value={f.description} onChange={set('description')} /></div>
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit">Save Expense</Button>
      </div>
    </form>
  )
}

// UI-only simulation. Later: POST /receipts/upload (OCR) then POST /ml/categorize.
const steps = ['Analyzing receipt...', 'Extracting details...', 'Identifying expense category...']
function ReceiptFlow({ onDone }) {
  const [amount, setAmount] = useState('')
  const [confirmAmount, setConfirmAmount] = useState(false)

  const { addTransaction } = useApp()
  const [stage, setStage] = useState('idle')
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [cat, setCat] = useState({ category: 'Food', sub: 'Groceries' })

  const pick = async (selectedFile) => {
    if (!selectedFile) return

    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setStage('processing')
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://127.0.0.1:8000/receipts/scan', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Receipt scanning failed')
      }

      const data = await response.json()

      setResult(data)

      setAmount(data.amount ? String(data.amount) : '')
      setConfirmAmount(false)

      
      const categoryKey = Object.keys(categories).find(
        key => key.toLowerCase() === data.category?.toLowerCase()
      )

      if (categoryKey && categories[categoryKey]?.length) {
        setCat({
          category: categoryKey,
          sub: categories[categoryKey][0],
        })
      }


      setStage('review')
    } catch (err) {
      console.error(err)
      setError('Could not scan the receipt. Please try again.')
      setStage('idle')
    }
  }

  if (stage === 'idle') {
    return (
      <div>
        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            pick(e.dataTransfer.files[0])
          }}
          className={`block cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            drag
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
          }`}
        >
          <UploadCloud className="mx-auto text-indigo-500" size={32} />

          <p className="mt-3 text-sm font-medium text-slate-800">
            Upload a clear photo of your receipt
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Drag & drop or click to browse · JPG, PNG, WEBP
          </p>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => pick(e.target.files[0])}
          />
        </label>

        {error && (
          <p className="mt-3 text-xs text-red-600 text-center">
            {error}
          </p>
        )}

        <label className="sm:hidden mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700">
          <Camera size={16} />
          Take a photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => pick(e.target.files[0])}
          />
        </label>
      </div>
    )
  }

  if (stage === 'processing') {
    return (
      <div className="py-10 text-center">
        {preview && (
          <img
            src={preview}
            alt="Receipt preview"
            className="mx-auto h-32 rounded-xl object-cover border border-slate-200 mb-5"
          />
        )}

        <Loader2
          size={28}
          className="mx-auto animate-spin text-indigo-500"
        />

        <p className="mt-3 text-sm font-medium text-slate-800">
          Scanning your receipt...
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Reading receipt text and identifying the expense category
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        {preview && (
          <img
            src={preview}
            alt="Receipt"
            className="h-24 w-20 rounded-lg object-cover border border-slate-200 hidden sm:block"
          />
        )}

        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1">
            OCR Extracted Text
          </p>

          <div className="max-h-32 overflow-y-auto rounded-lg bg-white border border-slate-200 p-3 text-xs text-slate-700">
            {result?.text || 'No text detected'}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
  <p className="text-xs text-slate-500">Detected Total</p>

  <p className="text-sm font-semibold text-slate-900 mt-1">
    ₹{result?.amount || 0}
  </p>

  <p className="text-xs text-slate-600 mt-2">
    Is this the correct total?
  </p>

  <div className="flex gap-2 mt-3">
    <Button
      type="button"
      variant="secondary"
      onClick={() => setConfirmAmount(true)}
    >
      No, I'll enter it
    </Button>

    <Button
      type="button"
      onClick={() => setConfirmAmount(false)}
    >
      Yes, use this
    </Button>
  </div>

  {confirmAmount && (
    <input
      type="number"
      min="0"
      className={`${field} mt-3`}
      placeholder="Enter correct amount"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
    />
  )}
</div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
        <p className="text-xs text-slate-500">
          ML Suggested Category
        </p>

        <p className="text-sm font-semibold text-slate-900 mt-1">
          {cat.category} → {cat.sub}
        </p>

        <p className="text-xs text-emerald-600 mt-1">
          Category predicted from the receipt text
        </p>

        <p className="text-xs font-medium text-slate-600 mt-3 mb-2">
          Change Category
        </p>

        <CategoryPicker
          category={cat.category}
          sub={cat.sub}
          onChange={(category, sub) => setCat({ category, sub })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>

        <Button
          onClick={() => {
            addTransaction({
              merchant: result?.merchant || 'Receipt Scan',
              category: cat.category,
              subcategory: cat.sub,
              date: today,
              amount: Number(amount),
              method: 'UPI',
              source: 'Receipt',
              description: result?.text || '',
            })

            onDone()
          }}
        >
          Confirm & Save Expense
        </Button>
      </div>
    </div>
  )
}

export default function AddExpenseModal() {
  const { modalOpen, closeAddExpense } = useApp()
  const [tab, setTab] = useState('receipt')
  useEffect(() => {
    if (!modalOpen) return
    const esc = (e) => e.key === 'Escape' && closeAddExpense()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [modalOpen, closeAddExpense])
  if (!modalOpen) return null

  const tabs = [{ id: 'receipt', label: 'Scan / Upload Receipt', icon: ScanLine }, { id: 'manual', label: 'Add Manually', icon: PencilLine }]
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Add expense">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={closeAddExpense} />
      <div className="pop relative w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">{tab === 'receipt' ? 'Scan a Receipt' : 'Add Expense'}</h2>
          <button onClick={closeAddExpense} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 mb-5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs sm:text-sm font-medium transition-colors ${tab === id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>
        {tab === 'manual' ? <ManualForm onDone={closeAddExpense} /> : <ReceiptFlow key={String(modalOpen)} onDone={closeAddExpense} />}
      </div>
    </div>
  )
}
