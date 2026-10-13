import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// A public AI Hub API key only answers requests from its allowed domains, and those include the port.
// `localhost:3000` must be on the key's allowed domains, so the dev server must not fall back to another port.
// `PORT` is for a second copy of the website, e.g. in a git worktree; the AI Hub chat doesn't work there.
const port = Number(process.env.PORT ?? 3000)

// The hotel API (hotel, rooms and their photos, availability, bookings), see `api/`
const hotelApi = process.env.HOTEL_API_URL ?? 'http://localhost:4112'
const proxy = { '/api': hotelApi, '/room-images': hotelApi }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port, strictPort: true, proxy },
  preview: { port, strictPort: true, proxy },
})
