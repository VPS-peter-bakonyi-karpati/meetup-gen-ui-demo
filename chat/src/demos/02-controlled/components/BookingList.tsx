import { Box, Button, List, ListItem, ListItemText, Typography } from '@mui/material'
import { useSendMessage } from '../../shared/useSendMessage.ts'
import type { Booking, Streaming } from '../schemas.ts'
import { formatDate, formatPrice } from '../../shared/format.ts'

export function BookingList({ guestName, bookings = [] }: Streaming<{ guestName: string; bookings: Booking[] }>) {
  const sendMessage = useSendMessage()

  return (
    <Box sx={{ my: 1, maxWidth: 560, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
      <Typography variant="h6" sx={{ px: 2, pt: 2 }}>
        Bookings{guestName && ` of ${guestName}`}
      </Typography>
      {bookings.length === 0 ? (
        <Typography sx={{ p: 2, color: 'text.secondary' }}>No bookings found.</Typography>
      ) : (
        <List>
          {bookings.map((booking, index) => (
            <ListItem
              key={booking.id ?? index}
              divider={index < bookings.length - 1}
              secondaryAction={
                <Button
                  disabled={booking.id === undefined}
                  onClick={() => sendMessage(`Please cancel booking #${booking.id} (${booking.roomName}) for ${booking.guestName ?? guestName}.`)}
                >
                  Cancel
                </Button>
              }
            >
              <ListItemText
                primary={`#${booking.id ?? '…'} · ${booking.roomName ?? ''}`}
                secondary={[
                  booking.checkIn && booking.checkOut && `${formatDate(booking.checkIn)} – ${formatDate(booking.checkOut)}`,
                  booking.guests !== undefined && `${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}`,
                  booking.totalPrice !== undefined && formatPrice(booking.totalPrice),
                ]
                  .filter(Boolean)
                  .join(' · ')}
                slotProps={{ primary: { sx: { fontWeight: 700 } } }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}
