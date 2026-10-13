import { useComponent } from '@copilotkit/react-core/v2'
import { z } from 'zod'
import { DemoChat } from '../shared/DemoChat.tsx'
import { BookingConfirmation } from './components/BookingConfirmation.tsx'
import { BookingList } from './components/BookingList.tsx'
import { RoomCards } from './components/RoomCards.tsx'
import { RoomComparison } from './components/RoomComparison.tsx'
import { bookingSchema, roomSchema } from './schemas.ts'

// Controlled generative UI: the developer ships finished components, the agent only
// decides *which* one to show and *what data* to pass in (taken from its hotel tools).
// Each component is a tool for the agent; the tool names are used in the prompt (`server/demos/02-controlled/runtime.ts`).
// `followUp: false` ends the turn once a component is shown. With a follow-up, the agent sees the empty
// tool result and often shows the same component again.

export function ControlledDemo() {
  useComponent({
    name: 'show_rooms',
    description: 'Shows rooms as cards with photo, price and buttons to book them. Use it for recommendations and search results.',
    parameters: z.object({ title: z.string().describe('Short heading, e.g. "Rooms for your family"'), rooms: z.array(roomSchema) }),
    render: RoomCards,
    followUp: false,
  })

  useComponent({
    name: 'compare_rooms',
    description: 'Shows rooms side by side in a table. Use it when the guest wants to compare rooms.',
    parameters: z.object({ title: z.string(), rooms: z.array(roomSchema).min(2) }),
    render: RoomComparison,
    followUp: false,
  })

  useComponent({
    name: 'show_booking_confirmation',
    description: 'Shows a booking that was just made with book_room.',
    parameters: z.object({ booking: bookingSchema }),
    render: BookingConfirmation,
    followUp: false,
  })

  useComponent({
    name: 'show_bookings',
    description: 'Shows the bookings of a guest, with a button to cancel each of them.',
    parameters: z.object({ guestName: z.string(), bookings: z.array(bookingSchema) }),
    render: BookingList,
    followUp: false,
  })

  return <DemoChat />
}
