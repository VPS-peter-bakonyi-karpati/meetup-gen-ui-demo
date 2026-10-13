import { Box, Button, Card, CardActions, CardContent, CardMedia, Chip, Skeleton, Stack, Typography } from '@mui/material'
import { useSendMessage } from '../../shared/useSendMessage.ts'
import type { Room, Streaming } from '../schemas.ts'
import { capitalize, formatPrice } from './format.ts'

interface RoomCardsProps {
  title: string
  rooms: Room[]
}

export function RoomCards({ title, rooms }: Streaming<RoomCardsProps>) {
  return (
    <Stack spacing={1.5} sx={{ my: 1 }}>
      {title && <Typography variant="h6">{title}</Typography>}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {(rooms ?? []).map((room, index) => (
          <RoomCard key={room.id ?? index} room={room} />
        ))}
      </Box>
    </Stack>
  )
}

function RoomCard({ room }: { room: Partial<Room> }) {
  const sendMessage = useSendMessage()
  const { id, name, imageUrl, view, maxGuests, pricePerNight, nights, totalPrice, features, description } = room
  // The buttons name the room, so they wait until its id and name have streamed in
  const isComplete = id !== undefined && name !== undefined

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column' }}>
      {imageUrl ? (
        <CardMedia component="img" image={imageUrl} alt={name ?? ''} sx={{ aspectRatio: '4 / 3' }} />
      ) : (
        <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 3', height: 'auto' }} />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="overline" sx={{ color: 'info.main', lineHeight: 1.5 }}>
          {view ? `${capitalize(view)} view` : ' '}
          {maxGuests !== undefined && ` · up to ${maxGuests} ${maxGuests === 1 ? 'guest' : 'guests'}`}
        </Typography>
        <Typography variant="h6">{name ?? <Skeleton width="60%" />}</Typography>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {description}
          </Typography>
        )}
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
          {(features ?? []).map((feature) => (
            <Chip key={feature} label={feature} size="small" variant="outlined" />
          ))}
        </Stack>
        <Typography sx={{ mt: 1.5, color: 'info.main', fontWeight: 700 }}>
          {totalPrice !== undefined && nights !== undefined
            ? `${formatPrice(totalPrice)} for ${nights} ${nights === 1 ? 'night' : 'nights'}`
            : pricePerNight !== undefined && `${formatPrice(pricePerNight)} per night`}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          disabled={!isComplete}
          onClick={() => sendMessage(`I'd like to book the ${name} (room ${id}).`)}
        >
          Book
        </Button>
        <Button disabled={!isComplete} onClick={() => sendMessage(`Tell me more about the ${name} (room ${id}).`)}>
          Details
        </Button>
      </CardActions>
    </Card>
  )
}
