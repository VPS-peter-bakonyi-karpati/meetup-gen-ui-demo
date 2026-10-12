import { Link, useParams } from 'react-router'
import { Eyebrow } from '../components/brand.tsx'
import { RoomCard } from '../components/RoomCard.tsx'
import { useHotel, useRooms } from '../content/content.ts'
import { findRoom, guestsLabel, roomImageUrl, roomTypeLabel, roomViewLabel } from '../content/rooms.ts'
import { Seo } from '../components/Seo.tsx'
import { NotFoundPage } from './NotFoundPage.tsx'

export function RoomPage() {
  const { roomId } = useParams()
  const hotel = useHotel()
  const rooms = useRooms()
  const room = findRoom(rooms, roomId)

  if (!room) {
    return <NotFoundPage />
  }

  const otherRooms = rooms.filter(({ id }) => id !== room.id).slice(0, 3)

  return (
    <div className="container section">
      <Seo
        title={room.name}
        description={`${room.name} at ${hotel.name}: ${room.description} ${room.size} m², up to ${guestsLabel(room.maxGuests)}, from €${room.pricePerNight} per night.`}
        image={roomImageUrl(room)}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'HotelRoom',
          name: room.name,
          description: room.longDescription,
          image: `${window.location.origin}${roomImageUrl(room)}`,
          floorSize: { '@type': 'QuantitativeValue', value: room.size, unitCode: 'MTK' },
          occupancy: { '@type': 'QuantitativeValue', maxValue: room.maxGuests },
          bed: room.bed,
          amenityFeature: room.features.map((feature) => ({ '@type': 'LocationFeatureSpecification', name: feature, value: true })),
          containedInPlace: { '@type': 'Hotel', name: hotel.name },
        }}
      />

      <nav className="breadcrumbs" aria-label="Breadcrumbs">
        <Link to="/">Home</Link> / <Link to="/rooms">Rooms</Link> / <span aria-current="page">{room.name}</span>
      </nav>

      <article className="room-detail">
        <img className="room-detail-image" src={roomImageUrl(room)} alt={room.name} />
        <div className="room-detail-body">
          <Eyebrow>{roomTypeLabel(room.type)} · {roomViewLabel(room.view)}</Eyebrow>
          <h1>{room.name}</h1>
          <p className="lead">{room.description}</p>
          <p>{room.longDescription}</p>

          <dl className="facts">
            <dt>Room type</dt>
            <dd>{roomTypeLabel(room.type)}</dd>
            <dt>Guests</dt>
            <dd>Up to {guestsLabel(room.maxGuests)}</dd>
            <dt>Size</dt>
            <dd>{room.size} m²</dd>
            <dt>Bed</dt>
            <dd>{room.bed}</dd>
            <dt>View</dt>
            <dd>{roomViewLabel(room.view)}</dd>
            <dt>Floor</dt>
            <dd>{room.floor === 1 ? 'Ground floor' : `Floor ${room.floor}`}</dd>
          </dl>

          <div className="room-features">
            <h2>Features</h2>
            <ul className="features">
              {room.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
              <li>breakfast included</li>
              <li>free Wi-Fi</li>
            </ul>
          </div>

          <div className="booking-box">
            <p className="price">from € {room.pricePerNight} / night</p>
            <div className="actions">
              <Link className="text-link" to={`/compare?a=${room.id}`}>
                Compare →
              </Link>
              <Link className="button button-brass" to={`/booking?room=${room.id}`}>
                Book this room
              </Link>
            </div>
          </div>
        </div>
      </article>

      <section className="other-rooms" aria-labelledby="other-rooms-title">
        <h2 id="other-rooms-title">Other rooms</h2>
        <div className="room-grid">
          {otherRooms.map((otherRoom) => (
            <RoomCard key={otherRoom.id} room={otherRoom} />
          ))}
        </div>
      </section>
    </div>
  )
}
