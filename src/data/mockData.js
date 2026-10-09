// Central mock data — one shared transaction ledger feeds every page. Replace with API calls later.

export const user = { // GET /users/me
  name: 'Meghana', email: 'meghana@example.com', income: 50000, goal: 15000, currency: 'INR', memberSince: 'March 2026',
}

export const categoryColors = {
  Food: '#6366f1', 'Travel & Transport': '#14b8a6', Shopping: '#f59e0b',
  'Bills & Utilities': '#8b5cf6', Entertainment: '#ec4899', Health: '#10b981',
  Education: '#0ea5e9', Other: '#94a3b8',
}

export const categories = {
  Food: ['Groceries', 'Restaurants', 'Junk Food', 'Cafe'],
  'Travel & Transport': ['Cab', 'Fuel', 'Bus/Train', 'Flights', 'Other Transport'],
  Shopping: ['Clothing', 'Electronics', 'Home', 'Online Shopping', 'Other Shopping'],
  'Bills & Utilities': ['Electricity', 'Internet', 'Mobile', 'Water', 'Rent'],
  Entertainment: ['Movies', 'Streaming', 'Games', 'Events'],
  Health: ['Medicine', 'Doctor/Hospital', 'Fitness'],
  Education: ['Courses', 'Books', 'College', 'Other Education'],
  Other: ['Gifts', 'Personal Care', 'Miscellaneous'],
}

export const paymentMethods = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking']

const C = { f: 'Food', t: 'Travel & Transport', s: 'Shopping', b: 'Bills & Utilities', e: 'Entertainment', h: 'Health', d: 'Education', o: 'Other' }
// [id, merchant, cat, subcategory, date, amount, method, source, description]
const rows = [
  ['t1', 'DMart', 'f', 'Groceries', '2026-10-07', 2450, 'UPI', 'Receipt', 'Weekly groceries'],
  ['t2', 'Uber', 't', 'Cab', '2026-10-06', 320, 'UPI', 'Manual', 'Ride to office'],
  ['t3', 'Netflix', 'e', 'Streaming', '2026-10-05', 649, 'Credit Card', 'Manual', 'Monthly subscription'],
  ['t4', 'Myntra', 's', 'Clothing', '2026-10-04', 1899, 'Credit Card', 'Manual', 'Festive kurta'],
  ['t5', 'Apollo Pharmacy', 'h', 'Medicine', '2026-10-03', 850, 'UPI', 'Receipt', 'Monthly medicines'],
  ['t6', 'Reliance Digital', 's', 'Electronics', '2026-10-04', 4800, 'Credit Card', 'Receipt', 'Bluetooth speaker'],
  ['t7', 'Swiggy', 'f', 'Junk Food', '2026-10-06', 1380, 'UPI', 'Manual', 'Dinner orders'],
  ['t8', 'Zomato', 'f', 'Junk Food', '2026-10-04', 1520, 'UPI', 'Manual', 'Weekend food orders'],
  ['t9', "Domino's", 'f', 'Junk Food', '2026-10-03', 1300, 'Debit Card', 'Manual', 'Pizza night'],
  ['t10', 'Cafe Coffee Day', 'f', 'Cafe', '2026-10-05', 550, 'UPI', 'Manual', 'Coffee with friends'],
  ['t11', 'Ola', 't', 'Cab', '2026-10-05', 410, 'UPI', 'Manual', 'Airport drop'],
  ['t12', 'IRCTC', 't', 'Bus/Train', '2026-10-02', 1850, 'Net Banking', 'Manual', 'Train tickets home'],
  ['t13', 'Indian Oil', 't', 'Fuel', '2026-10-01', 1720, 'Debit Card', 'Receipt', 'Petrol'],
  ['t14', 'Electricity Bill', 'b', 'Electricity', '2026-10-02', 1850, 'Net Banking', 'Manual', 'TSSPDCL bill'],
  ['t15', 'Airtel Broadband', 'b', 'Internet', '2026-10-01', 1199, 'UPI', 'Manual', 'Wi-Fi plan'],
  ['t16', 'Jio Recharge', 'b', 'Mobile', '2026-10-03', 749, 'UPI', 'Manual', 'Mobile plan'],
  ['t17', 'HMWSSB Water Bill', 'b', 'Water', '2026-10-02', 1202, 'Net Banking', 'Manual', 'Water bill'],
  ['t18', 'Spotify', 'e', 'Streaming', '2026-10-05', 119, 'Credit Card', 'Manual', 'Music subscription'],
  ['t19', 'Amazon Prime', 'e', 'Streaming', '2026-10-01', 299, 'Credit Card', 'Manual', 'Prime membership'],
  ['t20', 'BookMyShow', 'e', 'Movies', '2026-10-04', 1100, 'UPI', 'Manual', 'Movie tickets'],
  ['t21', 'Steam', 'e', 'Games', '2026-10-02', 333, 'Credit Card', 'Manual', 'Game purchase'],
  ['t22', 'Cult.fit', 'h', 'Fitness', '2026-10-01', 832, 'UPI', 'Manual', 'Gym membership'],
  ["t23", "Dr. Reddy's Clinic", 'h', 'Doctor/Hospital', '2026-10-02', 668, 'Cash', 'Manual', 'Consultation'],
  ['t24', 'College Books', 'd', 'Books', '2026-10-02', 1500, 'UPI', 'Receipt', 'Semester textbooks'],
  ['t25', 'Ferns N Petals', 'o', 'Gifts', '2026-10-04', 1401, 'Credit Card', 'Manual', 'Birthday gift'],
  ['t26', 'Urban Company', 'o', 'Personal Care', '2026-10-05', 1500, 'UPI', 'Manual', 'Salon at home'],
  // a few September rows so the month filter has something to show
  ['t27', 'BigBasket', 'f', 'Groceries', '2026-09-28', 2150, 'UPI', 'Receipt', 'Monthly staples'],
  ['t28', 'Amazon', 's', 'Online Shopping', '2026-09-25', 2399, 'Credit Card', 'Manual', 'Kitchen items'],
  ['t29', 'Swiggy', 'f', 'Junk Food', '2026-09-22', 640, 'UPI', 'Manual', 'Lunch order'],
  ['t30', 'Ola', 't', 'Cab', '2026-09-20', 380, 'UPI', 'Manual', 'Cab ride'],
  ['t31', 'Zomato', 'f', 'Restaurants', '2026-09-18', 920, 'UPI', 'Manual', 'Dinner'],
]
export const transactions = rows.map(([id, merchant, c, subcategory, date, amount, method, source, description]) => // GET /transactions
  ({ id, merchant, category: C[c], subcategory, date, amount, method, source, description }))

const thisMonth = transactions.filter((t) => t.date.startsWith('2026-10'))
export const categorySpending = Object.keys(categoryColors).map((name) => ({ // GET /dashboard/category-spending
  name, value: thisMonth.filter((t) => t.category === name).reduce((s, t) => s + t.amount, 0),
}))
export const summaryBase = { savingsChange: 8.4 } // GET /dashboard/summary

export const monthlySpending = [ // GET /dashboard/monthly-spending
  { month: 'Nov', amount: 26400 }, { month: 'Dec', amount: 33800 }, { month: 'Jan', amount: 27900 },
  { month: 'Feb', amount: 25600 }, { month: 'Mar', amount: 28300 }, { month: 'Apr', amount: 27100 },
  { month: 'May', amount: 27800 }, { month: 'Jun', amount: 29400 }, { month: 'Jul', amount: 31200 },
  { month: 'Aug', amount: 28900 }, { month: 'Sep', amount: 30750 }, { month: 'Oct', amount: 32450 },
]
export const incomeVsExpenses = monthlySpending.slice(-6).map((m) => ({ month: m.month, income: 50000, expense: m.amount }))

// Typical (average) monthly spend per category, used by insights + predictions.
export const categoryAverages = { Food: 6100, 'Travel & Transport': 4100, Shopping: 5300, 'Bills & Utilities': 4900, Entertainment: 2400, Health: 2200, Education: 1400, Other: 3000 }
export const diningAverage = 3600

export const insights = [ // dashboard feed
  { id: 'i1', severity: 'warning', title: 'Food spending increased', text: 'You spent 18% more on food this month compared with your average.' },
  { id: 'i2', severity: 'warning', title: 'Shopping looks higher than usual', text: 'Shopping spending is ₹1,400 above your typical monthly spending.' },
  { id: 'i3', severity: 'positive', title: 'Good savings habit', text: 'You have saved 35.1% of your monthly income this month.' },
]

export const prediction = { // GET /ml/prediction
  month: 'November 2026', total: 34800, changePct: 7.2, confidence: 87,
  categories: [
    { name: 'Food', value: 7800 }, { name: 'Shopping', value: 6500 }, { name: 'Travel', value: 4600 },
    { name: 'Bills', value: 5100 }, { name: 'Other', value: 10800 },
  ],
}
export const categoryForecast = { // predicted next month per category (sums to prediction.total)
  Food: 7800, 'Travel & Transport': 4600, Shopping: 6500, 'Bills & Utilities': 5100,
  Entertainment: 2700, Health: 2500, Education: 1600, Other: 4000,
}

export const anomalies = [ // GET /ml/anomalies
  { id: 'a1', txId: 't6', merchant: 'Reliance Digital', category: 'Shopping', subcategory: 'Electronics', amount: 4800, min: 800, max: 2200, severity: 'high',
    reason: 'This transaction is significantly higher than your typical shopping expenses.' },
  { id: 'a2', txId: 't13', merchant: 'Indian Oil', category: 'Travel & Transport', subcategory: 'Fuel', amount: 1720, min: 900, max: 1400, severity: 'medium',
    reason: 'Fuel spending is above your usual range for a single fill-up.' },
]
export const anomaly = { ...anomalies[0], text: 'Your ₹4,800 shopping transaction is significantly higher than your usual shopping expenses.' }

export const recommendation = { // dashboard card
  text: 'You could save approximately ₹1,260/month by reducing Junk Food spending by 30%.', monthly: 1260, yearly: 15120,
}
export const recurring = [ // detected subscriptions
  { name: 'Netflix', amount: 649 }, { name: 'Amazon Prime', amount: 299 }, { name: 'Spotify', amount: 119 }, { name: 'Cult.fit', amount: 832 },
]
export const recommendations = [ // GET /recommendations
  { id: 'r1', icon: 'food', title: 'Reduce Junk Food spending', text: 'You spent ₹4,200 on food delivery this month. Cutting it by 30% is a realistic first step.', impact: 1260, action: 'Try What-If', to: '/simulator' },
  { id: 'r2', icon: 'repeat', title: 'Review Subscriptions', text: 'You have 4 recurring subscriptions costing ₹1,899/month. Cancel any you rarely use.', impact: 1899, action: 'View Transactions', to: '/transactions' },
  { id: 'r3', icon: 'target', title: 'Set a Shopping Budget', text: 'Your shopping spending has increased for two consecutive months.', impact: 1400, action: 'Set Budget', to: null },
]
export const healthScore = [ // GET /insights/health
  { label: 'Savings', score: 85, note: '35% of income saved' },
  { label: 'Spending Control', score: 72, note: 'Food & shopping above average' },
  { label: 'Budget Adherence', score: 76, note: '3 of 4 budgets on track' },
  { label: 'Recurring Expenses', score: 79, note: 'Subscriptions are manageable' },
]
export const whatIfDefaults = [ // dashboard preview
  { key: 'junk', label: 'Junk Food', current: 4200, reduction: 30 },
  { key: 'shopping', label: 'Shopping', current: 6100, reduction: 15 },
  { key: 'travel', label: 'Travel', current: 4300, reduction: 10 },
]
