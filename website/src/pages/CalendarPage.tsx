import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAiHubContext } from '../aiHub/bridge.ts'
import { PageHeader } from '../components/brand.tsx'
import { Seo } from '../components/Seo.tsx'
import { useRooms } from '../content/content.ts'
import type { Room } from '../content/rooms.ts'
import { fetchOccupancy, type Occupancy } from '../lib/api.ts'
import { addDays, addMonths, formatDate, formatMonth, thisMonth, today } from '../lib/dates.ts'

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Result of an occupancy request, with the month it was requested for */
type OccupancyResult = { month: string } & ({ occupancy: Occupancy[] } | { error: string })

/** The days shown for the month: whole weeks from Monday to Sunday */
function calendarDays(month: string) {
  const first = `${month}-01`
  // `getUTCDay` counts from Sunday, the calendar starts on Monday
  const start = addDays(first, -((new Date(first).getUTCDay() + 6) % 7))
  const end = addDays(addMonths(month, 1) + '-01', -1)
  const days: string[] = []
  for (let day = start; day <= end || days.length % 7 !== 0; day = addDays(day, 1)) {
    days.push(day)
  }
  return days
}

// A day stands for the night that starts on it, as a booking from the 3rd to the 5th takes the nights of the 3rd and 4th
const isBooked = (occupancy: Occupancy[], roomId: string, day: string) =>
  occupancy.some((stay) => stay.roomId === roomId && stay.checkIn <= day && day < stay.checkOut)

// The month and the rooms are kept in the URL (`?month=2026-10&room=201&room=301`), so a view can be shared.
// Without rooms, the calendar shows all rooms.
export function CalendarPage() {
  const rooms = useRooms()
  const [searchParams, setSearchParams] = useSearchParams()
  const month = /^\d{4}-\d{2}$/.test(searchParams.get('month') ?? '') ? searchParams.get('month')! : thisMonth()
  const roomIds = searchParams.getAll('room').filter((id) => rooms.some((room) => room.id === id))
  const selectedRooms = roomIds.length > 0 ? rooms.filter((room) => roomIds.includes(room.id)) : rooms

  const days = calendarDays(month)
  const from = days[0]
  const to = addDays(days[days.length - 1], 1)
  const firstDay = today()

  const [result, setResult] = useState<OccupancyResult>()
  const occupancy = result?.month === month && 'occupancy' in result ? result.occupancy : undefined
  const error = result?.month === month && 'error' in result ? result.error : undefined

  // The free rooms of every night of the month that hasn't passed yet
  const monthDays = days.filter((day) => day.startsWith(month) && day >= firstDay)
  useAiHubContext({
    page: 'Availability calendar',
    month,
    chosenRooms: roomIds.length > 0 ? selectedRooms.map((room) => room.name) : 'all rooms',
    freeRoomsPerNight: occupancy
      ? Object.fromEntries(monthDays.map((day) => [day, selectedRooms.filter((room) => !isBooked(occupancy, room.id, day)).map((room) => room.name)]))
      : (error ?? 'loading'),
  })

  useEffect(() => {
    let ignore = false
    fetchOccupancy({ from, to })
      .then((stays) => !ignore && setResult({ month, occupancy: stays }))
      .catch((error: Error) => !ignore && setResult({ month, error: error.message }))
    return () => {
      ignore = true
    }
  }, [from, to, month])

  const update = (name: string, value: string | string[] | undefined) => {
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

  const toggleRoom = (id: string) => update('room', roomIds.includes(id) ? roomIds.filter((item) => item !== id) : [...roomIds, id])
  const changeMonth = (months: number) => {
    const next = addMonths(month, months)
    update('month', next === thisMonth() ? undefined : next)
  }

  return (
    <>
      <Seo
        title="Availability calendar"
        description="See at a glance on which days the rooms of Hotel Seeblick are free, for all rooms or for the rooms you like."
      />
      <PageHeader eyebrow="Kalender" title="Availability">
        <p className="lead">See at a glance which nights are free, for the whole hotel or for the rooms you like.</p>
      </PageHeader>

      <div className="container section rooms-layout">
        <aside className="filters" aria-label="Rooms">
          <fieldset>
            <legend>Rooms</legend>
            <div className="chips">
              <button
                type="button"
                className={roomIds.length === 0 ? 'chip chip-active' : 'chip'}
                aria-pressed={roomIds.length === 0}
                onClick={() => update('room', undefined)}
              >
                All rooms
              </button>
              {rooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  className={roomIds.includes(room.id) ? 'chip chip-active' : 'chip'}
                  aria-pressed={roomIds.includes(room.id)}
                  onClick={() => toggleRoom(room.id)}
                >
                  {room.name}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="hint">Choose one or more rooms to see only their availability. Click a free day to book it.</p>
          <dl className="calendar-legend">
            <dt>
              <span className="calendar-bar-segment" />
            </dt>
            <dd>Free</dd>
            <dt>
              <span className="calendar-bar-segment calendar-bar-segment-booked" />
            </dt>
            <dd>Booked</dd>
          </dl>
        </aside>

        <section aria-label="Calendar">
          <div className="calendar-header">
            <button type="button" className="chip" onClick={() => changeMonth(-1)} disabled={month <= thisMonth()} aria-label="Previous month">
              ←
            </button>
            <h2 aria-live="polite">{formatMonth(month)}</h2>
            <button type="button" className="chip" onClick={() => changeMonth(1)} aria-label="Next month">
              →
            </button>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className={occupancy ? 'calendar' : 'calendar calendar-loading'} aria-busy={!occupancy && !error}>
            {weekdays.map((weekday) => (
              <span key={weekday} className="calendar-weekday" aria-hidden="true">
                {weekday}
              </span>
            ))}
            {days.map((day) => (
              <CalendarDay
                key={day}
                day={day}
                rooms={selectedRooms}
                occupancy={occupancy}
                past={day < firstDay}
                outside={!day.startsWith(month)}
                singleRoom={roomIds.length === 1 ? selectedRooms[0] : undefined}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

interface CalendarDayProps {
  day: string
  rooms: Room[]
  occupancy: Occupancy[] | undefined
  past: boolean
  /** The day belongs to the month before or after */
  outside: boolean
  /** The only chosen room, which the booking link then preselects */
  singleRoom: Room | undefined
}

function CalendarDay({ day, rooms, occupancy, past, outside, singleRoom }: CalendarDayProps) {
  const dayNumber = Number(day.slice(8))
  const classNames = ['calendar-day', outside && 'calendar-day-outside', past && 'calendar-day-past'].filter(Boolean).join(' ')

  if (past || !occupancy) {
    return (
      <span className={classNames}>
        <span className="calendar-day-number">{dayNumber}</span>
      </span>
    )
  }

  const freeRooms = rooms.filter((room) => !isBooked(occupancy, room.id, day))
  const status = freeRooms.length === 0 ? 'full' : freeRooms.length === rooms.length ? 'free' : 'partly'
  const freeLabel = singleRoom ? (freeRooms.length > 0 ? 'Free' : 'Booked') : `${freeRooms.length} of ${rooms.length} free`
  const label = `${formatDate(day)}: ${freeLabel}${freeRooms.length > 0 && !singleRoom ? ` (${freeRooms.map((room) => room.name).join(', ')})` : ''}`

  const content = (
    <>
      <span className="calendar-day-number">{dayNumber}</span>
      <span className="calendar-day-status">{freeLabel}</span>
      <span className="calendar-bar" aria-hidden="true">
        {rooms.map((room) => (
          <span
            key={room.id}
            className={freeRooms.includes(room) ? 'calendar-bar-segment' : 'calendar-bar-segment calendar-bar-segment-booked'}
          />
        ))}
      </span>
    </>
  )

  if (status === 'full') {
    return (
      <span className={`${classNames} calendar-day-full`} aria-label={label} title={label}>
        {content}
      </span>
    )
  }

  const params = new URLSearchParams({ checkIn: day, checkOut: addDays(day, 1) })
  if (singleRoom) params.set('room', singleRoom.id)
  return (
    <Link className={`${classNames} calendar-day-${status}`} to={`/booking?${params}`} aria-label={`${label}. Book this night`} title={label}>
      {content}
    </Link>
  )
}
