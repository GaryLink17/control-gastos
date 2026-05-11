import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useTransactions({ userId, customCategories }) {
  const [transactions, setTransactions] = useState([])
  const [type, setType] = useState('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [errors, setErrors] = useState({ description: false, amount: false, category: false })
  const [filterDate, setFilterDate] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [lastTransaction, setLastTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (!userId) return

    const loadTransactions = async () => {
      setLoading(true)
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (transactionsData) {
        setTransactions(transactionsData)
        if (transactionsData.length > 0) setLastTransaction(transactionsData[0])
      }
      setLoading(false)
    }

    loadTransactions()
  }, [userId])

  const allIncomeCategories = useMemo(
    () => (customCategories.income || []).map((c) => c.name),
    [customCategories.income],
  )

  const allExpenseCategories = useMemo(
    () => (customCategories.expense || []).map((c) => c.name),
    [customCategories.expense],
  )

  const lastIncomeTx = useMemo(() => {
    if (transactions.length === 0) return null
    const incomeTxs = transactions.filter((t) => t.type === 'income')
    if (incomeTxs.length === 0) return null
    return incomeTxs.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  }, [transactions])

  const cycleStartTime = useMemo(
    () => (lastIncomeTx ? new Date(lastIncomeTx.date).getTime() : null),
    [lastIncomeTx],
  )

  const cycleTransactions = useMemo(
    () => (cycleStartTime
      ? transactions.filter((t) => new Date(t.date).getTime() >= cycleStartTime)
      : []
    ),
    [cycleStartTime, transactions],
  )

  const cycleIncome = useMemo(
    () => (lastIncomeTx ? lastIncomeTx.amount : 0),
    [lastIncomeTx],
  )

  const cycleExpenses = useMemo(
    () => cycleTransactions
      .filter((t) => t.type === 'expense' && typeof t.amount === 'number')
      .reduce((sum, t) => sum + t.amount, 0),
    [cycleTransactions],
  )

  const cycleSavings = useMemo(
    () => cycleTransactions
      .filter((t) => t.type === 'saving' && typeof t.amount === 'number')
      .reduce((sum, t) => sum + t.amount, 0),
    [cycleTransactions],
  )

  const totalSavings = useMemo(
    () => transactions
      .filter((t) => t.type === 'saving' && typeof t.amount === 'number')
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  )

  const balance = useMemo(
    () => cycleIncome - cycleExpenses,
    [cycleIncome, cycleExpenses],
  )

  const clearFieldError = useCallback((field) => {
    setErrors((prev) => ({ ...prev, [field]: false }))
  }, [])

  const categories = useMemo(
    () => (type === 'income' ? allIncomeCategories : allExpenseCategories),
    [type, allIncomeCategories, allExpenseCategories],
  )

  const getCategoryIcon = useCallback((catName, transactionType) => {
    try {
      const catType = transactionType === 'income' ? 'income' : 'expense'
      const customCat = (customCategories[catType] || []).find((c) => c.name === catName)
      return customCat
        ? customCat.icon
        : transactionType === 'income'
          ? '💵'
          : '📦'
    } catch {
      return '📦'
    }
  }, [customCategories])

  const filteredTransactions = useMemo(
    () => transactions.filter((t) => {
      if (!t.date) return false
      const transactionDate = new Date(t.date)
      if (isNaN(transactionDate.getTime())) return false

      if (filterDate) {
        const filterDateObj = new Date(filterDate + 'T00:00:00')
        return (
          transactionDate.getFullYear() === filterDateObj.getFullYear() &&
          transactionDate.getMonth() === filterDateObj.getMonth() &&
          transactionDate.getDate() === filterDateObj.getDate()
        )
      }

      if (filterMonth) {
        const [year, month] = filterMonth.split('-')
        return (
          transactionDate.getFullYear() === parseInt(year, 10) &&
          transactionDate.getMonth() + 1 === parseInt(month, 10)
        )
      }

      return true
    }),
    [transactions, filterDate, filterMonth],
  )

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    const newErrors = {
      description: false,
      amount: !amount || parseFloat(amount) <= 0,
      category: type !== 'saving' && !category,
    }

    setErrors(newErrors)

    if (newErrors.amount || newErrors.category) return

    const newTransaction = {
      id: Date.now().toString(),
      user_id: userId,
      type,
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
    }

    try {
      const { data: inserted, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select()
        .single()

      if (error) {
        setSaveError('No se pudo guardar. Intenta de nuevo.')
        return
      }

      setSaveError(null)
      const realTransaction = inserted || newTransaction
      setTransactions(prev => [realTransaction, ...prev])
      setLastTransaction(realTransaction)
    } catch (err) {
      setSaveError('No se pudo guardar. Intenta de nuevo.')
    }

    setDescription('')
    setAmount('')
    setCategory('')
    setErrors({ description: false, amount: false, category: false })
  }, [userId, type, description, amount, category])

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }, [])

  const formatAmount = useCallback((amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0.00'
    return amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })
  }, [])

  return {
    transactions, setTransactions,
    hasIncome: lastIncomeTx !== null,
    saveError,
    type, setType,
    description, setDescription,
    amount, setAmount,
    category, setCategory,
    errors, setErrors,
    filterDate, setFilterDate,
    filterMonth, setFilterMonth,
    lastTransaction,
    categories,
    cycleIncome,
    cycleExpenses,
    cycleSavings,
    totalSavings,
    balance,
    filteredTransactions,
    loading,
    getCategoryIcon,
    handleSubmit,
    clearFieldError,
    formatDate,
    formatAmount,
  }
}
