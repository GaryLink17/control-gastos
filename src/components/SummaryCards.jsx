export default function SummaryCards({ balance, totalSavings, cycleExpenses, formatAmount, loading, hasIncome }) {
  return (
    <div className="summary-cards">
      {!loading && !hasIncome && (
        <div className="summary-guide">
          Registra tu primer ingreso para ver tu balance
        </div>
      )}
      {loading ? (
        <>
          <div className="card"><div className="skeleton skeleton-card" /></div>
          <div className="card"><div className="skeleton skeleton-card" /></div>
          <div className="card"><div className="skeleton skeleton-card" /></div>
        </>
      ) : (
        <>
          <div className="card">
            <div className="card-icon balance">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M12 10v4M10 12h4" />
              </svg>
            </div>
            <div className="card-label">Balance</div>
            <div className="card-amount balance">${formatAmount(balance)}</div>
          </div>
          <div className="card">
            <div className="card-icon saving">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14v-4m0 0V8m0 4H8m4 0h4" />
              </svg>
            </div>
            <div className="card-label">Ahorro</div>
            <div className="card-amount saving">${formatAmount(totalSavings)}</div>
          </div>
          <div className="card">
            <div className="card-icon expense">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
            <div className="card-label">Gastos</div>
            <div className="card-amount expense">${formatAmount(cycleExpenses)}</div>
          </div>
        </>
      )}
    </div>
  )
}
