import { useRef, useState, useEffect } from 'react'

export function useAnimatedSlider(activeValue, values) {
  const ref = useRef(null)
  const [sliderStyle, setSliderStyle] = useState({})

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const update = () => {
      const idx = values.indexOf(activeValue)
      const buttons = container.querySelectorAll('.toggle-btn')
      if (!buttons[idx]) return

      const containerRect = container.getBoundingClientRect()
      const btnRect = buttons[idx].getBoundingClientRect()

      setSliderStyle({
        width: btnRect.width,
        transform: `translateX(${btnRect.left - containerRect.left}px)`,
      })
    }

    update()

    const ro = new ResizeObserver(update)
    ro.observe(container)
    return () => ro.disconnect()
  }, [activeValue, values])

  return { ref, sliderStyle }
}
