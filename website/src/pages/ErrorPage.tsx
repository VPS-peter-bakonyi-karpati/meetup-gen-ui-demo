import { useRouteError } from 'react-router'

/** Shown instead of the website when the hotel and its rooms can't be loaded, e.g. because the hotel API isn't running */
export function ErrorPage() {
  const error = useRouteError()

  return (
    <div className="container section narrow">
      <title>Error | Hotel Seeblick</title>
      <h1>The website can't be shown</h1>
      <p className="error">{error instanceof Error ? error.message : 'Something went wrong.'}</p>
      <p>
        Start the hotel API with <code>npm run dev</code> in <code>api/</code> and reload the page.
      </p>
    </div>
  )
}
