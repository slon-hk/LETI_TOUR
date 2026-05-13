import { useEffect, useRef } from 'react'

/**
 * Attaches an IntersectionObserver to the returned ref.
 * When the element enters the viewport, adds `in-view` to every
 * descendant that carries the `reveal` or `reveal-left` class,
 * with staggered transition-delay based on DOM order.
 */
export function useReveal(staggerMs = 80, threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        const targets = container.querySelectorAll<HTMLElement>(
          '.reveal, .reveal-left',
        )

        if (targets.length === 0) {
          // The container itself is the reveal target
          container.style.transitionDelay = '0ms'
          container.classList.add('in-view')
        } else {
          targets.forEach((el, i) => {
            el.style.transitionDelay = `${i * staggerMs}ms`
            el.classList.add('in-view')
          })
        }

        obs.disconnect()
      },
      { threshold },
    )

    obs.observe(container)
    return () => obs.disconnect()
  }, [staggerMs, threshold])

  return ref
}
