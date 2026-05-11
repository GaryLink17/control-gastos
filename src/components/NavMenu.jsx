import { useRef, useEffect, useState } from 'react'

const VIEWS = [
  { id: 'register', label: 'Registro' },
  { id: 'todos', label: 'Tareas' },
  { id: 'history', label: 'Historial' },
  { id: 'categories', label: 'Categorías' },
]

export default function NavMenu({ currentView, setCurrentView }) {
  const navRef = useRef(null)
  const [sliderStyle, setSliderStyle] = useState({})

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const update = () => {
      const idx = VIEWS.findIndex(v => v.id === currentView)
      const buttons = nav.querySelectorAll('.nav-btn')
      if (!buttons[idx]) return

      const navRect = nav.getBoundingClientRect()
      const btnRect = buttons[idx].getBoundingClientRect()

      setSliderStyle({
        width: btnRect.width,
        transform: `translateX(${btnRect.left - navRect.left}px)`,
      })
    }

    update()

    const ro = new ResizeObserver(update)
    ro.observe(nav)

    return () => ro.disconnect()
  }, [currentView])

  return (
    <nav className="nav-menu" ref={navRef}>
      <div className="nav-slider" style={sliderStyle} />
      {VIEWS.map(({ id, label }) => (
        <button
          key={id}
          className={`nav-btn ${currentView === id ? 'active' : ''}`}
          onClick={() => setCurrentView(id)}
        >
          {id === 'register' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
          {id === 'todos' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          )}
          {id === 'history' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {id === 'categories' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          )}
          {label}
        </button>
      ))}
    </nav>
  )
}
