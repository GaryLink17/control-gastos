import { useState } from 'react'
import { supabase } from '../supabaseClient'

function hashPassword(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePassword = (pass) => {
    if (pass.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (!username.trim()) {
      setError('El nombre de usuario es requerido')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const { data: users, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('username', username.trim())
          .limit(1)

        if (fetchError) throw fetchError

        if (users.length === 0) {
          setError('Usuario no encontrado')
          setLoading(false)
          return
        }

        const user = users[0]
        const hashedPassword = hashPassword(password)

        if (user.password_hash !== hashedPassword) {
          setError('Contraseña incorrecta')
          setLoading(false)
          return
        }

        const loggedUser = { id: user.id, username: user.username }

        localStorage.setItem('user', JSON.stringify(loggedUser))

        onLogin(loggedUser)
      } else {
        const { data: existingUsers, error: checkError } = await supabase
          .from('users')
          .select('username')
          .eq('username', username.trim())
          .limit(1)

        if (checkError) throw checkError

        if (existingUsers.length > 0) {
          setError('El nombre de usuario ya existe')
          setLoading(false)
          return
        }

        const hashedPassword = hashPassword(password)

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            username: username.trim(),
            password_hash: hashedPassword
          }])
          .select()
          .limit(1)

        if (insertError) throw insertError

        if (newUser && newUser.length > 0) {
          const userId = newUser[0].id
          const loggedUser = { 
              id: userId, 
              username: newUser[0].username 
            }

            const defaultCategories = [
              { name: 'Salario', type: 'income', icon: '💵', user_id: userId },
              { name: 'Freelance', type: 'income', icon: '💻', user_id: userId },
              { name: 'Inversiones', type: 'income', icon: '📈', user_id: userId },
              { name: 'Otros Ingresos', type: 'income', icon: '💰', user_id: userId },
              { name: 'Alimentación', type: 'expense', icon: '🛒', user_id: userId },
              { name: 'Transporte', type: 'expense', icon: '🚗', user_id: userId },
              { name: 'Servicios', type: 'expense', icon: '💡', user_id: userId },
              { name: 'Entretenimiento', type: 'expense', icon: '🎬', user_id: userId },
              { name: 'Salud', type: 'expense', icon: '🏥', user_id: userId },
              { name: 'Shopping', type: 'expense', icon: '🛍️', user_id: userId },
              { name: 'Educación', type: 'expense', icon: '📚', user_id: userId },
              { name: 'Otros Gastos', type: 'expense', icon: '📦', user_id: userId },
            ]

            await supabase.from('categories').insert(defaultCategories)

            localStorage.setItem('user', JSON.stringify(loggedUser))

            onLogin(loggedUser)
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('Error de conexión. Intenta de nuevo.')
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-icon">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <h1>Control de Gastos</h1>
          <p>{isLogin ? 'Inicia sesión para continuar' : 'Crea una cuenta para comenzar'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                disabled={loading}
              />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <p>¿No tienes cuenta? <button type="button" onClick={() => { setIsLogin(false); setError(''); setConfirmPassword('') }}>Regístrate</button></p>
          ) : (
            <p>¿Ya tienes cuenta? <button type="button" onClick={() => { setIsLogin(true); setError('') }}>Inicia sesión</button></p>
          )}
        </div>
      </div>
    </div>
  )
}
