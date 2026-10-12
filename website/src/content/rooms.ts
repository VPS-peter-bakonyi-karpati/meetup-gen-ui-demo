// The rooms as the hotel API (`api/src/rooms.ts`) returns them, and helpers to show and filter them.
export type RoomType = 'single' | 'double' | 'suite' | 'family'
export type RoomView = 'lake' | 'mountain' | 'garden' | 'courtyard'

export interface Room {
  id: string
  name: string
  type: RoomType
  maxGuests: number
  pricePerNight: number
  view: RoomView
  features: string[]
  description: string
  longDescription: string
  size: number
  floor: number
  bed: string
}

export const roomTypes: { value: RoomType; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'family', label: 'Family' },
  { value: 'suite', label: 'Suite' },
]

export const roomViews: { value: RoomView; label: string }[] = [
  { value: 'lake', label: 'Lake view' },
  { value: 'mountain', label: 'Mountain view' },
  { value: 'garden', label: 'Garden view' },
  { value: 'courtyard', label: 'Courtyard view' },
]

export const allFeatures = (rooms: Room[]) => [...new Set(rooms.flatMap((room) => room.features))].sort()

export const findRoom = (rooms: Room[], id: string | null | undefined) => rooms.find((room) => room.id === id)

// The dev server forwards `/room-images` to the hotel API, so the photos have URLs on the website's own domain
export const roomImageUrl = (room: Pick<Room, 'id'>) => `/room-images/${room.id}.jpg`

export const roomTypeLabel = (type: RoomType) => roomTypes.find(({ value }) => value === type)!.label

export const roomViewLabel = (view: RoomView) => roomViews.find(({ value }) => value === view)!.label

export const guestsLabel = (guests: number) => `${guests} ${guests === 1 ? 'guest' : 'guests'}`

export const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1)

export type RoomSort = 'price-asc' | 'price-desc' | 'size-desc'

export interface RoomFilters {
  type?: RoomType
  view?: RoomView
  /** Minimum number of guests the room must sleep */
  guests?: number
  maxPrice?: number
  /** Features the room must all have */
  features?: string[]
  sort?: RoomSort
}

/** The rooms that match the filters of the rooms overview (`/rooms`), in its sort order */
export function filterRooms(rooms: Room[], { type, view, guests = 1, maxPrice = Infinity, features = [], sort = 'price-asc' }: RoomFilters) {
  return rooms
    .filter((room) => !type || room.type === type)
    .filter((room) => !view || room.view === view)
    .filter((room) => room.maxGuests >= guests)
    .filter((room) => room.pricePerNight <= maxPrice)
    .filter((room) => features.every((feature) => room.features.includes(feature)))
    .sort((a, b) => {
      if (sort === 'price-desc') return b.pricePerNight - a.pricePerNight
      if (sort === 'size-desc') return b.size - a.size
      return a.pricePerNight - b.pricePerNight
    })
}

/** The filters of the rooms overview from its URL parameters (`?type=&view=&guests=&maxPrice=&feature=&sort=`) */
export function roomFiltersFromParams(params: URLSearchParams): RoomFilters {
  return {
    type: (params.get('type') as RoomType | null) ?? undefined,
    view: (params.get('view') as RoomView | null) ?? undefined,
    guests: params.has('guests') ? Number(params.get('guests')) : undefined,
    maxPrice: params.has('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    features: params.getAll('feature'),
    sort: (params.get('sort') as RoomSort | null) ?? undefined,
  }
}
