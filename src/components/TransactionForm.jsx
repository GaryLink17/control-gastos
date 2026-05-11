import { useAnimatedSlider } from '../hooks/useAnimatedSlider'

export default function TransactionForm({
  type, setType,
  description, setDescription,
  amount, setAmount,
  category, setCategory,
  errors, clearFieldError,
  saveError,
  categories,
  handleSubmit,
  lastTransaction,
  getCategoryIcon,
  formatDate, formatAmount,
  setCurrentView,
}) {
  const { ref: toggleRef, sliderStyle: toggleSliderStyle } =
    useAnimatedSlider(type, ['income', 'expense', 'saving'])

  const getSliderColors = () => {
    switch (type) {
      case "income":
        return { bg: "var(--success)", shadow: "rgba(16, 185, 129, 0.3)" }
      case "expense":
        return { bg: "var(--danger)", shadow: "rgba(239, 68, 68, 0.3)" }
      case "saving":
        return { bg: "#F59E0B", shadow: "rgba(245, 158, 11, 0.3)" }
      default:
        return { bg: "var(--success)", shadow: "rgba(16, 185, 129, 0.3)" }
    }
  }

  const colors = getSliderColors()

  return (
    <div className="form-card">
      <h2 className="form-title">Agregar Transacción</h2>
      {saveError && (
        <div className="error-message">{saveError}</div>
      )}
      <div className="toggle-container" ref={toggleRef}>
        <div
          className="toggle-slider"
          style={{
            ...toggleSliderStyle,
            background: colors.bg,
            boxShadow: `0 2px 8px ${colors.shadow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
        />
        <button
          className={`toggle-btn income ${type === "income" ? "active" : ""}`}
          onClick={() => { setType("income"); setCategory(""); }}
        >
          Ingreso
        </button>
        <button
          className={`toggle-btn expense ${type === "expense" ? "active" : ""}`}
          onClick={() => { setType("expense"); setCategory(""); }}
        >
          Gasto
        </button>
        <button
          className={`toggle-btn saving ${type === "saving" ? "active" : ""}`}
          onClick={() => { setType("saving"); setCategory(""); }}
        >
          Ahorro
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Descripción</label>
          <input
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearFieldError("description");
            }}
            placeholder="(Opcional)"
            className={errors.description ? "error" : ""}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Monto</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                clearFieldError("amount");
              }}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={errors.amount ? "error" : ""}
            />
          </div>
          {type !== "saving" && (
            <div className="form-group">
              <label>Categoría</label>
              <div className="select-with-btn">
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === "__add__") {
                      setCurrentView("categories");
                    } else {
                      setCategory(e.target.value);
                      clearFieldError("category");
                    }
                  }}
                  className={errors.category ? "error" : ""}
                >
                  <option value="">Seleccionar</option>
                  {categories.length === 0 ? (
                    <option value="__add__" disabled>
                      Agrega una categoría
                    </option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
                {/* <button
                  type="button"
                  className="add-category-btn-inline"
                  onClick={() => setCurrentView("categories")}
                >
                  +
                </button> */}
              </div>
            </div>
          )}
        </div>

        {(errors.amount || errors.category) && (
          <p className="error-message">
            {categories.length === 0
              ? "Por favor, agregue una categoría en la pestaña Categorías"
              : "Por favor, complete el monto y seleccione una categoría"}
          </p>
        )}
        <button type="submit" className="submit-btn">
          Agregar{" "}
          {type === "income" ? "Ingreso" : type === "expense" ? "Gasto" : "Ahorro"}
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
              <div className="transaction-description">
                {lastTransaction.description || "Sin descripción"}
              </div>
              <div className="transaction-category">{lastTransaction.category}</div>
            </div>
            <div className="transaction-right">
              <div className={`transaction-amount ${lastTransaction.type}`}>
                {lastTransaction.type === "expense" ? "-" : "+"}$
                {formatAmount(lastTransaction.amount)}
              </div>
              <div className="transaction-date">{formatDate(lastTransaction.date)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
