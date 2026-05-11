import { useState, useEffect } from 'react'

export function useAppState() {
  const [currentView, setCurrentView] = useState('register')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [closingTransaction, setClosingTransaction] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const closeTransactionModal = () => {
    setClosingTransaction(true)
    setTimeout(() => {
      setSelectedTransaction(null)
      setClosingTransaction(false)
    }, 200)
  }

  return {
    currentView, setCurrentView,
    selectedTransaction, setSelectedTransaction,
    closingTransaction, setClosingTransaction,
    closeTransactionModal,
    darkMode, setDarkMode,
  }
}
