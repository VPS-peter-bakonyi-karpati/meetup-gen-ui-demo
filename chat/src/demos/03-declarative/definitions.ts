import type { ResolveA2uiProps } from '@a2ui/web_core/v0_9'
import { DynamicNumberSchema, DynamicStringListSchema, DynamicStringSchema, type RendererProps } from '@copilotkit/a2ui-renderer'
import { z } from 'zod'

// The hotel building blocks of the catalog, as the agent sees them.
// The props accept literal values or `{ path }` bindings, so the blocks also work in repeated templates.

const optionalString = DynamicStringSchema.optional()
const optionalNumber = DynamicNumberSchema.optional()

export const definitions = {
  RoomCard: {
    description:
      'A hotel room with photo, view, max guests, price and features. Put buttons (e.g. Book, Details) in `child`, usually a Row of Buttons.',
    props: z.object({
      name: DynamicStringSchema,
      imageUrl: DynamicStringSchema,
      view: optionalString,
      maxGuests: optionalNumber,
      description: optionalString,
      features: DynamicStringListSchema.optional(),
      pricePerNight: optionalNumber,
      totalPrice: optionalNumber.describe('Price of the whole stay, from search_rooms'),
      nights: optionalNumber,
      child: z.string().optional().describe('Id of a component shown at the bottom of the card'),
    }),
  },
  PriceTag: {
    description: 'A price in EUR, e.g. "€159 per night".',
    props: z.object({
      amount: DynamicNumberSchema,
      label: optionalString.describe('e.g. "per night" or "for 2 nights"'),
    }),
  },
  FeatureList: {
    description: 'Room features as chips.',
    props: z.object({ features: DynamicStringListSchema }),
  },
  BookingSummary: {
    description: 'A booking: room, dates, guests and total price. Use it for booking confirmations and lists of bookings.',
    props: z.object({
      bookingId: optionalNumber,
      roomName: DynamicStringSchema,
      guestName: optionalString,
      guests: optionalNumber,
      checkIn: DynamicStringSchema,
      checkOut: DynamicStringSchema,
      nights: optionalNumber,
      totalPrice: optionalNumber,
      status: z.enum(['confirmed', 'cancelled', 'existing']).optional(),
      child: z.string().optional().describe('Id of a component shown at the bottom, e.g. a Cancel button'),
    }),
  },
  BarChart: {
    description: 'A horizontal bar chart, e.g. room prices. Values are inline numbers.',
    props: z.object({
      title: z.string().optional(),
      unit: z.string().optional().describe('e.g. "€"'),
      bars: z.array(z.object({ label: z.string(), value: z.number() })),
    }),
  },
}

export type Definitions = typeof definitions
/** The props a renderer gets: `{ path }` bindings are already resolved to their values */
export type Props<K extends keyof Definitions> = RendererProps<ResolveA2uiProps<z.infer<Definitions[K]['props']>>>

