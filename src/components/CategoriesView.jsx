import { useState } from 'react'
import { useAnimatedSlider } from '../hooks/useAnimatedSlider'

export default function CategoriesView({
  newCategoryName, setNewCategoryName,
  newCategoryType, setNewCategoryType,
  newCategoryIcon, setNewCategoryIcon,
  showIcons, setShowIcons,
  closingIcons,
  categoryMessage,
  customCategories,
  addCategory,
  deleteCategory,
  closeIconsModal,
  loading,
}) {
  const { ref: toggleRef, sliderStyle: toggleSliderStyle } =
    useAnimatedSlider(newCategoryType, ['income', 'expense'])
  const [pendingDelete, setPendingDelete] = useState(null)

  const getSliderColors = () => {
    if (newCategoryType === "income") {
      return { bg: "var(--success)", shadow: "rgba(16, 185, 129, 0.3)" }
    }
    return { bg: "var(--danger)", shadow: "rgba(239, 68, 68, 0.3)" }
  }

  const colors = getSliderColors()

  if (loading) {
    return (
      <div className="categories-view">
        <div className="form-card">
          <div className="skeleton skeleton-line skeleton-mb-16" />
          <div className="skeleton skeleton-line long skeleton-mb-12" />
          <div className="skeleton skeleton-line skeleton-mb-12" />
          <div className="skeleton skeleton-line short skeleton-mb-24" />
          <div className="skeleton skeleton-card" />
        </div>
        <div className="categories-list">
          <div className="categories-section">
            <div className="skeleton skeleton-line short skeleton-mb-12" />
            <div className="skeleton skeleton-list-item" />
            <div className="skeleton skeleton-list-item" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="categories-view">
      <div className="form-card">
        <h2 className="form-title">Agregar Categoría</h2>

        {categoryMessage && (
          <div className="success-message">{categoryMessage}</div>
        )}

        <div className="form-group">
            <label>Tipo de categoría</label>
                    <div className="category-type-toggle" ref={toggleRef}>
          <div
            className="toggle-slider"
            style={{
              ...toggleSliderStyle,
              background: colors.bg,
              boxShadow: `0 2px 8px ${colors.shadow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          />
          
          <button
            className={`toggle-btn income ${newCategoryType === "income" ? "active" : ""}`}
            onClick={() => setNewCategoryType("income")}
          >
            Ingreso
          </button>
          <button
            className={`toggle-btn expense ${newCategoryType === "expense" ? "active" : ""}`}
            onClick={() => setNewCategoryType("expense")}
          >
            Gasto
          </button>
        </div>
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
          <button type="button" className="icon-picker-btn" onClick={() => setShowIcons(true)}>
            <span className="icon-picker-emoji">{newCategoryIcon}</span>
            <span className="icon-picker-text">Seleccionar</span>
          </button>

          {showIcons && (
            <div className={`icon-modal-overlay ${closingIcons ? "fade-out" : ""}`} onClick={closeIconsModal}>
              <div className={`icon-modal-content ${closingIcons ? "slide-down" : ""}`} onClick={(e) => e.stopPropagation()}>
                <div className="icon-modal-header">
                  <span className="icon-modal-title">Seleccionar icono</span>
                  <button type="button" className="icon-modal-close" onClick={closeIconsModal}>&times;</button>
                </div>
                <div className="icon-selector">
                  {[
                    "💵", "💰", "🏦", "📈", "📊", "🛒", "🏠", "🚗",
                    "⛽", "🚌", "🚇", "✈️", "💊", "🏥", "👨‍⚕️",
                    "🎬", "🎮", "🎁", "🎒", "👕", "👟", "💄", "💇",
                    "🐕", "🐱", "👶", "🎓", "📚", "✏️", "🏨", "☕",
                    "🍔", "🍕", "🍺", "🎂", "📱", "💻", "🎧", "📷",
                    "💡", "🔧", "🧹", "🧺", "💳", "📄", "🔒", "🎯",
                    "⭐", "🔥", "💎", "🌈", "❤️", "🙏", "👏", "🎉",
                  ].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${newCategoryIcon === icon ? "selected" : ""}`}
                      onClick={() => {
                        setNewCategoryIcon(icon)
                        closeIconsModal()
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button type="button" className="submit-btn" onClick={addCategory}>
          Guardar
        </button>
      </div>

      <div className="categories-list">
        <div className="categories-section">
          <h3>Categorías de Ingresos</h3>
          <div className="category-tags">
            {(customCategories.income || []).length === 0 ? (
              <p className="empty-categories">No hay categorías. Agrega una arriba.</p>
            ) : (
              (customCategories.income || []).map((cat) => (
                <span key={cat.name} className="category-tag custom">
                  {cat.icon} {cat.name}
                  <button onClick={() => setPendingDelete({ name: cat.name, type: "income" })}>&times;</button>
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
              (customCategories.expense || []).map((cat) => (
                <span key={cat.name} className="category-tag custom">
                  {cat.icon} {cat.name}
                  <button onClick={() => setPendingDelete({ name: cat.name, type: "expense" })}>&times;</button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>

    {pendingDelete && (
      <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">Eliminar categoría</span>
          </div>
          <div className="modal-body">
            <p className="modal-confirm-text">
              ¿Estás seguro que deseas eliminar <strong>{pendingDelete.name}</strong>?
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setPendingDelete(null)}>
              Cancelar
            </button>
            <button className="btn-danger" onClick={() => {
              deleteCategory(pendingDelete.name, pendingDelete.type)
              setPendingDelete(null)
            }}>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
