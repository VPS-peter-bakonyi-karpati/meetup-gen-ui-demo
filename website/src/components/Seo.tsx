import { useLocation } from 'react-router'
import { useHotel } from '../content/content.ts'
import { roomImageUrl } from '../content/rooms.ts'

interface Props {
  title: string
  description: string
  image?: string
  /** Structured data (https://schema.org) of the page */
  jsonLd?: object
}

/** Metadata of a page. React moves `<title>`, `<meta>` and `<link>` into the document head. */
export function Seo({ title, description, image = roomImageUrl({ id: '301' }), jsonLd }: Props) {
  const hotel = useHotel()
  const { pathname } = useLocation()
  const url = `${window.location.origin}${pathname}`
  const fullTitle = title.startsWith(hotel.name) ? title : `${title} | ${hotel.name}`

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={hotel.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${window.location.origin}${image}`} />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </>
  )
}
