import { Link } from 'react-router'

export function NotFoundPage() {
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
