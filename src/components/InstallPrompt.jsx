import { useState, useEffect } from 'react'

let deferredPromptGlobal = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPromptGlobal = e
  })
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(() => deferredPromptGlobal)
  const [showBanner, setShowBanner] = useState(() => !!deferredPromptGlobal)

  const isInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone ||
    false

  useEffect(() => {
    if (isInstalled) return

    if (deferredPromptGlobal) {
      const timer = setTimeout(() => setShowBanner(true), 2000)
      return () => clearTimeout(timer)
    }

    const handler = (e) => {
      e.preventDefault()
      deferredPromptGlobal = e
      setDeferredPrompt(e)
      setTimeout(() => setShowBanner(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('App instalada')
    }

    setDeferredPrompt(null)
    setShowBanner(false)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('installDismissed', 'true')
  }

  if (isInstalled) return null
  if (localStorage.getItem('installDismissed') === 'true') return null
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
