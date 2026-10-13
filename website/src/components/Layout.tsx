import { useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { AiHubChat } from '../aiHub/AiHubChat.tsx'
import { aiHubAvailable } from '../aiHub/config.ts'
import { useHotel } from '../content/content.ts'
import { useReveal } from '../lib/reveal.ts'

const companionStorageKey = 'ai-companion-open'

// The switch is remembered per browser; without storage, as in a private window, the companion starts closed
function readCompanionOpen() {
  try {
    return localStorage.getItem(companionStorageKey) === 'true'
  } catch {
    return false
  }
}

export function Layout() {
  const hotel = useHotel()
  const [companionOpen, setCompanionOpen] = useState(readCompanionOpen)
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  useReveal(mainRef, pathname)

  const toggleCompanion = (open: boolean) => {
    setCompanionOpen(open)
    try {
      localStorage.setItem(companionStorageKey, String(open))
    } catch {
      // The switch then only applies until the next page load
    }
  }

  return (
    <>
      <div className={companionOpen ? 'site site-with-companion' : 'site'}>
        <header className="header">
          {/* Keyed by the page, so the animation plays again on every page change, but not when only the URL parameters
              change, as with the room filters */}
          <span key={pathname} className="navigation-progress" aria-hidden="true" />
          <div className="container header-inner">
            <Link className="wordmark" to="/">
              <span className="wordmark-name">{hotel.name}</span>
              <span className="wordmark-subtitle">am See · seit {hotel.since}</span>
            </Link>
            <nav aria-label="Main" className="main-nav">
              <NavLink to="/rooms">Rooms</NavLink>
              <NavLink to="/compare">Compare</NavLink>
              <NavLink to="/calendar">Availability</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </nav>
            <Link className="button button-brass" to="/booking">
              Book a stay
            </Link>
          </div>
          {/* At the right edge, outside the centered header content, next to the panel of the companion */}
          {aiHubAvailable && (
            <div className="header-companion">
              <button
                type="button"
                role="switch"
                aria-checked={companionOpen}
                className="companion-switch"
                onClick={() => toggleCompanion(!companionOpen)}
              >
                <span className="companion-switch-track" aria-hidden="true">
                  <span className="companion-switch-thumb" />
                </span>
                AI companion
              </button>
            </div>
          )}
        </header>

        <main ref={mainRef}>
          <Outlet />
        </main>

        <Footer />
      </div>

      {/* In the layout, so the chat and its conversation stay open across pages */}
      <AiHubChat open={companionOpen} onClose={() => toggleCompanion(false)} />
      <ScrollRestoration />
    </>
  )
}

function Footer() {
  const hotel = useHotel()
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')

  const subscribe = (event: FormEvent) => {
    event.preventDefault()
    setSubscribed(true)
  }

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <address className="footer-column">
          <span className="footer-name">{hotel.name}</span>
          <span>{hotel.street}</span>
          <span>
            {hotel.postalCode} {hotel.city}
          </span>
        </address>
        <div className="footer-column">
          <strong>Contact</strong>
          <a href={`tel:${hotel.phone.replaceAll(' ', '')}`}>{hotel.phone}</a>
          <a href={`mailto:${hotel.email}`}>{hotel.email}</a>
        </div>
        <nav className="footer-column" aria-label="Hotel">
          <strong>Hotel</strong>
          <Link to="/rooms">Rooms</Link>
          <Link to="/compare">Compare rooms</Link>
          <Link to="/calendar">Availability calendar</Link>
          <Link to="/booking">Book a stay</Link>
          <Link to="/contact">Contact &amp; directions</Link>
        </nav>
        {/* The newsletter isn't connected to a mailing service in this demo */}
        <form className="footer-column" onSubmit={subscribe}>
          <label htmlFor="newsletter-email">
            <strong>Newsletter</strong>
          </label>
          {subscribed ? (
            <p role="status">Thank you! We'll write to you when the lake season starts.</p>
          ) : (
            <div className="newsletter-row">
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder="Your email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button className="button button-brass" type="submit">
                Sign up
              </button>
            </div>
          )}
        </form>
      </div>
      <div className="container footer-bottom">
        <span>© {hotel.name}</span>
        <span>A fictional hotel for the generative UI meetup.</span>
      </div>
    </footer>
  )
}
