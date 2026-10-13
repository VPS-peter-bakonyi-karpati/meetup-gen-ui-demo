// The tools the AI Hub agent can use on the website. They run in the browser and change the page the guest sees.
// Tools with `readOnlyHint` run without asking; the others (booking, sending a message) need the guest's approval.
import type { NavigateFunction } from 'react-router'
import { contactTopics } from '../content/content.ts'
import { allFeatures, roomTypes, roomViews, type Room, type RoomFilters } from '../content/rooms.ts'
import { thisMonth } from '../lib/dates.ts'
import { contextAfterChange, runPageAction, type HostTool } from './bridge.ts'

const pages = ['/', '/rooms', '/rooms/<roomId>', '/compare', '/calendar', '/booking', '/contact']

const isoDate = { type: 'string', description: 'Date in the format YYYY-MM-DD' }

export function createHostTools({ navigate, rooms }: { navigate: NavigateFunction; rooms: Room[] }): HostTool[] {
  const roomIds = rooms.map(({ id }) => id)
  const roomList = rooms.map(({ id, name }) => `${id} (${name})`).join(', ')

  return [
    {
      name: 'navigateTo',
      description: `Opens a page of the website: ${pages.join(', ')}. Room ids: ${roomList}. For the availability calendar of a month or of some rooms, use showCalendar. Returns what the page shows.`,
      inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
      readOnlyHint: true,
      handler: async ({ path }: { path: string }) => {
        const { pathname } = new URL(path, location.origin)
        const roomId = pathname.match(/^\/rooms\/([^/]+)$/)?.[1]
        if (!pages.includes(pathname) && !(roomId && roomIds.includes(roomId))) {
          throw new Error(`Unknown page ${pathname}. Use one of: ${pages.join(', ')}, with a room id of ${roomList}.`)
        }
        await navigate(path)
        return contextAfterChange()
      },
    },
    {
      name: 'filterRooms',
      description:
        'Shows the room overview (/rooms) with the given filters, so the guest sees the matching rooms. Filters that are left out are reset. Returns the matching rooms.',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: roomTypes.map(({ value }) => value) },
          view: { type: 'string', enum: roomViews.map(({ value }) => value) },
          guests: { type: 'integer', minimum: 1, maximum: 4, description: 'Minimum number of guests the room must sleep' },
          maxPrice: { type: 'integer', description: 'Maximum price per night in EUR' },
          features: { type: 'array', items: { type: 'string', enum: allFeatures(rooms) }, description: 'Features the room must all have' },
          sort: { type: 'string', enum: ['price-asc', 'price-desc', 'size-desc'] },
        },
      },
      readOnlyHint: true,
      handler: async ({ type, view, guests, maxPrice, features = [], sort }: RoomFilters) => {
        // The same URL parameters as the filters of the rooms page (`roomFiltersFromParams`)
        const params = new URLSearchParams()
        if (type) params.set('type', type)
        if (view) params.set('view', view)
        if (guests && guests > 1) params.set('guests', String(guests))
        if (maxPrice) params.set('maxPrice', String(maxPrice))
        for (const feature of features) params.append('feature', feature)
        if (sort && sort !== 'price-asc') params.set('sort', sort)
        await navigate(`/rooms?${params}`)
        return contextAfterChange()
      },
    },
    {
      name: 'compareRooms',
      description: 'Shows two rooms side by side on the comparison page (/compare).',
      inputSchema: {
        type: 'object',
        properties: { a: { type: 'string', enum: roomIds }, b: { type: 'string', enum: roomIds } },
        required: ['a', 'b'],
      },
      readOnlyHint: true,
      handler: async ({ a, b }: { a: string; b: string }) => {
        await navigate(`/compare?${new URLSearchParams({ a, b })}`)
        return contextAfterChange()
      },
    },
    {
      name: 'showCalendar',
      description:
        'Shows the availability calendar (/calendar) for a month and for the given rooms, so the guest sees on which nights they are free. Use it to find free nights, e.g. "when is the Seesuite free in December?". Fields that are left out keep their value; an empty list of rooms shows all rooms. Returns the free rooms of every night of the month.',
      inputSchema: {
        type: 'object',
        properties: {
          month: { type: 'string', pattern: '^\\d{4}-\\d{2}$', description: 'Month in the format YYYY-MM, not before the current month' },
          roomIds: { type: 'array', items: { type: 'string', enum: roomIds }, description: 'Rooms to show; empty for all rooms' },
        },
      },
      readOnlyHint: true,
      handler: async ({ month, roomIds: chosenRoomIds }: { month?: string; roomIds?: string[] }) => {
        if (month && !/^\d{4}-\d{2}$/.test(month)) throw new Error(`The month must be in the format YYYY-MM, e.g. ${thisMonth()}.`)
        if (month && month < thisMonth()) throw new Error(`The calendar starts with the current month, ${thisMonth()}.`)
        // The month and the rooms are in the URL of the calendar; on another page, it starts with this month and all rooms
        const params = new URLSearchParams(location.pathname === '/calendar' ? location.search : '')
        if (month) {
          if (month === thisMonth()) params.delete('month')
          else params.set('month', month)
        }
        if (chosenRoomIds) {
          params.delete('room')
          for (const id of chosenRoomIds) params.append('room', id)
        }
        await navigate(`/calendar?${params}`)
        // Waits for the occupancy of the month, so the agent gets the free nights
        return contextAfterChange((context) => context.freeRoomsPerNight !== 'loading')
      },
    },
    {
      name: 'fillBookingForm',
      description:
        'Opens the booking page (/booking) and fills in the given fields; fields that are left out keep their value. Returns the form and which rooms are available for the stay. It doesn\'t book: when the guest asked you to book, call submitBooking next.',
      inputSchema: {
        type: 'object',
        properties: {
          roomId: { type: 'string', enum: roomIds },
          checkIn: isoDate,
          checkOut: isoDate,
          guests: { type: 'integer', minimum: 1, maximum: 4 },
          guestName: { type: 'string' },
        },
      },
      readOnlyHint: true,
      handler: async ({ roomId, checkIn, checkOut, guests, guestName }: { roomId?: string; checkIn?: string; checkOut?: string; guests?: number; guestName?: string }) => {
        // The stay is in the URL of the booking page; on another page, the form starts empty
        const params = new URLSearchParams(location.pathname === '/booking' ? location.search : '')
        for (const [name, value] of Object.entries({ room: roomId, checkIn, checkOut, guests })) {
          if (value !== undefined && value !== '') params.set(name, String(value))
        }
        await navigate(`/booking?${params}`)
        if (guestName) {
          await runPageAction('setGuestName', guestName, 'The booking form could not be filled in. Try again.')
        }
        // Waits for the availability, so the agent knows whether the room is free
        return contextAfterChange((context) => context.availability !== 'loading')
      },
    },
    {
      name: 'submitBooking',
      description:
        'Books the room in the booking form, as if the guest clicked "Book now". Call it when the guest asked you to book, after fillBookingForm. The chat asks the guest to approve it, so you don\'t need to ask first.',
      inputSchema: { type: 'object', properties: {} },
      handler: async () => {
        if (location.pathname !== '/booking') {
          throw new Error('The booking page is not open. Fill in the form with fillBookingForm first.')
        }
        return runPageAction('submitBooking', undefined, 'The booking form is not ready. Try again.')
      },
    },
    {
      name: 'fillContactForm',
      description:
        'Opens the contact page (/contact) and fills in the contact form; fields that are left out keep their value. It doesn\'t send the message: when the guest asked you to send it, call sendContactMessage next.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          topic: { type: 'string', enum: contactTopics },
          message: { type: 'string' },
        },
      },
      readOnlyHint: true,
      handler: async (values: { name?: string; email?: string; topic?: string; message?: string }) => {
        if (location.pathname !== '/contact') await navigate('/contact')
        await runPageAction('fillContactForm', values, 'The contact form could not be filled in. Try again.')
        return contextAfterChange()
      },
    },
    {
      name: 'sendContactMessage',
      description:
        'Sends the contact form, as if the guest clicked "Send message". Call it when the guest asked you to send a message, after fillContactForm. The chat asks the guest to approve it, so you don\'t need to ask first.',
      inputSchema: { type: 'object', properties: {} },
      handler: async () => {
        if (location.pathname !== '/contact') {
          throw new Error('The contact page is not open. Fill in the form with fillContactForm first.')
        }
        return runPageAction('sendContactMessage', undefined, 'The contact form is not ready. Try again.')
      },
    },
  ]
}
