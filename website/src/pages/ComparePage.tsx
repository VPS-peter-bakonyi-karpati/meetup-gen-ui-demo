import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { PageHeader } from '../components/brand.tsx'
import { useRooms } from '../content/content.ts'
import { allFeatures, capitalize, findRoom, roomImageUrl, roomTypeLabel, roomViewLabel, type Room } from '../content/rooms.ts'
import { Seo } from '../components/Seo.tsx'

interface Row {
  label: string
  value: (room: Room) => ReactNode
  /** Returns the room that is better in this row, if the row can be compared */
  better?: (a: Room, b: Room) => Room | undefined
}

const lower = (value: (room: Room) => number) => (a: Room, b: Room) => (value(a) === value(b) ? undefined : value(a) < value(b) ? a : b)
const higher = (value: (room: Room) => number) => (a: Room, b: Room) => (value(a) === value(b) ? undefined : value(a) > value(b) ? a : b)

const factRows: Row[] = [
  { label: 'Price per night', value: (room) => `€${room.pricePerNight}`, better: lower((room) => room.pricePerNight) },
  { label: 'Guests', value: (room) => `up to ${room.maxGuests}`, better: higher((room) => room.maxGuests) },
  { label: 'Size', value: (room) => `${room.size} m²`, better: higher((room) => room.size) },
  { label: 'Price per m²', value: (room) => `€${(room.pricePerNight / room.size).toFixed(2)}`, better: lower((room) => room.pricePerNight / room.size) },
  { label: 'Room type', value: (room) => roomTypeLabel(room.type) },
  { label: 'View', value: (room) => roomViewLabel(room.view) },
  { label: 'Bed', value: (room) => room.bed },
  { label: 'Floor', value: (room) => (room.floor === 1 ? 'Ground floor' : `Floor ${room.floor}`) },
]

/** One row per feature that at least one of the rooms has */
const featureRows = (a: Room, b: Room): Row[] =>
  allFeatures([a, b])
    .map((feature) => ({
      label: capitalize(feature),
      value: (room) => (room.features.includes(feature) ? <span aria-label="yes">✓</span> : <span aria-label="no">–</span>),
    }))

// The compared rooms are kept in the URL (`?a=201&b=301`), so a comparison can be shared.
export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rooms = useRooms()
  const roomA = findRoom(rooms, searchParams.get('a'))
  const roomB = findRoom(rooms, searchParams.get('b'))

  const selectRoom = (slot: 'a' | 'b', id: string) => {
    setSearchParams(
      (params) => {
        if (id) params.set(slot, id)
        else params.delete(slot)
        return params
      },
      { replace: true, preventScrollReset: true },
    )
  }

  const selectedRooms = [roomA, roomB]

  return (
    <>
      <Seo
        title={roomA && roomB ? `${roomA.name} vs. ${roomB.name}` : 'Compare rooms'}
        description="Compare two rooms of Hotel Seeblick side by side: price, size, view, bed and features."
      />
      <PageHeader eyebrow="Vergleichen" title="Compare rooms">
        <p className="lead">Choose two rooms to see their differences side by side. The better value in each row is highlighted.</p>
      </PageHeader>

      <div className="container section">
        <table className="compare-table">
          <thead>
            <tr>
              <td />
              {(['a', 'b'] as const).map((slot, index) => {
                const room = selectedRooms[index]
                const otherRoom = selectedRooms[1 - index]
                return (
                  <th key={slot} scope="col">
                    <label className="visually-hidden" htmlFor={`compare-${slot}`}>
                      Room {index + 1}
                    </label>
                    <select id={`compare-${slot}`} value={room?.id ?? ''} onChange={(event) => selectRoom(slot, event.target.value)}>
                      <option value="">Choose a room</option>
                      {rooms.map(({ id, name }) => (
                        <option key={id} value={id} disabled={id === otherRoom?.id}>
                          {name}
                        </option>
                      ))}
                    </select>
                    {room && (
                      <Link to={`/rooms/${room.id}`}>
                        <img src={roomImageUrl(room)} alt={room.name} />
                      </Link>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          {roomA && roomB && (
            <tbody>
              {[...factRows, ...featureRows(roomA, roomB)].map(({ label, value, better }) => {
                const betterRoom = better?.(roomA, roomB)
                return (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {[roomA, roomB].map((room) => (
                      <td key={room.id} className={betterRoom === room ? 'better' : undefined}>
                        {value(room)}
                      </td>
                    ))}
                  </tr>
                )
              })}
              <tr>
                <td />
                {[roomA, roomB].map((room) => (
                  <td key={room.id}>
                    <Link className="button button-brass" to={`/booking?room=${room.id}`}>
                      Book {room.name}
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          )}
        </table>
        {!(roomA && roomB) && <p className="notice">Choose two rooms to compare them.</p>}
      </div>
    </>
  )
}
