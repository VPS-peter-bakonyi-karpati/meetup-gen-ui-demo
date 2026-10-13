import { useSearchParams } from 'react-router'
import { PageHeader } from '../components/brand.tsx'
import { RoomCard } from '../components/RoomCard.tsx'
import { useRooms } from '../content/content.ts'
import { allFeatures, capitalize, filterRooms, roomFiltersFromParams, roomTypes, roomViews, type RoomSort } from '../content/rooms.ts'
import { Seo } from '../components/Seo.tsx'
import { roomContext, useAiHubContext } from '../aiHub/bridge.ts'

const sorts: { value: RoomSort; label: string }[] = [
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'size-desc', label: 'Size: largest first' },
]

// The filters are kept in the URL, so a filtered list can be shared and the browser history works.
export function RoomsPage() {
  const rooms = useRooms()
  const maxPrice = Math.max(...rooms.map(({ pricePerNight }) => pricePerNight))
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = roomFiltersFromParams(searchParams)
  const { type, view, guests = 1, maxPrice: priceLimit = maxPrice, features = [], sort = 'price-asc' } = filters

  const updateFilter = (name: string, value: string | string[] | undefined) => {
    setSearchParams(
      (params) => {
        params.delete(name)
        for (const item of [value ?? []].flat()) {
          params.append(name, item)
        }
        return params
      },
      { replace: true, preventScrollReset: true },
    )
  }

  const visibleRooms = filterRooms(rooms, filters)
  useAiHubContext({ page: 'Rooms', filters, shownRooms: visibleRooms.map(roomContext) })

  return (
    <>
      <Seo
        title="Rooms & suites"
        description={`All ${rooms.length} rooms and suites of Hotel Seeblick: single, double and family rooms and suites with a lake or mountain view.`}
      />
      <PageHeader eyebrow="Zimmer & Suiten" title="Rooms & suites">
        <p className="lead">From a quiet room facing the courtyard to the suite with a private sauna above the lake.</p>
      </PageHeader>

      <div className="container section rooms-layout">
        <aside className="filters" aria-label="Filters">
          <fieldset>
            <legend>Room type</legend>
            <div className="chips">
              <button type="button" className={!type ? 'chip chip-active' : 'chip'} aria-pressed={!type} onClick={() => updateFilter('type', undefined)}>
                All
              </button>
              {roomTypes.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={type === value ? 'chip chip-active' : 'chip'}
                  aria-pressed={type === value}
                  onClick={() => updateFilter('type', value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <label>
            Guests
            <select value={guests} onChange={(event) => updateFilter('guests', event.target.value === '1' ? undefined : event.target.value)}>
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>
                  {count === 1 ? 'Any' : `At least ${count}`}
                </option>
              ))}
            </select>
          </label>

          <label>
            View
            <select value={view ?? ''} onChange={(event) => updateFilter('view', event.target.value || undefined)}>
              <option value="">Any view</option>
              {roomViews.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Max. price per night: €{priceLimit}
            <input
              type="range"
              min={50}
              max={maxPrice}
              step={10}
              value={priceLimit}
              onChange={(event) => updateFilter('maxPrice', Number(event.target.value) >= maxPrice ? undefined : event.target.value)}
            />
          </label>

          <fieldset>
            <legend>Features</legend>
            {allFeatures(rooms).map((feature) => (
              <label key={feature} className="checkbox">
                <input
                  type="checkbox"
                  checked={features.includes(feature)}
                  onChange={(event) =>
                    updateFilter('feature', event.target.checked ? [...features, feature] : features.filter((item) => item !== feature))
                  }
                />
                {capitalize(feature)}
              </label>
            ))}
          </fieldset>

          <button type="button" className="text-link" onClick={() => setSearchParams({}, { replace: true, preventScrollReset: true })}>
            Reset filters →
          </button>
        </aside>

        <section aria-label="Rooms">
          <div className="results-header">
            <p role="status">
              {visibleRooms.length} of {rooms.length} rooms
            </p>
            <label>
              Sort by{' '}
              <select value={sort} onChange={(event) => updateFilter('sort', event.target.value === 'price-asc' ? undefined : event.target.value)}>
                {sorts.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {visibleRooms.length > 0 ? (
            <div className="room-grid">
              {visibleRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <p className="notice">No room matches these filters.</p>
          )}
        </section>
      </div>
    </>
  )
}
