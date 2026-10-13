import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import type { Room, Streaming } from '../schemas.ts'
import { capitalize, formatPrice } from './format.ts'

interface RoomComparisonProps {
  title: string
  rooms: Room[]
}

type Attribute = { label: string; value: (room: Partial<Room>) => ReactNode }

const attributes: Attribute[] = [
  { label: 'Price per night', value: ({ pricePerNight }) => pricePerNight !== undefined && formatPrice(pricePerNight) },
  { label: 'Guests', value: ({ maxGuests }) => maxGuests !== undefined && `up to ${maxGuests}` },
  { label: 'View', value: ({ view }) => view && capitalize(view) },
  { label: 'Size', value: ({ size }) => size !== undefined && `${size} m²` },
  { label: 'Floor', value: ({ floor }) => floor },
  { label: 'Bed', value: ({ bed }) => bed },
  { label: 'Features', value: ({ features }) => features?.join(', ') },
]

/** Rooms side by side, one column per room */
export function RoomComparison({ title, rooms = [] }: Streaming<RoomComparisonProps>) {
  // Rows without a value for any room (e.g. `size` when the agent left it out) are hidden
  const visibleAttributes = attributes.filter((attribute) => rooms.some((room) => attribute.value(room)))

  return (
    <Box sx={{ my: 1, overflowX: 'auto', bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
      {title && <Typography variant="h6" sx={{ px: 2, pt: 2 }}>{title}</Typography>}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            {rooms.map((room, index) => (
              <TableCell key={room.id ?? index} sx={{ verticalAlign: 'top', minWidth: 160 }}>
                {room.imageUrl && (
                  <Box component="img" src={room.imageUrl} alt="" sx={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', mb: 1 }} />
                )}
                <Typography sx={{ fontWeight: 700 }}>{room.name}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleAttributes.map(({ label, value }) => (
            <TableRow key={label}>
              <TableCell component="th" scope="row" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                {label}
              </TableCell>
              {rooms.map((room, index) => (
                <TableCell key={room.id ?? index}>{value(room)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
