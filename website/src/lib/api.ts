// Client of the hotel API (`api/`), forwarded by the dev server.
import type { Hotel } from '../content/content.ts'
import type { Room } from '../content/rooms.ts'

/** A room that is free for the stay; the API also returns the room's details, which the website already has */
export interface Availability {
  id: string
  nights: number
  totalPrice: number
}

export interface Booking {
  id: number
  roomId: string
  roomName: string
  guestName: string
  guests: number
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
}

export interface BookingInput {
  roomId: string
  guestName: string
  guests: number
  checkIn: string
  checkOut: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, init)
  } catch {
    throw new Error('The hotel API is not reachable. Is it running?')
  }
  const body = await response.json().catch(() => undefined)
  if (!response.ok) {
    throw new Error(body?.error ?? 'The hotel API is not reachable. Is it running?')
  }
  return body as T
}

export const fetchHotel = () => request<Hotel>('/api/hotel')

export const fetchRooms = () => request<Room[]>('/api/hotel/rooms')

export const fetchAvailability = ({ checkIn, checkOut, guests }: { checkIn: string; checkOut: string; guests: number }) =>
  request<Availability[]>(`/api/hotel/availability?${new URLSearchParams({ checkIn, checkOut, guests: String(guests) })}`)

export const createBooking = (input: BookingInput) =>
  request<Booking>('/api/hotel/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
