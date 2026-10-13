# AGENTS.md

Notes for coding agents working in this repository. The meetup instructions are in `README.md`; `chat/README.md` and `api/README.md` describe the apps.

## Branches

- `main` is the starting point for the meetup participants: the generative UI demos are skeletons with `TODO`s. Don't implement the demos on `main`.
- `solution` has the implemented demos, the CI bonus and the side quest (see "Solution" in `README.md`).

## Apps and commands

Node.js 24 or later. `./install.sh` installs all three apps. There is no test suite; check every change with the type check and the linter of the app you changed.

| App | Start | Check |
| --- | --- | --- |
| `api/` – hotel API (Hono, SQLite in `api/data/`), port 4112 | `npm run dev` | `npm run typecheck`, `npm run lint` |
| `chat/` – CopilotKit demos: Vite on 5173, runtimes and MCP server on 4111 | `npm run dev` (needs `chat/.env.local` with the LLM key) | `npx tsc -b`, `npm run lint`, `npm run build` |
| `website/` – hotel website with the Dextinity AI Hub chat, port 3000 | `npm run dev` | `npm run build`, `npm run lint` |

- The user usually has all apps running already. Check the ports first (for example, `curl http://localhost:4111/api/copilotkit/basic-chat/info`) instead of starting them a second time.
- `chat`'s `npm run dev:server` uses `tsx watch`. It restarts only when an imported module changes, not when `chat/server/demos/05-mcp-apps/app.html` changes.
- In a sandbox that blocks Unix sockets, `tsx watch` fails with `EPERM` on its IPC pipe.

## Chat structure

- Each demo has a client folder `chat/src/demos/<nn>-<id>/` and a server folder `chat/server/demos/<nn>-<id>/runtime.ts`. The id must match in `chat/src/demos/index.ts` and `chat/server/index.ts`.
- All demos share the hotel tools (`chat/server/hotel.ts`) and the base prompt (`concierge` in `chat/server/demos/shared.ts`). A demo adds its own rules to the prompt in its `runtime.ts`.
- Provider props of a demo (A2UI catalog, open generative UI) go into `providerProps` in `chat/src/demos/index.ts`. They are created outside the provider, so they can't use hooks; see `sendMessageRef` in `chat/src/demos/04-open-generative-ui/sandboxFunctions.ts` for how to reach the agent from there.
- `chat/src/brand.ts` is the only place for the Hotel Seeblick colors, fonts and design rules. It has no imports, so the server can use it too. The original CI is in `website/src/index.css`.

## Website and AI Hub

The website connects the AI Hub chat in `website/src/aiHub/` (the solution of Step 3, see `README.md`). The bridge API of the web component is described in `ai-hub-context-and-tools.md`.

| File | Role |
| --- | --- |
| `AiHubChat.tsx` | Creates the `<ai-hub-chat>` element and calls `connectBridge` with its `bridge` and the tools |
| `bridge.ts` | Context (`useAiHubContext`), page actions (`useAiHubAction`, `runPageAction`) and `contextAfterChange` |
| `hostTools.ts` | The tools, created with `navigate` and the rooms |
| `config.ts` | API key and widget id from `.env.local` |

- **New page:** call `useAiHubContext` with what the page shows. Otherwise the agent keeps the context of the previous page.
- **New tool:** add it to `createHostTools`. Return `contextAfterChange()` when the tool changes the page, so the agent sees the result in the same answer. Throw errors that tell the agent how to fix the call.
- **Form state:** state that is not in the URL (the booking name, the contact form) needs a page action (`useAiHubAction`) before a tool can change it.
- **Approval:** tools that change something outside the page (booking, sending a message) must not have `readOnlyHint`, so the guest approves them in the chat. Say so in the tool description, or the agent asks for confirmation itself and doesn't call the tool.
- The web component is loaded from the AI Hub staging deployment. It needs `VITE_AI_HUB_API_KEY` in `website/.env.local`, with `localhost:3000` on the key's allowed domains.

## Code style

- Match the surrounding code: client code (`chat/src`, `website/src`) uses 2 spaces, single quotes and no semicolons; server code (`chat/server`, `api/src`) uses 4 spaces, double quotes and semicolons.
- Relative imports with the file extension (`./hotel.ts`).
- Comments explain why, in short, plain English sentences. User-facing texts of the hotel are English; room names are German.

## Testing

- Test in a browser with the example scenarios in `README.md`. Most problems only show with the real model: repeated tool calls, missing details, wrong parameters.
- AI Hub: switch on the "AI companion" in the header of the website, then ask for an action, e.g. "Show me rooms with a lake view". The chat is in a shadow root; in the browser console, `document.querySelector('ai-hub-chat').bridge` is the bridge. Approve tool calls with the "Approve" button in the chat.
- Bookings go into the shared API database. Use a test guest name and cancel the test bookings afterward: `curl -X DELETE "http://localhost:4112/api/hotel/bookings/<id>?guestName=<name>"`.

## Known pitfalls

- `useComponent` (controlled): without `followUp: false`, the agent sees the empty tool result and often shows the same component again.
- A2UI: a button click (`log_a2ui_event`) is only in the run that follows it, not in the chat history. The agent has to repeat the important details (room, dates) in its reply.
- A2UI: the basic catalog components have hardcoded inline styles. To change their look, replace them with components of the same name and schema (`chat/src/demos/03-declarative/brandedBasics.tsx`); the catalog keeps the last component per name.
- Open generative UI: the sandbox has an opaque origin, and Chrome blocks its requests to `localhost` (images included). Load such data through a sandbox function, as `loadImage` does.
- Open generative UI: the model sometimes calls `generateSandboxedUi` in the same step as the data tool, before it has the data. The prompt tells it to wait for the tool results.
- MCP Apps: models send empty strings for optional tool parameters. Treat empty values as missing.
- MCP Apps: register `app.ontoolresult` before `await app.connect()`, or the first result can be lost.
- AI Hub: the agent can't list its tools when asked, but it uses them. Test a tool by asking for its action, not by asking the agent about it.
