# Hotel Seeblick website

Website of the fictional Hotel Seeblick (Vite + React + React Router). It embeds the chat of the AI Hub as a web component, without any interaction between the chat and the website.

The design tokens are in `src/index.css`, and the motifs (wave, mountains, page header) in `src/components/brand.tsx`.

## Pages

| Path | Page |
| --- | --- |
| `/` | Homepage with the hotel's metadata and structured data (`Hotel`, `FAQPage`) |
| `/rooms` | Room overview with filters for type, guests, view, price and features |
| `/rooms/:roomId` | Detail page of a room |
| `/compare?a=&b=` | Comparison of two rooms |
| `/booking?room=&checkIn=&checkOut=&guests=` | Booking with live availability |
| `/contact` | Contact details, contact form and directions |

The filters, the compared rooms and the booking form (apart from the name) are kept in the URL, so every state of a page can be linked to.

The hotel's details and its rooms come from the hotel API (`api/`): the root route loads them once before the first page is shown (`src/content/content.ts`), and the pages read them with `useHotel()` and `useRooms()`. The room photos also come from the API.

## Setup

```bash
npm install
npm run dev            # http://localhost:3000
```

The website needs the hotel API (`api/`), which the dev server forwards from `/api` and `/room-images` to `http://localhost:4112`. Start it with `npm run dev` in `api/` first; without it, the website shows an error page. The website and the chat demos share the bookings.

The dev server always runs on port 3000 (`strictPort`). A public AI Hub API key only accepts requests from the domains on its allowed domains, and those include the port, so `localhost:3000` must be on the allowed domains of the API key the website uses.

## AI Hub chat

The website embeds the `<ai-hub-chat>` web component of the AI Hub staging deployment (https://staging-ai-hub.dextinity.com/). `index.html` loads the script from `VITE_AI_HUB_SCRIPT_URL` (set in `.env`), and `src/aiHub/AiHubChat.tsx` creates the element in the AI companion: a full-height panel that slides in from the right when the "AI companion" switch at the right edge of the header is on, and takes about a third of the window next to the website. The switch is remembered per browser.

Put the API key in `.env.local`:

```bash
VITE_AI_HUB_API_KEY=pk_...   # public "Agent" or "Widget" API key with localhost:3000 in its allowed domains
VITE_AI_HUB_WIDGET_ID=       # only for a "Widget" API key
```

Without an API key, the chat is not shown.
