import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Eyebrow, PageHeader } from '../components/brand.tsx'
import { contactTopics, useHotel, type Hotel } from '../content/content.ts'
import { Seo } from '../components/Seo.tsx'
import { useAiHubAction, useAiHubContext } from '../aiHub/bridge.ts'

const descriptionOf = (hotel: Hotel) =>
  `Contact ${hotel.name} in ${hotel.city}: phone ${hotel.phone}, email ${hotel.email}, reception ${hotel.receptionHours}. Directions by car, train and boat.`

const directionsOf = (hotel: Hotel) => [
  { id: 'car', title: 'By car', text: `Take the A1 to the Thalgau exit and follow the signs to ${hotel.city}. Guests park for free in the hotel garage.` },
  { id: 'train', title: 'By train', text: `Travel to Salzburg main station and take the bus to ${hotel.city}. On request, we pick you up from the bus stop.` },
  { id: 'boat', title: 'By boat', text: 'From May to October, the lake boats stop at the jetty next to the hotel.' },
]

const emptyMessage = { name: '', email: '', topic: contactTopics[0], message: '' }

const jsonLdOf = (hotel: Hotel) => ({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: `Contact ${hotel.name}`,
  mainEntity: {
    '@type': 'Hotel',
    name: hotel.name,
    telephone: hotel.phone,
    email: hotel.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.street,
      postalCode: hotel.postalCode,
      addressLocality: hotel.city,
      addressCountry: hotel.country,
    },
    contactPoint: { '@type': 'ContactPoint', contactType: 'reservations', telephone: hotel.phone, email: hotel.email, availableLanguage: ['German', 'English'] },
  },
})

export function ContactPage() {
  const hotel = useHotel()
  const [sentBy, setSentBy] = useState<string>()
  const [values, setValues] = useState(emptyMessage)

  const setValue = (name: string, value: string) => setValues((previous) => ({ ...previous, [name]: value }))

  // The form isn't connected to a mail service in this demo
  const send = () => {
    setSentBy(values.name)
    setValues(emptyMessage)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    send()
  }

  useAiHubContext({
    page: 'Contact',
    contact: { phone: hotel.phone, email: hotel.email, reception: hotel.receptionHours },
    directions: directionsOf(hotel).map(({ title, text }) => ({ title, text })),
    form: sentBy ? `sent by ${sentBy}` : values,
  })

  // For the host tools `fillContactForm` and `sendContactMessage` (`aiHub/hostTools.ts`)
  useAiHubAction('fillContactForm', (input: Partial<typeof emptyMessage>) => {
    const filledIn = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined))
    setSentBy(undefined)
    setValues((previous) => ({ ...previous, ...filledIn }))
  })
  useAiHubAction('sendContactMessage', () => {
    const missing = [!values.name.trim() && 'the name', !values.email.includes('@') && 'a valid email', !values.message.trim() && 'the message']
      .filter(Boolean)
    if (missing.length > 0) throw new Error(`Fill in ${missing.join(', ')} with fillContactForm first.`)
    send()
    return { sent: true }
  })

  return (
    <>
      <Seo
        title="Contact"
        description={descriptionOf(hotel)}
        jsonLd={jsonLdOf(hotel)}
      />
      <PageHeader eyebrow="Kontakt" title="Get in touch">
        <p className="lead">Our family is at the reception {hotel.receptionHours}. Call us, write to us, or simply drop by.</p>
      </PageHeader>

      <div className="container section split contact">
        <div className="split-text">
          <Eyebrow>Hotel Seeblick</Eyebrow>
          <h2>Find us on the shore</h2>
          <dl className="facts">
            <dt>Address</dt>
            <dd>
              <address>
                {hotel.street}
                <br />
                {hotel.postalCode} {hotel.city}
              </address>
            </dd>
            <dt>Phone</dt>
            <dd>
              <a href={`tel:${hotel.phone.replaceAll(' ', '')}`}>{hotel.phone}</a>
            </dd>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${hotel.email}`}>{hotel.email}</a>
            </dd>
            <dt>Reception</dt>
            <dd>{hotel.receptionHours}</dd>
            <dt>Check-in</dt>
            <dd>
              from {hotel.checkInTime}, check-out until {hotel.checkOutTime}
            </dd>
          </dl>
          <Link className="text-link" to="/booking">
            Check availability →
          </Link>
        </div>

        {sentBy ? (
          <div className="confirmation" role="status">
            <Eyebrow>Danke</Eyebrow>
            <h2>Thank you, {sentBy}!</h2>
            <p>We usually answer within one day. For anything urgent, please call us at {hotel.phone}.</p>
            <button type="button" className="text-link" onClick={() => setSentBy(undefined)}>
              Send another message →
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={submit}>
            <h2>Write to us</h2>
            <div className="form-row">
              <label>
                Name
                <input name="name" required autoComplete="name" value={values.name} onChange={(event) => setValue('name', event.target.value)} />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => setValue('email', event.target.value)}
                />
              </label>
            </div>
            <label>
              Topic
              <select name="topic" value={values.topic} onChange={(event) => setValue('topic', event.target.value)}>
                {contactTopics.map((topic) => (
                  <option key={topic}>{topic}</option>
                ))}
              </select>
            </label>
            <label>
              Message
              <textarea name="message" required rows={6} value={values.message} onChange={(event) => setValue('message', event.target.value)} />
            </label>
            <button className="button" type="submit">
              Send message
            </button>
          </form>
        )}
      </div>

      <section className="section-mist" aria-labelledby="directions-title">
        <div className="container section">
          <h2 id="directions-title" className="directions-title">
            Getting here
          </h2>
          <div className="directions">
            {directionsOf(hotel).map(({ id, title, text }) => (
              <div key={id}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
