# Generative UI Demos

LLM chat for experimenting with different generative UI approaches, built with [CopilotKit](https://docs.copilotkit.ai) (v2 API) and MUI. The instructions for the meetup are in the [README](../README.md) in the repository root.

- `src/` – Vite + React app, styled like the website in `src/theme.ts` (MUI) and `src/index.css` (CopilotKit). Each demo has a folder `src/demos/<nn>-<demo-id>/` (numbered in demo order) and is registered in `src/demos/index.ts`; code used by several demos is in `src/demos/shared/`.
- `server/` – CopilotKit runtimes (Node), one per demo at `/api/copilotkit/<demo-id>`, proxied by Vite. Each demo configures its runtime in `server/demos/<nn>-<demo-id>/runtime.ts`. `server/demos/05-mcp-apps/mcpServer.ts` is an MCP server without tools, served at `/mcp`. The hotel tools in `server/hotel.ts` call the hotel API (`../api/`).

## Demos

All demos are a booking assistant for the fictional Hotel Seeblick: recommend a room, book it, and list or cancel bookings. The rooms and bookings come from the hotel API (`../api/`), which the website also uses; all demos get the same hotel tools (`server/hotel.ts`) and only differ in how the chat presents the results.

The basic chat works out of the box and answers in text only. The other demos are empty skeletons (marked with `TODO`) that follow the [generative UI spectrum](https://www.copilotkit.ai/generative-ui-spectrum):

| Demo | Frontend | Server |
| --- | --- | --- |
| Basic chat | Text only | – |
| Controlled | Components registered with `useComponent` | – |
| Declarative (A2UI) | Catalog created with `createCatalog` | `a2ui` middleware |
| Fully open | `openGenerativeUI` provider prop | `openGenerativeUI` middleware |
| MCP Apps | – | `mcpApps` middleware, pointing to the MCP server in `mcpServer.ts` |

## Setup

```bash
# start the hotel API first, see ../api/
npm install
# create .env.local with your key, e.g. OPENAI_API_KEY=...
npm run dev            # web on http://localhost:5173, runtime on :4111
```

`.env` holds shared defaults (committed). Secrets and personal overrides go in `.env.local` (git-ignored), which takes precedence.
