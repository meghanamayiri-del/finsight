
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const API = 'https://finsight-1-j99y.onrender.com'

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [profile, setProfile] = useState({})
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    savings: 0,
    rate: 0,
  })
  const [categorySpending, setCategorySpending] = useState([])
  const [monthlySpending, setMonthlySpending] = useState([])
  const [incomeVsExpenses, setIncomeVsExpenses] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((items) => [...items, { id, message, type }])
    setTimeout(
      () => setToasts((items) => items.filter((item) => item.id !== id)),
      3200
    )
  }, [])

  // Load saved transactions
  const loadTransactions = useCallback(async () => {
    const response = await fetch(`${API}/transactions`)
    if (!response.ok) throw new Error('Failed to load transactions')
    setTransactions(await response.json())
  }, [])

  // Load profile
  const loadProfile = useCallback(async () => {
    const response = await fetch(`${API}/profile`)
    if (!response.ok) throw new Error('Failed to load profile')
    const data = await response.json()
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
    setProfile({ ...savedUser, ...data })
  }, [])

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    const endpoints = [
      '/dashboard/summary',
      '/dashboard/category-spending',
      '/dashboard/monthly-spending',
      '/dashboard/income-expenses',
    ]

    const responses = await Promise.all(
      endpoints.map((endpoint) => fetch(`${API}${endpoint}`))
    )

    if (responses.some((response) => !response.ok)) {
      throw new Error('Failed to load dashboard data')
    }

    const [summaryData, categoryData, monthlyData, incomeExpenseData] =
      await Promise.all(responses.map((response) => response.json()))

    setSummary(summaryData)
   setCategorySpending(
  categoryData.map((item) => ({
    name: item.category,
    value: Number(item.amount),
  }))
)
    setMonthlySpending(monthlyData)
    setIncomeVsExpenses(incomeExpenseData)
  }, [])

  useEffect(() => {
    loadTransactions().catch((error) =>
      console.error('Failed to load transactions:', error)
    )
    loadProfile().catch((error) =>
      console.error('Failed to load profile:', error)
    )
  }, [loadTransactions, loadProfile])

  useEffect(() => {
    loadDashboard().catch((error) =>
      console.error('Failed to load dashboard:', error)
    )
  }, [transactions, loadDashboard])

  // Add expense
  const addTransaction = useCallback(async (tx) => {
    try {
      const response = await fetch(`${API}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail)
        )
      }

      await loadTransactions()
      toast('Expense saved')
    } catch (error) {
      console.error('Failed to save expense:', error)
      toast('Failed to save expense', 'error')
    }
  }, [loadTransactions, toast])

  // Edit expense
  const updateTransaction = useCallback(async (id, patch) => {
    try {
      const current = transactions.find((item) => item.id === id)
      if (!current) throw new Error('Transaction not found')

      const response = await fetch(`${API}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...current, ...patch }),
      })

      if (!response.ok) throw new Error(await response.text())

      await loadTransactions()
      toast('Transaction updated')
    } catch (error) {
      console.error('Failed to update transaction:', error)
      toast('Failed to update transaction', 'error')
    }
  }, [transactions, loadTransactions, toast])

  // Delete expense
  const deleteTransaction = useCallback(async (id) => {
    try {
      const response = await fetch(`${API}/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error(await response.text())

      await loadTransactions()
      toast('Transaction deleted')
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      toast('Failed to delete transaction', 'error')
    }
  }, [loadTransactions, toast])

  // Update profile
  const updateProfile = useCallback(async (patch) => {
    try {
      const response = await fetch(`${API}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: Number(patch.income),
          goal: Number(patch.goal),
        }),
      })

      if (!response.ok) throw new Error(await response.text())

      setProfile((previous) => ({ ...previous, ...patch }))
      await loadDashboard()
      toast('Profile saved')
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast('Failed to save profile', 'error')
    }
  }, [loadDashboard, toast])

  const value = {
    transactions,
    profile,
    summary,
    categorySpending,
    monthlySpending,
    incomeVsExpenses,
    toasts,
    toast,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateProfile,
    modalOpen,
    openAddExpense: () => setModalOpen(true),
    closeAddExpense: () => setModalOpen(false),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

