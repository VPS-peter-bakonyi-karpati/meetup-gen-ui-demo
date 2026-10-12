import { useEffect, useRef } from 'react'
import { apiKey, widgetId } from './config.ts'

const attributes: Record<string, string | undefined> = {
  'api-key': apiKey,
  'widget-id': widgetId,
  language: 'en',
  'integration-location': 'Hotel Seeblick Website',
}

// The web component takes its size in pixels, so it follows the size of the panel
const setSize = (chat: HTMLElement, panel: HTMLElement) => {
  chat.setAttribute('width', String(Math.floor(panel.clientWidth)))
  chat.setAttribute('height', String(Math.floor(panel.clientHeight)))
}

/**
 * The AI companion: the AI Hub chat in a full-height panel that slides in from the right, next to the website. The
 * script of the web component is loaded in `index.html`.
 */
export function AiHubChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    // The web component renders on every attribute change, so setting the attributes one by one renders incomplete
    // configurations. `ai-hub-chat` isn't defined in a separate document, so the element only becomes the web
    // component when it is attached here, with all attributes already set.
    const chat = document.implementation.createHTMLDocument().createElement('ai-hub-chat')
    for (const [name, value] of Object.entries(attributes)) {
      if (value) chat.setAttribute(name, value)
    }
    // The closed panel keeps its size, as it is only moved out of the viewport
    setSize(chat, panel)
    panel.appendChild(document.adoptNode(chat))

    // Once rendered, the web component resizes its chat on a size change without rendering it again
    const resizeObserver = new ResizeObserver(() => setSize(chat, panel))
    resizeObserver.observe(panel)

    return () => {
      resizeObserver.disconnect()
      chat.remove()
    }
  }, [])

  if (!apiKey) return null

  return (
    // Moved out of the viewport instead of unmounted, so the conversation survives closing the companion
    <aside className={open ? 'companion companion-open' : 'companion'} aria-label="AI companion" inert={!open}>
      <div className="companion-header">
        <span className="companion-title">AI companion</span>
        <button type="button" className="companion-close" aria-label="Close the AI companion" onClick={onClose}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20">
            <path d="M4 4 16 16 M16 4 4 16" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
      <div ref={panelRef} className="companion-chat" />
    </aside>
  )
}
