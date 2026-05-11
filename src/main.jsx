import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/variables.css'
import './styles/base.css'
import './styles/header.css'
import './styles/nav.css'
import './styles/cards.css'
import './styles/form.css'
import './styles/history.css'
import './styles/categories.css'
import './styles/modals.css'
import './styles/auth.css'
import './styles/todos.css'
import './styles/install.css'
import './styles/skeleton.css'
import './styles/dark.css'
import { AuthProvider } from './context/AuthContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
