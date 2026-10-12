// Reveals the content of the pages while it scrolls into view: a short fade in from slightly below
// (`[data-reveal]` in `index.css`). An element goes from `hidden` to `shown`, which plays the animation, to `done`, so
// another animation on it doesn't play the fade in again when it ends. The header and the footer are outside `main`, so they don't move.
import { useLayoutEffect, useRef, type RefObject } from 'react'

/** The elements that are revealed; for text blocks, their children, so the eyebrow, headline and text follow each other */
const selector = [
  '.hero-content > *',
  '.page-header-content > *',
  '.booking-bar',
  '.split-text > *',
  '.split-image',
  '.section-header',
  '.room-card',
  '.faq details',
  '.offer-band-content > *',
  '.filters',
  '.results-header',
  '.breadcrumbs',
  '.room-detail-image',
  '.room-detail-body > *',
  '.other-rooms > h2',
  '.compare-table',
  '.booking-form fieldset',
  '.booking-summary',
  '.contact-form',
  '.confirmation',
  '.directions-title',
  '.directions > *',
  '.notice',
].join(', ')

/** Elements that become visible together, like a row of room cards, follow each other by this delay */
const stagger = 70

/** Reveals the content of the container, again after every change of `pathname` */
export function useReveal(containerRef: RefObject<HTMLElement | null>, pathname: string) {
  const observerRef = useRef<IntersectionObserver>(null)

  // Before the browser paints, so the content doesn't show for a moment before its animation
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(({ isIntersecting }) => isIntersecting).map(({ target }) => target as HTMLElement)
        visible.forEach((element, index) => {
          element.style.animationDelay = `${Math.min(index, 5) * stagger}ms`
          element.dataset.reveal = 'shown'
          // Also when another animation cancels the fade in
          const finish = (event: AnimationEvent) => {
            if (event.target !== element || event.animationName !== 'reveal') return
            element.removeEventListener('animationend', finish)
            element.removeEventListener('animationcancel', finish)
            element.style.removeProperty('animation-delay')
            element.dataset.reveal = 'done'
          }
          element.addEventListener('animationend', finish)
          element.addEventListener('animationcancel', finish)
          intersectionObserver.unobserve(element)
        })
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    observerRef.current = intersectionObserver

    // Also for the content the pages render later, like a new page or the rooms that a filter shows
    const prepare = () => {
      for (const element of container.querySelectorAll<HTMLElement>(selector)) {
        if (element.dataset.reveal === 'shown' || element.dataset.reveal === 'done') continue
        element.dataset.reveal = 'hidden'
        // Also the elements that are already hidden, as after the second effect run of React's strict mode; observing
        // an element again does nothing
        intersectionObserver.observe(element)
      }
    }
    prepare()
    const mutationObserver = new MutationObserver(prepare)
    mutationObserver.observe(container, { childList: true, subtree: true })

    return () => {
      intersectionObserver.disconnect()
      mutationObserver.disconnect()
      observerRef.current = null
    }
  }, [containerRef])

  // On a page change, also the elements that React keeps, like the elements of the room page when it shows another
  // room, fade in again
  useLayoutEffect(() => {
    const container = containerRef.current
    const observer = observerRef.current
    if (!container || !observer) return

    for (const element of container.querySelectorAll<HTMLElement>('[data-reveal="shown"], [data-reveal="done"]')) {
      element.dataset.reveal = 'hidden'
      // Let the browser apply the hidden state, so the animation plays again when the element is shown
      void element.offsetWidth
      observer.observe(element)
    }
  }, [containerRef, pathname])
}
