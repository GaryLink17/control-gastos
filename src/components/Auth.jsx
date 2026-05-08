import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth({ showResetPasswordForm, setShowResetPasswordForm }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [resetPasswordError, setResetPasswordError] = useState('')
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false)

  const validatePassword = (pass) => {
    if (pass.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres'
    }
    return null
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setResetSuccess(false)
    setLoading(true)

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico')
      setLoading(false)
      return
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/`,
      })

      if (resetError) throw resetError

      setResetSuccess(true)
    } catch (err) {
      console.error('Forgot password error:', err)
      setError(err.message || 'No se pudo enviar el link. Intenta de nuevo.')
    }

    setLoading(false)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setResetPasswordError('')
    setResetPasswordLoading(true)

    if (newPassword.length < 8) {
      setResetPasswordError('La contraseña debe tener al menos 8 caracteres')
      setResetPasswordLoading(false)
      return
    }

    if (newPassword !== confirmNewPassword) {
      setResetPasswordError('Las contraseñas no coinciden')
      setResetPasswordLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      setShowResetPasswordForm(false)
      window.history.replaceState({}, document.title, window.location.pathname)
      window.location.reload()
    } catch (err) {
      console.error('Reset password error:', err)
      setResetPasswordError(err.message || 'No se pudo actualizar la contraseña.')
    }

    setResetPasswordLoading(false)
  }

  const createDefaultCategories = async (userId) => {
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

    if (!email.trim()) {
      setError('El correo electrónico es requerido')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (signInError) throw signInError

        if (!data.user) {
          setError('Usuario no encontrado')
          setLoading(false)
          return
        }
      } else {
        const { data: existingUsers, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email.trim())
          .limit(1)

        if (checkError) throw checkError

        if (existingUsers && existingUsers.length > 0) {
          setError('Este correo electrónico ya está registrado')
          setLoading(false)
          return
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })

        if (signUpError) throw signUpError

        if (data.user) {
          const { error: insertError } = await supabase
            .from('users')
            .insert([{
              id: data.user.id,
              email: email.trim(),
            }])

          if (insertError) throw insertError

          await createDefaultCategories(data.user.id)
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message || 'Error de conexión. Intenta de nuevo.')
    }

    setLoading(false)
  }

  if (showResetPasswordForm) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-icon">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <h1>Nueva contraseña</h1>
            <p>Ingresa tu nueva contraseña para continuar</p>
          </div>

          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label>Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                disabled={resetPasswordLoading}
              />
            </div>

            <div className="form-group">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repite la contraseña"
                disabled={resetPasswordLoading}
              />
            </div>

            {resetPasswordError && <div className="auth-error">{resetPasswordError}</div>}

            <button type="submit" className="auth-submit" disabled={resetPasswordLoading}>
              {resetPasswordLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (showForgotPassword) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-icon">
              <path d="M15 7a2 2 0 012 2v4m-4 4h4m-6-6V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 6a3 3 0 106 0m-6 0a3 3 0 006 0"/>
            </svg>
            <h1>Recuperar contraseña</h1>
            <p>Ingresa tu email y te enviaremos un link para restablecerla</p>
          </div>

          <form onSubmit={handleForgotPassword} className="auth-form">
            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                disabled={loading}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}
            {resetSuccess && <div className="auth-success">Link enviado! Revisa tu correo electronico</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link de recuperación'}
            </button>
          </form>

          <div className="auth-toggle">
            <p>
              <button type="button" onClick={() => { setShowForgotPassword(false); setError(''); setResetSuccess(false) }}>
                ← Volver al login
              </button>
            </p>
            {resetSuccess && (
              <p>
                <button type="button" onClick={() => { setResetSuccess(false) }}>
                  Reenviar link
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    )
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
            <label>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
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
            <p>
              <button type="button" className="forgot-password-link" onClick={() => { setShowForgotPassword(true); setError('') }}>
                ¿Olvidaste tu contraseña?
              </button>
            </p>
          ) : (
            <p>¿Ya tienes cuenta? <button type="button" onClick={() => { setIsLogin(true); setError('') }}>Inicia sesión</button></p>
          )}
          {isLogin && (
            <p>¿No tienes cuenta? <button type="button" onClick={() => { setIsLogin(false); setError(''); setConfirmPassword('') }}>Regístrate</button></p>
          )}
        </div>
      </div>
    </div>
  )
}
