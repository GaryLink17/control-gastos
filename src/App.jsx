import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import { supabase } from "./supabaseClient";

const ICONS = {
  "Otro-Ingreso": "💵",
  "Otro-Gasto": "📦",
};

function App() {
  const [user, setUser] = useState(undefined);
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState({
    income: [],
    expense: [],
  });
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState({
    description: false,
    amount: false,
    category: false,
  });
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [currentView, setCurrentView] = useState("register");
  const [lastTransaction, setLastTransaction] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("expense");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📦");
  const [categoryMessage, setCategoryMessage] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoCategory, setNewTodoCategory] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    setUser(savedUser ? JSON.parse(savedUser) : null);
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const { data: transactionsData } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        if (transactionsData) {
          setTransactions(transactionsData);
          if (transactionsData.length > 0) {
            setLastTransaction(transactionsData[0]);
          }
        }

        const { data: categoriesData } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id);

        if (categoriesData) {
          const income = categoriesData
            .filter((c) => c.type === "income")
            .map((c) => ({ name: c.name, icon: c.icon }));
          const expense = categoriesData
            .filter((c) => c.type === "expense")
            .map((c) => ({ name: c.name, icon: c.icon }));
          setCustomCategories({ income, expense });
        }

        // Carga los datos de la tabla "todos" para el usuario actual
        const { data: todosData } = await supabase
          .from("todos")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (todosData) setTodos(todosData);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadData();
  }, [user]);

  const allIncomeCategories = (customCategories.income || []).map(
    (c) => c.name,
  );
  const allExpenseCategories = (customCategories.expense || []).map(
    (c) => c.name,
  );

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;

    const icon = newCategoryIcon || "📦";
    const newCat = { name: newCategoryName.trim(), icon };

    try {
      await supabase.from("categories").insert([
        {
          user_id: user.id,
          name: newCat.name,
          icon: newCat.icon,
          type: newCategoryType,
        },
      ]);
    } catch (err) {
      console.error("Error saving category:", err);
    }

    if (newCategoryType === "income") {
      setCustomCategories((prev) => ({
        ...prev,
        income: [...(prev.income || []), newCat],
      }));
    } else {
      setCustomCategories((prev) => ({
        ...prev,
        expense: [...(prev.expense || []), newCat],
      }));
    }

    setCategoryMessage(
      `Categoría "${newCategoryName.trim()}" creada exitosamente`,
    );
    setTimeout(() => setCategoryMessage(""), 3000);
    setNewCategoryName("");
    setNewCategoryIcon("📦");
  };

  const deleteCategory = async (catName, catType) => {
    try {
      await supabase
        .from("categories")
        .delete()
        .eq("user_id", user.id)
        .eq("name", catName)
        .eq("type", catType);
    } catch (err) {
      console.error("Error deleting category:", err);
    }

    if (catType === "income") {
      setCustomCategories((prev) => ({
        ...prev,
        income: (prev.income || []).filter((c) => c.name !== catName),
      }));
    } else {
      setCustomCategories((prev) => ({
        ...prev,
        expense: (prev.expense || []).filter((c) => c.name !== catName),
      }));
    }
  };

  const addTodo = async () => {
    if (!newTodoTitle.trim()) return;

    const newTodo = {
      user_id: user.id,
      title: newTodoTitle.trim(),
      completed: false,
      category: newTodoCategory || null,
    };

    try {
      const { data: createdTodo, error: insertError } = await supabase
        .from("todos")
        .insert([newTodo])
        .select()
        .limit(1);

      if (insertError) throw insertError;
      if (createdTodo && createdTodo.length > 0)
        setTodos((prev) => [createdTodo[0], ...prev]);
    } catch (err) {
      console.error("Error adding todo:", err);
    }

    setNewTodoTitle("");
    setNewTodoCategory("");
  };

  const toggleTodo = async (todo) => {
    try {
      await supabase
        .from("todos")
        .update({ completed: !todo.completed })
        .eq("id", todo.id);

      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: !t.completed } : t,
        ),
      );
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await supabase.from("todos").delete().eq("id", id);

      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  const getCategoryIconByName = (catName) => {
    const all = [
      ...(customCategories.income || []),
      ...(customCategories.expense || []),
    ];
    const found = all.find((c) => c.name === catName);
    return found ? found.icon : "📋";
  };

  // Calcular ciclos desde el último ingreso
  const lastIncomeTx =
    [...transactions]
      .filter((t) => t.type === "income")
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;

  const cycleStartTime = lastIncomeTx
    ? new Date(lastIncomeTx.date).getTime()
    : null;

  const cycleTransactions = cycleStartTime
    ? transactions.filter((t) => new Date(t.date).getTime() >= cycleStartTime)
    : [];

  const cycleIncome = lastIncomeTx ? lastIncomeTx.amount : 0;

  const cycleExpenses = cycleTransactions
    .filter((t) => t.type === "expense" && typeof t.amount === "number")
    .reduce((sum, t) => sum + t.amount, 0);

  const cycleSavings = cycleTransactions
    .filter((t) => t.type === "saving" && typeof t.amount === "number")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = transactions
    .filter((t) => t.type === "saving" && typeof t.amount === "number")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = cycleIncome - cycleExpenses - cycleSavings;

  const categories =
    type === "income" ? allIncomeCategories : allExpenseCategories;

  const getCategoryIcon = (catName, transactionType) => {
    try {
      const catType = transactionType === "income" ? "income" : "expense";
      const customCat = (customCategories[catType] || []).find(
        (c) => c.name === catName,
      );
      return customCat
        ? customCat.icon
        : transactionType === "income"
          ? "💵"
          : "📦";
    } catch {
      return "📦";
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    const transactionDate = new Date(t.date);
    if (isNaN(transactionDate.getTime())) return false;

    if (filterDate) {
      const filterDateObj = new Date(filterDate + "T00:00:00");
      return (
        transactionDate.getFullYear() === filterDateObj.getFullYear() &&
        transactionDate.getMonth() === filterDateObj.getMonth() &&
        transactionDate.getDate() === filterDateObj.getDate()
      );
    }

    if (filterMonth) {
      const [year, month] = filterMonth.split("-");
      return (
        transactionDate.getFullYear() === parseInt(year) &&
        transactionDate.getMonth() + 1 === parseInt(month)
      );
    }

    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      description: false,
      amount: !amount || parseFloat(amount) <= 0,
      category: type !== "saving" && !category, // Solo requiere categoría si no es ahorro
    };

    setErrors(newErrors);

    if (newErrors.amount || newErrors.category) {
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      user_id: user.id,
      type,
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
    };

    try {
      const { data: inserted, error } = await supabase
        .from("transactions")
        .insert([newTransaction])
        .select()
        .single();

      if (error) throw error;

      const realTransaction = inserted || newTransaction;
      setTransactions([realTransaction, ...transactions]);
      setLastTransaction(realTransaction);
    } catch (err) {
      console.error("Error saving transaction:", err);
      setTransactions([newTransaction, ...transactions]);
      setLastTransaction(newTransaction);
    }

    setDescription("");
    setAmount("");
    setCategory("");
    setErrors({ description: false, amount: false, category: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    if (typeof amount !== "number" || isNaN(amount)) return "0.00";
    return amount.toLocaleString("es-ES", { minimumFractionDigits: 2 });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setTransactions([]);
    setCustomCategories({ income: [], expense: [] });
  };

  if (user === undefined) return null;

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1>Control de Gastos</h1>
          <button className="logout-btn" onClick={handleLogout}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Salir
          </button>
        </div>
        <div className="user-name">{user.username}</div>
      </header>

      <nav className="nav-menu">
        <button
          className={`nav-btn ${currentView === "register" ? "active" : ""}`}
          onClick={() => setCurrentView("register")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Registro
        </button>
        <button
          className={`nav-btn ${currentView === "todos" ? "active" : ""}`}
          onClick={() => setCurrentView("todos")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          Taeras
        </button>
        <button
          className={`nav-btn ${currentView === "history" ? "active" : ""}`}
          onClick={() => setCurrentView("history")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Historial
        </button>
      </nav>

      <div className="summary-cards">
        <div className="card">
          <div className="card-icon balance">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M12 10v4M10 12h4" />
            </svg>
          </div>
          <div className="card-label">Balance</div>
          <div className="card-amount balance">${formatAmount(balance)}</div>
        </div>
        <div className="card">
          <div className="card-icon saving">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14v-4m0 0V8m0 4H8m4 0h4" />
            </svg>
          </div>
          <div className="card-label">Ahorro</div>
          <div className="card-amount saving">
            ${formatAmount(totalSavings)}
          </div>
        </div>
        <div className="card">
          <div className="card-icon expense">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
          <div className="card-label">Gastos</div>
          <div className="card-amount expense">
            ${formatAmount(cycleExpenses)}
          </div>
        </div>
      </div>

      <main className="main">
        {currentView === "register" && (
          <div className="form-card">
            <h2 className="form-title">Agregar Transacción</h2>
            <div className="toggle-container">
              <button
                className={`toggle-btn income ${type === "income" ? "active" : ""}`}
                onClick={() => {
                  setType("income");
                  setCategory("");
                }}
              >
                Ingreso
              </button>
              <button
                className={`toggle-btn expense ${type === "expense" ? "active" : ""}`}
                onClick={() => {
                  setType("expense");
                  setCategory("");
                }}
              >
                Gasto
              </button>
              <button
                className={`toggle-btn ${type === "saving" ? "active" : ""}`}
                onClick={() => {
                  setType("saving");
                  setCategory("");
                }}
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
                    setErrors((prev) => ({ ...prev, description: false }));
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
                      setErrors((prev) => ({ ...prev, amount: false }));
                    }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={errors.amount ? "error" : ""}
                  />
                </div>
                {type !== "saving" && (
                  <div className="form-group">
                    <label>Categoria</label>
                    <div className="select-with-btn">
                      <select
                        value={category}
                        onChange={(e) => {
                          if (e.target.value === "__add__") {
                            setCurrentView("categories");
                          } else {
                            setCategory(e.target.value);
                            setErrors((prev) => ({ ...prev, category: false }));
                          }
                        }}
                        className={errors.category ? "error" : ""}
                      >
                        <option value="">Seleccionar</option>
                        {categories.length === 0 ? (
                          <option value="__add__" disabled>
                            Agrega una categoria
                          </option>
                        ) : (
                          categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))
                        )}
                      </select>
                      <button 
                        type="button"
                        className="add-category-btn-inline"
                        onClick={() => setCurrentView("categories")}
                      >
                        +
                      </button>
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
                {type === "income"
                  ? "Ingreso"
                  : type === "expense"
                    ? "Gasto"
                    : "Ahorro"}
              </button>
            </form>
            {lastTransaction && (
              <div className="last-transaction">
                <h3>Último registro</h3>
                <div className="transaction-item">
                  <div className={`transaction-icon ${lastTransaction.type}`}>
                    <span>
                      {getCategoryIcon(
                        lastTransaction.category,
                        lastTransaction.type,
                      )}
                    </span>
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-description">
                      {lastTransaction.description || "Sin descripción"}
                    </div>
                    <div className="transaction-category">
                      {lastTransaction.category}
                    </div>
                  </div>
                  <div className="transaction-right">
                    <div
                      className={`transaction-amount ${lastTransaction.type}`}
                    >
                      {lastTransaction.type === "income" ? "+" : "-"}$
                      {formatAmount(lastTransaction.amount)}
                    </div>
                    <div className="transaction-date">
                      {formatDate(lastTransaction.date)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === "history" && (
          <div className="history-card">
            <h2 className="history-title">Historial</h2>
            <div className="filter-container">
              <div className="filter-group">
                <label>Filtrar por día</label>
                <input
                  type="date"
                  value={filterDate}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setFilterMonth("");
                  }}
                />
              </div>
              <div className="filter-group">
                <label>Filtrar por mes</label>
                <input
                  type="month"
                  value={filterMonth}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  onChange={(e) => {
                    setFilterMonth(e.target.value);
                    setFilterDate("");
                  }}
                />
              </div>
            </div>
            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
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
                {filteredTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="transaction-item"
                    onClick={() => setSelectedTransaction(t)}
                  >
                    <div className={`transaction-icon ${t.type}`}>
                      <span>{getCategoryIcon(t.category, t.type)}</span>
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-description">
                        {t.description}
                      </div>
                      <div className="transaction-category">{t.category}</div>
                    </div>
                    <div className="transaction-right">
                      <div className={`transaction-amount ${t.type}`}>
                        {t.type === "income" ? "+" : "-"}$
                        {formatAmount(t.amount)}
                      </div>
                      <div className="transaction-date">
                        {formatDate(t.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === "categories" && (
          <div className="categories-view">
            <div className="form-card">
              <h2 className="form-title">Agregar Categoría</h2>

              {categoryMessage && (
                <div className="success-message">{categoryMessage}</div>
              )}

              <div className="category-type-toggle">
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
                  {[
                    "📦",
                    "💰",
                    "🛒",
                    "🏠",
                    "🚗",
                    "💊",
                    "🎬",
                    "📄",
                    "✈️",
                    "🎮",
                    "👕",
                    "💡",
                    "📱",
                    "🎁",
                    "🏥",
                    "📚",
                  ].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${newCategoryIcon === icon ? "selected" : ""}`}
                      onClick={() => setNewCategoryIcon(icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="submit-btn"
                onClick={addCategory}
              >
                Guardar Categoría
              </button>
            </div>

            <div className="categories-list">
              <div className="categories-section">
                <h3>Categorías de Ingresos</h3>
                <div className="category-tags">
                  {(customCategories.income || []).length === 0 ? (
                    <p className="empty-categories">
                      No hay categorías. Agrega una arriba.
                    </p>
                  ) : (
                    (customCategories.income || []).map((cat) => (
                      <span key={cat.name} className="category-tag custom">
                        {cat.icon} {cat.name}
                        <button
                          onClick={() => deleteCategory(cat.name, "income")}
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="categories-section">
                <h3>Categorías de Gastos</h3>
                <div className="category-tags">
                  {(customCategories.expense || []).length === 0 ? (
                    <p className="empty-categories">
                      No hay categorías. Agrega una arriba.
                    </p>
                  ) : (
                    (customCategories.expense || []).map((cat) => (
                      <span key={cat.name} className="category-tag custom">
                        {cat.icon} {cat.name}
                        <button
                          onClick={() => deleteCategory(cat.name, "expense")}
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {currentView === "todos" && (
          <div className="form-card">
            <h2 className="form-title">Tareas</h2>

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

            <div style={{ marginTop: "1.5rem" }}>
              {todos.length === 0 ? (
                <div className="empty-state">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                  <p>No hay tareas aún</p>
                </div>
              ) : (
                <div className="history-list">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="transaction-item"
                      style={{ opacity: todo.completed ? 0.5 : 1 }}
                    >
                      <div
                        className={`transaction-icon ${todo.completed ? "income" : "expense"}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleTodo(todo)}
                      >
                        <span>{todo.completed ? "✅" : "⬜"}</span>
                      </div>
                      <div className="transaction-details">
                        <div
                          className="transaction-description"
                          style={{
                            textDecoration: todo.completed
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {todo.title}
                        </div>
                        {todo.category && (
                          <div className="transaction-category">
                            {getCategoryIconByName(todo.category)}{" "}
                            {todo.category}
                          </div>
                        )}
                      </div>
                      <div className="transaction-right">
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                            color: "#ef4444",
                          }}
                        >
                          🗑️
                        </button>
                        <div className="transaction-date">
                          {formatDate(todo.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedTransaction && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedTransaction(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className={`modal-type ${selectedTransaction.type}`}>
                {selectedTransaction.type === "income" ? "Ingreso" : "Gasto"}
              </span>
              <button
                className="modal-close"
                onClick={() => setSelectedTransaction(null)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-icon">
                {getCategoryIcon(
                  selectedTransaction.category,
                  selectedTransaction.type,
                )}
              </div>
              <div className="modal-amount">
                {selectedTransaction.type === "income" ? "+" : "-"}$
                {formatAmount(selectedTransaction.amount)}
              </div>
              <div className="modal-detail">
                <span className="modal-label">Categoría</span>
                <span className="modal-value">
                  {selectedTransaction.category}
                </span>
              </div>
              {selectedTransaction.description && (
                <div className="modal-detail">
                  <span className="modal-label">Descripción</span>
                  <span className="modal-value">
                    {selectedTransaction.description}
                  </span>
                </div>
              )}
              <div className="modal-detail">
                <span className="modal-label">Fecha</span>
                <span className="modal-value">
                  {formatDate(selectedTransaction.date)}
                </span>
              </div>
              <div className="modal-detail">
                <span className="modal-label">Hora</span>
                <span className="modal-value">
                  {new Date(selectedTransaction.date).toLocaleTimeString(
                    "es-ES",
                    { hour: "2-digit", minute: "2-digit" },
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
