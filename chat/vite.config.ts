import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4111',
      // Room photos of the hotel API, so the app can load them from its own origin (see `loadImage` in
      // `src/demos/04-open-generative-ui/sandboxFunctions.ts`)
      '/room-images': process.env.HOTEL_API_URL ?? 'http://localhost:4112',
    },
  },
})
