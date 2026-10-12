import { Link } from 'react-router'
import { guestsLabel, roomImageUrl, roomViewLabel, type Room } from '../content/rooms.ts'

/** A room in a list */
export function RoomCard({ room }: { room: Room }) {
  return (
    <article className="room-card">
      <Link to={`/rooms/${room.id}`} tabIndex={-1} aria-hidden="true">
        <img src={roomImageUrl(room)} alt="" loading="lazy" />
      </Link>
      <div className="room-card-body">
        <h3>
          <Link to={`/rooms/${room.id}`}>{room.name}</Link>
        </h3>
        <p className="room-card-text">
          {room.description} · {room.size} m²
        </p>
        <p className="room-card-meta">
          Up to {guestsLabel(room.maxGuests)} · {roomViewLabel(room.view)}
        </p>
        <div className="room-card-footer">
          <p className="price">from € {room.pricePerNight} / night</p>
          <Link className="text-link" to={`/compare?a=${room.id}`}>
            Compare →
          </Link>
        </div>
      </div>
    </article>
  )
}
