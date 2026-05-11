export default function TodosView({
  todos,
  newTodoTitle, setNewTodoTitle,
  addTodo,
  toggleTodo,
  deleteTodo,
  getCategoryIconByName,
  formatDate,
  loading,
}) {
  return (
    <div className="form-card">
      <h2 className="form-title">Pendientes</h2>

      <div className="form-group">
        <label>Nueva tarea</label>
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Ej: Pagar servicios"
        />
      </div>

      <button type="button" className="submit-btn" onClick={addTodo}>
        Agregar Tarea
      </button>

      <div className="todos-list-container">
        {loading ? (
          <div className="history-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton skeleton-list-item" />
            ))}
          </div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <p>No hay tareas</p>
          </div>
        ) : (
          <div className="history-list">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`transaction-item ${todo.completed ? "completed" : ""}`}
              >
                <div
                  className={`transaction-icon ${todo.completed ? "income" : "expense"} todo-toggle`}
                  onClick={() => toggleTodo(todo)}
                >
                  <span>{todo.completed ? "✅" : "⬜"}</span>
                </div>
                <div className="transaction-details">
                  <div
                    className={`transaction-description ${todo.completed ? "completed" : ""}`}
                  >
                    {todo.title}
                  </div>
                  {todo.category && (
                    <div className="transaction-category">
                      {getCategoryIconByName(todo.category)} {todo.category}
                    </div>
                  )}
                </div>
                <div className="transaction-right">
                  <button
                    className="todo-delete-btn"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    &#128465;
                  </button>
                  <div className="transaction-date">{formatDate(todo.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
