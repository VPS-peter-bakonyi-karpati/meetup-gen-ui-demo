import { z } from 'zod'

// Parameters of the components, in the shape of the hotel tools' results (`server/hotel.ts`),
// so the agent can pass the tool data unchanged.

export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['single', 'double', 'suite', 'family']).optional(),
  maxGuests: z.number(),
  pricePerNight: z.number(),
  view: z.string(),
  features: z.array(z.string()),
  description: z.string(),
  imageUrl: z.string(),
  size: z.number().optional().describe('In m²'),
  floor: z.number().optional(),
  bed: z.string().optional(),
  nights: z.number().optional().describe('Only from search_rooms'),
  totalPrice: z.number().optional().describe('Only from search_rooms'),
})

export const bookingSchema = z.object({
  id: z.number(),
  roomId: z.string(),
  roomName: z.string(),
  guestName: z.string(),
  guests: z.number(),
  checkIn: z.string(),
  checkOut: z.string(),
  nights: z.number(),
  totalPrice: z.number(),
})

export type Room = z.infer<typeof roomSchema>
export type Booking = z.infer<typeof bookingSchema>

/**
 * The props of a component while the agent streams its arguments: every field can still be missing.
 * Only one level below the top is partial (list items and objects), which is enough for our flat data.
 */
export type Streaming<T> = {
  [K in keyof T]?: T[K] extends (infer Item)[] ? Partial<Item>[] : T[K] extends object ? Partial<T[K]> : T[K]
}
