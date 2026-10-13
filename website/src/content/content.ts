// The hotel and its rooms come from the hotel API (`api/`). The root route (`main.tsx`) loads them once, before the
// first page is shown, so the pages can use them without a loading state.
import { useRouteLoaderData } from 'react-router'
import { fetchHotel, fetchRooms } from '../lib/api.ts'
import type { Room } from './rooms.ts'

export interface Hotel {
  name: string
  since: number
  tagline: string
  street: string
  postalCode: string
  city: string
  country: string
  phone: string
  email: string
  checkInTime: string
  checkOutTime: string
  receptionHours: string
}

/** Topics of the contact form (`/contact`) */
export const contactTopics = ['Question about a booking', 'Table in the restaurant', 'Spa and treatments', 'Something else']

export interface Content {
  hotel: Hotel
  rooms: Room[]
}

export async function loadContent(): Promise<Content> {
  const [hotel, rooms] = await Promise.all([fetchHotel(), fetchRooms()])
  return { hotel, rooms }
}

const useContent = () => useRouteLoaderData('root') as Content

export const useHotel = () => useContent().hotel

export const useRooms = () => useContent().rooms
