# Hotel API

REST API of the fictional Hotel Seeblick, used by the chat demos (`../chat/`) and the website (`../website/`), so both share the rooms and bookings. Built with [Hono](https://hono.dev) on Node; Node 24 runs the TypeScript files directly.

- `src/hotel.ts` – the details of the hotel.
- `src/rooms.ts` – the rooms (fixed, in code) and their photos.
- `src/bookings.ts` – booking logic: availability, booking and cancelling.
- `src/db.ts` – the SQLite database with the bookings in `data/hotel.sqlite` (git-ignored, created on the first start).
- `src/index.ts` – the Hono app with the routes.
- `images/rooms/` – room photos, served at `/room-images/<room id>.jpg`.

| Endpoint | |
| --- | --- |
| `GET /api/hotel` | The details of the hotel: name, address, contact, check-in and check-out times |
| `GET /api/hotel/rooms?guests=` | All rooms, or the rooms that fit the guests |
| `GET /api/hotel/availability?checkIn=&checkOut=&guests=` | The rooms that are free for the stay, with `nights` and `totalPrice` |
| `GET /api/hotel/bookings?guestName=` | The bookings under the name |
| `POST /api/hotel/bookings` | Books a room: `{ roomId, guestName, guests, checkIn, checkOut }` |
| `DELETE /api/hotel/bookings/<id>?guestName=` | Cancels a booking; the name must match the booking |

Errors are answered with `400` and `{ "error": "<message>" }`. The guests aren't logged in, so the name on a booking identifies them.

## Setup

```bash
npm install
npm run dev            # http://localhost:4112; set PORT for another port
```
