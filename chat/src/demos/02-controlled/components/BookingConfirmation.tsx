import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Card, CardContent, Stack, Typography } from '@mui/material'
import type { Booking, Streaming } from '../schemas.ts'
import { formatDate, formatPrice } from './format.ts'

export function BookingConfirmation({ booking = {} }: Streaming<{ booking: Booking }>) {
  const { id, roomName, guestName, guests, checkIn, checkOut, nights, totalPrice } = booking

  return (
    <Card sx={{ my: 1, maxWidth: 420, borderColor: 'secondary.main' }}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'secondary.main' }}>
          <CheckCircleIcon fontSize="small" />
          <Typography variant="overline" sx={{ lineHeight: 1.5 }}>
            Booking confirmed{id !== undefined && ` · #${id}`}
          </Typography>
        </Stack>
        <Typography variant="h6" sx={{ mt: 1 }}>{roomName}</Typography>
        <Typography sx={{ mt: 1 }}>
          {checkIn && formatDate(checkIn)} – {checkOut && formatDate(checkOut)}
          {nights !== undefined && ` (${nights} ${nights === 1 ? 'night' : 'nights'})`}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          {guestName}
          {guests !== undefined && `, ${guests} ${guests === 1 ? 'guest' : 'guests'}`}
        </Typography>
        {totalPrice !== undefined && (
          <Typography sx={{ mt: 1.5, color: 'info.main', fontWeight: 700 }}>Total {formatPrice(totalPrice)}</Typography>
        )}
      </CardContent>
    </Card>
  )
}
