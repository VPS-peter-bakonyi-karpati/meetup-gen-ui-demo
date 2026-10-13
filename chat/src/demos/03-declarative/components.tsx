import { Box, Card, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material'
import { capitalize, formatDate, formatPrice } from '../shared/format.ts'
import type { Props } from './definitions.ts'

// React renderers of the hotel building blocks in `definitions.ts`

export function RoomCard({ props, children }: Props<'RoomCard'>) {
  const { name, imageUrl, view, maxGuests, description, features, pricePerNight, totalPrice, nights, child } = props
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 220 }}>
      {imageUrl && <CardMedia component="img" image={imageUrl} alt={name ?? ''} sx={{ aspectRatio: '4 / 3' }} />}
      <CardContent sx={{ flexGrow: 1 }}>
        {(view || maxGuests !== undefined) && (
          <Typography variant="overline" sx={{ color: 'info.main', lineHeight: 1.5 }}>
            {[view && `${capitalize(view)} view`, maxGuests !== undefined && `up to ${maxGuests} guests`].filter(Boolean).join(' · ')}
          </Typography>
        )}
        <Typography variant="h6">{name}</Typography>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {description}
          </Typography>
        )}
        {features && features.length > 0 && <Chips features={features} />}
        <Typography sx={{ mt: 1.5, color: 'info.main', fontWeight: 700 }}>
          {totalPrice !== undefined
            ? `${formatPrice(totalPrice)}${nights !== undefined ? ` for ${nights} ${nights === 1 ? 'night' : 'nights'}` : ''}`
            : pricePerNight !== undefined && `${formatPrice(pricePerNight)} per night`}
        </Typography>
      </CardContent>
      {child && <Box sx={{ px: 2, pb: 2 }}>{children(child)}</Box>}
    </Card>
  )
}

const Chips = ({ features }: { features: string[] }) => (
  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
    {features.map((feature) => (
      <Chip key={feature} label={feature} size="small" variant="outlined" />
    ))}
  </Stack>
)

export const PriceTag = ({ props: { amount, label } }: Props<'PriceTag'>) => (
  <Typography component="span" sx={{ color: 'info.main', fontWeight: 700 }}>
    {formatPrice(amount)}
    {label && ` ${label}`}
  </Typography>
)

export const FeatureList = ({ props: { features } }: Props<'FeatureList'>) => <Chips features={features ?? []} />

const statusLabels = { confirmed: 'Booking confirmed', cancelled: 'Booking cancelled', existing: 'Booking' }

export function BookingSummary({ props, children }: Props<'BookingSummary'>) {
  const { bookingId, roomName, guestName, guests, checkIn, checkOut, nights, totalPrice, status = 'existing', child } = props
  return (
    <Card sx={{ borderColor: status === 'confirmed' ? 'secondary.main' : undefined, opacity: status === 'cancelled' ? 0.7 : 1 }}>
      <CardContent>
        <Typography variant="overline" sx={{ color: status === 'confirmed' ? 'secondary.main' : 'info.main', lineHeight: 1.5 }}>
          {statusLabels[status]}
          {bookingId !== undefined && ` · #${bookingId}`}
        </Typography>
        <Typography variant="h6">{roomName}</Typography>
        <Typography sx={{ mt: 0.5 }}>
          {checkIn && formatDate(checkIn)} – {checkOut && formatDate(checkOut)}
          {nights !== undefined && ` (${nights} ${nights === 1 ? 'night' : 'nights'})`}
        </Typography>
        {(guestName || guests !== undefined) && (
          <Typography sx={{ color: 'text.secondary' }}>
            {[guestName, guests !== undefined && `${guests} ${guests === 1 ? 'guest' : 'guests'}`].filter(Boolean).join(', ')}
          </Typography>
        )}
        {totalPrice !== undefined && (
          <Typography sx={{ mt: 1, color: 'info.main', fontWeight: 700 }}>Total {formatPrice(totalPrice)}</Typography>
        )}
        {child && <Box sx={{ mt: 1.5 }}>{children(child)}</Box>}
      </CardContent>
    </Card>
  )
}

export function BarChart({ props: { title, unit = '', bars = [] } }: Props<'BarChart'>) {
  const max = Math.max(...bars.map((bar) => bar.value), 1)
  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
      {title && <Typography variant="h6" sx={{ mb: 1.5 }}>{title}</Typography>}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr max-content', columnGap: 1.5, rowGap: 1, alignItems: 'center' }}>
        {bars.map(({ label, value }) => (
          <Box key={label} sx={{ display: 'contents' }}>
            <Typography variant="body2">{label}</Typography>
            <Box sx={{ height: 14, width: `${(value / max) * 100}%`, bgcolor: 'info.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>
              {unit}
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

