import { Link, useLocation } from 'react-router'
import { useAiHubContext } from '../aiHub/bridge.ts'

export function NotFoundPage() {
  useAiHubContext({ page: 'Not found', path: useLocation().pathname })
  return (
    <div className="container section">
      <title>Page not found | Hotel Seeblick</title>
      <meta name="robots" content="noindex" />
      <h1>Page not found</h1>
      <p>This page doesn't exist (anymore).</p>
      <Link className="text-link" to="/rooms">
        See all rooms →
      </Link>
    </div>
  )
}
