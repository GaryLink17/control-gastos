export default function TransactionModal({
  selectedTransaction,
  closingTransaction,
  closeTransactionModal,
  getCategoryIcon,
  formatDate,
  formatAmount,
}) {
  if (!selectedTransaction) return null;

  return (
    <div
      className={`modal-overlay ${closingTransaction ? "fade-out" : ""}`}
      onClick={closeTransactionModal}
    >
      <div
        className={`modal-content ${closingTransaction ? "slide-down" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className={`modal-type ${selectedTransaction.type}`}>
            {selectedTransaction.type === "income" ? "Ingreso" : selectedTransaction.type === "saving" ? "Ahorro" : "Gasto"}
          </span>
          <button className="modal-close" onClick={closeTransactionModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-icon">
            {getCategoryIcon(selectedTransaction.category, selectedTransaction.type)}
          </div>
          <div className="modal-amount">
            {selectedTransaction.type === "expense" ? "-" : "+"}$
            {formatAmount(selectedTransaction.amount)}
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
              {new Date(selectedTransaction.date).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
