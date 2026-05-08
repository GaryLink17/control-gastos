import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Captura el evento que el navegador dispara cuando la app es instalable
    const handler = (e) => {
      // Previene que el navegador muestre su propio prompt automatico
      e.preventDefault()
      // Guarda el evento para usarlo despues cuando el usuario quiera instalar
      setDeferredPrompt(e)
      // Muestra el banner despues de 2 segundos (para no interrumpir al usuario)
      setTimeout(() => setShowBanner(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Limpia el listener cuando el componente se desmonta
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Dispara el prompt nativo del navegador
    deferredPrompt.prompt()

    // Espera la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('App instalada')
    }

    // Limpia el estado
    setDeferredPrompt(null)
    setShowBanner(false)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    // Guarda en localStorage para no volver a mostrarlo
    localStorage.setItem('installDismissed', 'true')
  }

  // No mostrar si el usuario ya lo descarto
  if (showBanner && localStorage.getItem('installDismissed') === 'true') {
    return null
  }

  if (!showBanner) return null

  return (
    <div className="install-banner">
      <div className="install-banner-content">
        <span className="install-banner-icon">📲</span>
        <p className="install-banner-text">
          Instala Control de Gastos para acceder rapidamente
        </p>
        <button className="install-banner-btn" onClick={handleInstall}>
          Instalar
        </button>
        <button className="install-banner-close" onClick={handleDismiss}>
          ✕
        </button>
      </div>
    </div>
  )
}
