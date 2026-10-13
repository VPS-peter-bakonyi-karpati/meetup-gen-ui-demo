import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Eyebrow, MountainScene, WaveDivider } from '../components/brand.tsx'
import { addDays, today } from '../lib/dates.ts'
import { useHotel, useRooms, type Hotel } from '../content/content.ts'
import { RoomCard } from '../components/RoomCard.tsx'
import { findRoom, guestsLabel, roomImageUrl, type Room } from '../content/rooms.ts'
import { Seo } from '../components/Seo.tsx'
import { roomContext, useAiHubContext } from '../aiHub/bridge.ts'

const amenities = ['Restaurant', 'Spa with sauna and steam bath', 'Private beach and jetty', 'Rowing boats and paddle boards']

const featuredRoomIds = ['201', '302', '203']

const faqsOf = (hotel: Hotel) => [
  {
    id: 'check-in',
    question: 'What are the check-in and check-out times?',
    answer: `Check-in is from ${hotel.checkInTime}, check-out until ${hotel.checkOutTime}. Ask at the reception for a late check-out.`,
  },
  {
    id: 'breakfast',
    question: 'Is breakfast included?',
    answer: 'Yes. Every room rate includes our breakfast buffet with regional products, served from 7:00 to 10:30.',
  },
  {
    id: 'parking',
    question: 'Is there parking at the hotel?',
    answer: 'Guests park for free in the hotel garage. Two charging stations for electric cars are available.',
  },
  {
    id: 'children-and-pets',
    question: 'Are children and pets welcome?',
    answer: 'Children are very welcome, and our Familienzimmer has two bedrooms and a kids corner. Dogs are allowed in the garden rooms on request.',
  },
]

const arrivalOf = (hotel: Hotel) =>
  `Travel by car via the A1 and the Thalgau exit, or by train to Salzburg and then by bus to ${hotel.city}. From May to October, the lake boats stop at the jetty next to the hotel.`

function metadataOf(hotel: Hotel, rooms: Room[]) {
  const lowestPrice = Math.min(...rooms.map(({ pricePerNight }) => pricePerNight))
  const highestPrice = Math.max(...rooms.map(({ pricePerNight }) => pricePerNight))
  const title = `${hotel.name} – ${hotel.tagline}`
  const description = `${hotel.name} is a family-run lakeside hotel in ${hotel.city} with lake view rooms, suites with a private sauna, a spa and a restaurant on the shore. Rooms from €${lowestPrice} per night.`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Hotel',
        name: hotel.name,
        description,
        url: window.location.origin,
        image: `${window.location.origin}${roomImageUrl({ id: '301' })}`,
        telephone: hotel.phone,
        email: hotel.email,
        priceRange: `€${lowestPrice}–€${highestPrice}`,
        checkinTime: hotel.checkInTime,
        checkoutTime: hotel.checkOutTime,
        foundingDate: String(hotel.since),
        address: {
          '@type': 'PostalAddress',
          streetAddress: hotel.street,
          postalCode: hotel.postalCode,
          addressLocality: hotel.city,
          addressCountry: hotel.country,
        },
        amenityFeature: amenities.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqsOf(hotel).map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  }
  return { title, description, jsonLd }
}

function BookingBar() {
  const navigate = useNavigate()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')

  const changeCheckIn = (value: string) => {
    setCheckIn(value)
    if (!checkOut || checkOut <= value) setCheckOut(addDays(value, 1))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    navigate(`/booking?${new URLSearchParams({ checkIn, checkOut, guests })}`)
  }

  return (
    <section className="container booking-bar-section" aria-label="Check availability">
      <form className="booking-bar" onSubmit={submit}>
        <label>
          Arrival
          <input name="checkIn" type="date" required min={today()} value={checkIn} onChange={(event) => changeCheckIn(event.target.value)} />
        </label>
        <label>
          Departure
          <input
            name="checkOut"
            type="date"
            required
            min={checkIn ? addDays(checkIn, 1) : today()}
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
          />
        </label>
        <label className="booking-bar-guests">
          Guests
          <select name="guests" value={guests} onChange={(event) => setGuests(event.target.value)}>
            {[1, 2, 3, 4].map((count) => (
              <option key={count} value={count}>
                {guestsLabel(count)}
              </option>
            ))}
          </select>
        </label>
        <button className="button" type="submit">
          Check availability
        </button>
      </form>
    </section>
  )
}

export function HomePage() {
  const hotel = useHotel()
  const rooms = useRooms()
  const { title, description, jsonLd } = metadataOf(hotel, rooms)
  const featuredRooms = featuredRoomIds.map((id) => findRoom(rooms, id)!)
  useAiHubContext({
    page: 'Home',
    amenities,
    featuredRooms: featuredRooms.map(roomContext),
    faq: faqsOf(hotel).map(({ question, answer }) => ({ question, answer })),
    arrival: arrivalOf(hotel),
  })

  return (
    <>
      <Seo title={title} description={description} jsonLd={jsonLd} />

      <section className="hero">
        <MountainScene />
        <div className="container hero-content">
          <Eyebrow wave={false}>{hotel.tagline}</Eyebrow>
          <h1>Where the mountains meet the water.</h1>
          <p className="lead">
            A family-run lakeside hotel with {rooms.length} rooms, a restaurant on the shore and a quiet spa above the water.
          </p>
        </div>
      </section>

      <BookingBar />

      <section className="container split intro">
        <div className="split-text">
          <Eyebrow>Willkommen</Eyebrow>
          <h2>Slow mornings, clear water, long evenings on the terrace.</h2>
          <p>
            Since {hotel.since}, our family has welcomed guests directly on the shore in {hotel.city}. Wake up to the view
            over the water, have breakfast with bread and cheese from the farms around the lake, and spend the afternoon on
            our jetty, on the water or in the mountains.
          </p>
          <Link className="text-link" to="/rooms">
            Find your room →
          </Link>
        </div>
        <img className="split-image" src={roomImageUrl(findRoom(rooms, '201')!)} alt="Seezimmer with a balcony over the lake" />
      </section>

      <WaveDivider />
      <section className="section-mist" aria-labelledby="rooms-title">
        <div className="container section">
          <div className="section-header">
            <h2 id="rooms-title">Rooms &amp; Suites</h2>
            <Link className="text-link" to="/rooms">
              All {rooms.length} rooms →
            </Link>
          </div>
          <div className="room-grid">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      <section className="container section split" aria-labelledby="faq-title">
        <div className="split-text">
          <Eyebrow>Gut zu wissen</Eyebrow>
          <h2 id="faq-title">Before you arrive</h2>
          <p>{arrivalOf(hotel)}</p>
          <Link className="text-link" to="/contact">
            Directions and contact →
          </Link>
        </div>
        <div className="faq">
          {faqsOf(hotel).map(({ id, question, answer }) => (
            <details key={id}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="offer-band">
        <svg aria-hidden="true" viewBox="0 0 1440 300" preserveAspectRatio="none">
          <path d="M0 220 Q120 190 240 220 T480 220 T720 220 T960 220 T1200 220 T1440 220 V300 H0 Z" fill="#FFFFFF" opacity="0.06" />
          <path d="M0 250 Q120 225 240 250 T480 250 T720 250 T960 250 T1200 250 T1440 250 V300 H0 Z" fill="#FFFFFF" opacity="0.06" />
        </svg>
        <div className="container offer-band-content">
          <div>
            <Eyebrow wave={false}>Offer</Eyebrow>
            <h2>Herbst am See: three nights by the lake, breakfast included</h2>
          </div>
          <Link className="button button-brass button-large" to="/booking?guests=2">
            Check your dates
          </Link>
        </div>
      </section>
    </>
  )
}
