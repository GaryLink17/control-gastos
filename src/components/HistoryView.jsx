import { useState } from "react"

const PAGE_SIZE = 20

export default function HistoryView({
  filterDate, setFilterDate,
  filterMonth, setFilterMonth,
  filteredTransactions,
  getCategoryIcon,
  formatDate, formatAmount,
  setSelectedTransaction,
  loading,
}) {
  const [page, setPage] = useState(1)

  const handleFilterDateChange = (e) => {
    setFilterDate(e.target.value)
    setFilterMonth("")
    setPage(1)
  }

  const handleFilterMonthChange = (e) => {
    setFilterMonth(e.target.value)
    setFilterDate("")
    setPage(1)
  }

  const displayedTransactions = filteredTransactions.slice(0, page * PAGE_SIZE)
  const hasMore = displayedTransactions.length < filteredTransactions.length

  return (
    <div className="history-card">
      <h2 className="history-title">Historial</h2>
      <div className="filter-container">
        <div className="filter-group">
          <label>Filtrar por día</label>
          <input
            type="date"
            value={filterDate}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            onChange={handleFilterDateChange}
          />
        </div>
        <div className="filter-group">
          <label>Filtrar por mes</label>
          <input
            type="month"
            value={filterMonth}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            onChange={handleFilterMonthChange}
          />
        </div>
        <button
          className="clear-filter-btn"
          disabled={!filterDate && !filterMonth}
          onClick={() => {
            setFilterDate('')
            setFilterMonth('')
            setPage(1)
          }}
        >
          Limpiar filtros
        </button>
      </div>
      {loading ? (
        <div className="history-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton skeleton-list-item" />
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>
            {filterDate || filterMonth
              ? "No hay transacciones en esta fecha"
              : "No hay transacciones aún"}
          </p>
        </div>
      ) : (
        <div className="history-list">
          {displayedTransactions.map((t) => (
            <div
              key={t.id}
              className="transaction-item"
              onClick={() => setSelectedTransaction(t)}
            >
              <div className={`transaction-icon ${t.type}`}>
                <span>{getCategoryIcon(t.category, t.type)}</span>
              </div>
              <div className="transaction-details">
                <div className="transaction-description">{t.description}</div>
                <div className="transaction-category">{t.category}</div>
              </div>
              <div className="transaction-right">
                <div className={`transaction-amount ${t.type}`}>
                  {t.type === "expense" ? "-" : "+"}$
                  {formatAmount(t.amount)}
                </div>
                <div className="transaction-date">{formatDate(t.date)}</div>
              </div>
            </div>
          ))}
          {hasMore && (
            <button className="load-more-btn" onClick={() => setPage((p) => p + 1)}>
              Mostrar más ({filteredTransactions.length - displayedTransactions.length} restantes)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
