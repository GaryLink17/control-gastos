import { useState, useEffect } from 'react'

const ICONS = {
  'Otro-Ingreso': '💵',
  'Otro-Gasto': '📦'
}

function App() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('expenses')
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('customCategories')
      const parsed = saved ? JSON.parse(saved) : null
      if (parsed && typeof parsed === 'object' && parsed.expense !== undefined) {
        return {
          income: Array.isArray(parsed.income) ? parsed.income : [],
          expense: Array.isArray(parsed.expense) ? parsed.expense : []
        }
      }
      return { income: [], expense: [] }
    } catch {
      return { income: [], expense: [] }
    }
  })
  const [type, setType] = useState('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [errors, setErrors] = useState({ description: false, amount: false, category: false })
  const [filterDate, setFilterDate] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [currentView, setCurrentView] = useState('register')
  const [lastTransaction, setLastTransaction] = useState(() => {
    try {
      const saved = localStorage.getItem('lastTransaction')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryType, setNewCategoryType] = useState('expense')
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦')
  const [categoryMessage, setCategoryMessage] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const saveToLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('Error saving to localStorage:', e)
    }
  }

  useEffect(() => {
    saveToLocalStorage('expenses', transactions)
  }, [transactions])

  useEffect(() => {
    saveToLocalStorage('customCategories', customCategories)
  }, [customCategories])

  useEffect(() => {
    saveToLocalStorage('lastTransaction', lastTransaction)
  }, [lastTransaction])

  const allIncomeCategories = (customCategories.income || []).map(c => c.name)
  const allExpenseCategories = (customCategories.expense || []).map(c => c.name)

  const addCategory = () => {
    if (!newCategoryName.trim()) return
    
    const icon = newCategoryIcon || '📦'
    const newCat = { name: newCategoryName.trim(), icon }
    
    if (newCategoryType === 'income') {
      setCustomCategories(prev => ({
        ...prev,
        income: [...(prev.income || []), newCat]
      }))
    } else {
      setCustomCategories(prev => ({
        ...prev,
        expense: [...(prev.expense || []), newCat]
      }))
    }
    
    setCategoryMessage(`Categoría "${newCategoryName.trim()}" creada exitosamente`)
    setTimeout(() => setCategoryMessage(''), 3000)
    setNewCategoryName('')
    setNewCategoryIcon('📦')
  }

  const deleteCategory = (catName, catType) => {
    if (catType === 'income') {
      setCustomCategories(prev => ({
        ...prev,
        income: (prev.income || []).filter(c => c.name !== catName)
      }))
    } else {
      setCustomCategories(prev => ({
        ...prev,
        expense: (prev.expense || []).filter(c => c.name !== catName)
      }))
    }
  }

  const income = transactions
    .filter(t => t.type === 'income' && typeof t.amount === 'number')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const expenses = transactions
    .filter(t => t.type === 'expense' && typeof t.amount === 'number')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const balance = income - expenses

  const categories = type === 'income' ? allIncomeCategories : allExpenseCategories

  const getCategoryIcon = (catName, transactionType) => {
    try {
      const catType = transactionType === 'income' ? 'income' : 'expense'
      const customCat = (customCategories[catType] || []).find(c => c.name === catName)
      return customCat ? customCat.icon : (transactionType === 'income' ? '💵' : '📦')
    } catch {
      return '📦'
    }
  }

  const expensesByCategory = allExpenseCategories.map(cat => {
    const catTransactions = transactions.filter(t => t.type === 'expense' && t.category === cat && typeof t.amount === 'number')
    const total = catTransactions.reduce((sum, t) => sum + t.amount, 0)
    return { category: cat, total, icon: getCategoryIcon(cat, 'expense'), isCustom: (customCategories.expense || []).some(c => c.name === cat) }
  }).sort((a, b) => b.total - a.total)

  const incomeByCategory = allIncomeCategories.map(cat => {
    const catTransactions = transactions.filter(t => t.type === 'income' && t.category === cat && typeof t.amount === 'number')
    const total = catTransactions.reduce((sum, t) => sum + t.amount, 0)
    return { category: cat, total, icon: getCategoryIcon(cat, 'income'), isCustom: (customCategories.income || []).some(c => c.name === cat) }
  }).sort((a, b) => b.total - a.total)

  const filteredTransactions = transactions.filter(t => {
    if (!t.date) return false
    const transactionDate = new Date(t.date)
    if (isNaN(transactionDate.getTime())) return false
    
    if (filterDate) {
      const filterDateObj = new Date(filterDate + 'T00:00:00')
      return transactionDate.getFullYear() === filterDateObj.getFullYear() &&
             transactionDate.getMonth() === filterDateObj.getMonth() &&
             transactionDate.getDate() === filterDateObj.getDate()
    }
    
    if (filterMonth) {
      const [year, month] = filterMonth.split('-')
      return transactionDate.getFullYear() === parseInt(year) && 
             (transactionDate.getMonth() + 1) === parseInt(month)
    }
    
    return true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = {
      description: false,
      amount: !amount || parseFloat(amount) <= 0,
      category: !category
    }
    
    setErrors(newErrors)
    
    if (newErrors.amount || newErrors.category) {
      return
    }

    const newTransaction = {
      id: Date.now().toString(),
      type,
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString()
    }

    setTransactions([newTransaction, ...transactions])
    setLastTransaction(newTransaction)
    setDescription('')
    setAmount('')
    setCategory('')
    setErrors({ description: false, amount: false, category: false })
  }

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id))
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatAmount = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0.00'
    return amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })
  }

  return (
    <div className="app">
      <header className="header">
        <h1>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          Control de Gastos
        </h1>
      </header>

      <nav className="nav-menu">
        <button 
          className={`nav-btn ${currentView === 'register' ? 'active' : ''}`}
          onClick={() => setCurrentView('register')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Registro
        </button>
        <button 
          className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentView('history')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Historial
        </button>
        <button 
          className={`nav-btn ${currentView === 'categories' ? 'active' : ''}`}
          onClick={() => setCurrentView('categories')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
          Categorías
        </button>
      </nav>

      <div className="summary-cards">
        <div className="card">
          <div className="card-icon balance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M12 10v4M10 12h4"/>
            </svg>
          </div>
          <div className="card-label">Balance</div>
          <div className="card-amount balance">${formatAmount(balance)}</div>
        </div>
        <div className="card">
          <div className="card-icon income">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </div>
          <div className="card-label">Ingresos</div>
          <div className="card-amount income">${formatAmount(income)}</div>
        </div>
        <div className="card">
          <div className="card-icon expense">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
          <div className="card-label">Gastos</div>
          <div className="card-amount expense">${formatAmount(expenses)}</div>
        </div>
      </div>

      <main className="main">
        {currentView === 'register' && (
          <div className="form-card">
            <h2 className="form-title">Agregar Transacción</h2>
            <div className="toggle-container">
              <button 
                className={`toggle-btn income ${type === 'income' ? 'active' : ''}`}
                onClick={() => { setType('income'); setCategory('') }}
              >
                Ingreso
              </button>
              <button 
                className={`toggle-btn expense ${type === 'expense' ? 'active' : ''}`}
                onClick={() => { setType('expense'); setCategory('') }}
              >
                Gasto
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Descripción</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: false })) }}
                  placeholder="(Opcional)"
                  className={errors.description ? 'error' : ''}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Monto</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setErrors(prev => ({ ...prev, amount: false })) }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={errors.amount ? 'error' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <div className="select-with-btn">
                    <select value={category} onChange={(e) => { 
                      if (e.target.value === '__add__') {
                        setCurrentView('categories')
                      } else {
                        setCategory(e.target.value); setErrors(prev => ({ ...prev, category: false }))
                      }
                    }} className={errors.category ? 'error' : ''}>
                      <option value="">Seleccionar</option>
                      {categories.length === 0 ? (
                        <option value="__add__" disabled>Agrega una categoría</option>
                      ) : (
                        categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))
                      )}
                    </select>
                    <button type="button" className="add-category-btn-inline" onClick={() => setCurrentView('categories')}>
                      +
                    </button>
                  </div>
                </div>
              </div>
              {(errors.amount || errors.category) && (
                <p className="error-message">
                  {categories.length === 0 
                    ? 'Por favor, agregue una categoría en la pestaña Categorías' 
                    : 'Por favor, complete el monto y seleccione una categoría'}
                </p>
              )}
              <button type="submit" className="submit-btn">
                Agregar {type === 'income' ? 'Ingreso' : 'Gasto'}
              </button>
            </form>
            {lastTransaction && (
              <div className="last-transaction">
                <h3>Último registro</h3>
                <div className="transaction-item">
                  <div className={`transaction-icon ${lastTransaction.type}`}>
                    <span>{getCategoryIcon(lastTransaction.category, lastTransaction.type)}</span>
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-description">{lastTransaction.description || 'Sin descripción'}</div>
                    <div className="transaction-category">{lastTransaction.category}</div>
                  </div>
                  <div className="transaction-right">
                    <div className={`transaction-amount ${lastTransaction.type}`}>
                      {lastTransaction.type === 'income' ? '+' : '-'}${formatAmount(lastTransaction.amount)}
                    </div>
                    <div className="transaction-date">{formatDate(lastTransaction.date)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'history' && (
          <div className="history-card">
            <h2 className="history-title">Historial</h2>
            <div className="filter-container">
              <div className="filter-group">
                <label>Filtrar por día</label>
                <input
                  type="date"
                  value={filterDate}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  onChange={(e) => { setFilterDate(e.target.value); setFilterMonth('') }}
                />
              </div>
              <div className="filter-group">
                <label>Filtrar por mes</label>
                <input
                  type="month"
                  value={filterMonth}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  onChange={(e) => { setFilterMonth(e.target.value); setFilterDate('') }}
                />
              </div>
            </div>
            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p>{filterDate || filterMonth ? 'No hay transacciones en esta fecha' : 'No hay transacciones aún'}</p>
              </div>
            ) : (
              <div className="history-list">
                {filteredTransactions.map(t => (
                  <div key={t.id} className="transaction-item" onClick={() => setSelectedTransaction(t)}>
                    <div className={`transaction-icon ${t.type}`}>
                      <span>{getCategoryIcon(t.category, t.type)}</span>
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-description">{t.description}</div>
                      <div className="transaction-category">{t.category}</div>
                    </div>
                    <div className="transaction-right">
                      <div className={`transaction-amount ${t.type}`}>
                        {t.type === 'income' ? '+' : '-'}${formatAmount(t.amount)}
                      </div>
                      <div className="transaction-date">{formatDate(t.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'categories' && (
          <div className="categories-view">
            <div className="form-card">
              <h2 className="form-title">Agregar Categoría</h2>
              
              {categoryMessage && (
                <div className="success-message">{categoryMessage}</div>
              )}
              
              <div className="category-type-toggle">
                <button 
                  className={`toggle-btn income ${newCategoryType === 'income' ? 'active' : ''}`}
                  onClick={() => setNewCategoryType('income')}
                >
                  Ingreso
                </button>
                <button 
                  className={`toggle-btn expense ${newCategoryType === 'expense' ? 'active' : ''}`}
                  onClick={() => setNewCategoryType('expense')}
                >
                  Gasto
                </button>
              </div>

              <div className="form-group">
                <label>Nombre de la categoría</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: Supermercado"
                />
              </div>

              <div className="form-group">
                <label>Icono</label>
                <div className="icon-selector">
                  {['📦', '💰', '🛒', '🏠', '🚗', '💊', '🎬', '📄', '✈️', '🎮', '👕', '💡', '📱', '🎁', '🏥', '📚'].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${newCategoryIcon === icon ? 'selected' : ''}`}
                      onClick={() => setNewCategoryIcon(icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" className="submit-btn" onClick={addCategory}>
                Guardar Categoría
              </button>
            </div>

            <div className="categories-list">
              <div className="categories-section">
                <h3>Categorías de Ingresos</h3>
                <div className="category-tags">
                  {(customCategories.income || []).length === 0 ? (
                    <p className="empty-categories">No hay categorías. Agrega una arriba.</p>
                  ) : (
                    (customCategories.income || []).map(cat => (
                      <span key={cat.name} className="category-tag custom">
                        {cat.icon} {cat.name}
                        <button onClick={() => deleteCategory(cat.name, 'income')}>&times;</button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="categories-section">
                <h3>Categorías de Gastos</h3>
                <div className="category-tags">
                  {(customCategories.expense || []).length === 0 ? (
                    <p className="empty-categories">No hay categorías. Agrega una arriba.</p>
                  ) : (
                    (customCategories.expense || []).map(cat => (
                      <span key={cat.name} className="category-tag custom">
                        {cat.icon} {cat.name}
                        <button onClick={() => deleteCategory(cat.name, 'expense')}>&times;</button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedTransaction && (
        <div className="modal-overlay" onClick={() => setSelectedTransaction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className={`modal-type ${selectedTransaction.type}`}>
                {selectedTransaction.type === 'income' ? 'Ingreso' : 'Gasto'}
              </span>
              <button className="modal-close" onClick={() => setSelectedTransaction(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-icon">
                {getCategoryIcon(selectedTransaction.category, selectedTransaction.type)}
              </div>
              <div className="modal-amount">
                {selectedTransaction.type === 'income' ? '+' : '-'}${formatAmount(selectedTransaction.amount)}
              </div>
              <div className="modal-detail">
                <span className="modal-label">Categoría</span>
                <span className="modal-value">{selectedTransaction.category}</span>
              </div>
              {selectedTransaction.description && (
                <div className="modal-detail">
                  <span className="modal-label">Descripción</span>
                  <span className="modal-value">{selectedTransaction.description}</span>
                </div>
              )}
              <div className="modal-detail">
                <span className="modal-label">Fecha</span>
                <span className="modal-value">{formatDate(selectedTransaction.date)}</span>
              </div>
              <div className="modal-detail">
                <span className="modal-label">Hora</span>
                <span className="modal-value">
                  {new Date(selectedTransaction.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
