export default function AppHeader({ darkMode, setDarkMode, userEmail, handleLogout }) {
  return (
    <header className="header">
      <div className="header-inner">
        <h1>Control de Gastos</h1>
        <div className="header-actions">
          <button
            className="dark-mode-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
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
      </div>
      <div className="user-name">{userEmail}</div>
    </header>
  )
}
