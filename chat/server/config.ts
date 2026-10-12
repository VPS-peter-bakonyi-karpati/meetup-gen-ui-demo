export const port = Number(process.env.PORT ?? 4111);
export const serverUrl = `http://localhost:${port}`;
// The hotel API (`api/`), which holds the rooms and bookings
export const hotelApiUrl = process.env.HOTEL_API_URL ?? "http://localhost:4112";
