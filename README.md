# Generative UI - Software Craft & Testing Meetup @ Vivid Planet

This repository serves as a basis for the generative UI session at the Software Craft & Testing Meetup @ Vivid Planet.
Today we are enhancing the user experience for guests of the fictional Hotel Seeblick by allowing an LLM to influence the UI.

## Main goal

**Let an LLM shape the UI of a hotel booking assistant, and find out which approach works best**

## Prerequisites

1. Install [Node.js](https://nodejs.org/en/download/) (make sure to have a version >= 24)
2. Clone this repository
3. An API key of an LLM provider (e.g. OpenAI) for the main quest, and a [Dextinity AI Hub](https://www.dextinity.com/de) API key for the side quest (both provided during the starting presentation)

## Step 1: Setup

The repository has three apps, each in its own folder:

> The **API** (`api/`) has the hotel's details, its rooms and the bookings. The chat and the website both use it, so they share the bookings.
>
> The **chat** (`chat/`) is a React chat app built with [CopilotKit](https://docs.copilotkit.ai). This is where you work on the main quest.
>
> The **website** (`website/`) is the website of Hotel Seeblick. It embeds the Dextinity AI Hub chat. This is where you work on the side quest.

### Install dependencies

Run this in the root folder of the repository:

```bash
./install.sh
```

### Start the API

1. Navigate to the `api` folder
2. Start the development server:

    ```bash
    npm run dev
    ```

3. If it works, you should see the output `Hotel API listening on http://localhost:4112/api/hotel`

The API stores the bookings in `api/data/hotel.sqlite`. To start over without bookings, stop the API and delete the file.

### Start the chat

1. Navigate to the `chat` folder
2. Add your LLM API key:

    Create a `.env.local` file and add the key:

    ```
    OPENAI_BASE_URL=<base-url-here>
    OPENAI_API_KEY=<api-key-here>
    ```

    See `chat/.env` for other models and Azure OpenAI.

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Open your browser and navigate to `http://localhost:5173`. If

    - the API is running
    - the chat is running
    - the API key is correct

    you should now be able to chat with the **Basic chat**.

### Start the website (side quest)

1. Navigate to the `website` folder
2. Add your AI Hub API key:

    Create a `.env.local` file and add the key:

    ```
    VITE_AI_HUB_API_KEY=<api-key>
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Open your browser and navigate to `http://localhost:3000`. Switch on the "AI companion" in the header to open the chat.

## Step 2: Main quest – generative UI in the chat

Build the booking assistant in `chat/` with each approach of the [generative UI spectrum](https://www.copilotkit.ai/generative-ui-spectrum) and find out what works and what doesn't. The **Basic chat** works out of the box (text only). The other demos are skeletons and you have to implement them. Look for the `TODO`s.

> Hint: You usually have to touch the client side (`chat/src/demos`) and the server side (`chat/server/demos`).

1. **Controlled**: build components (e.g., room cards, booking list) and register them with `useComponent`
2. **Declarative (A2UI)**: build a catalog of building blocks with `createCatalog` and let the agent compose them
3. **Fully open**: let the agent write its own HTML/CSS/JS
4. **MCP Apps**: give the MCP server in `mcpServer.ts` a tool that ships its own UI ([ext-apps](https://github.com/modelcontextprotocol/ext-apps))

**Bonus:** Hotel Seeblick already has a distinctive CI. Make sure the agent's UI components always follow this CI, no matter the generation approach.

### Example scenarios

Some prompts you might want to try in each approach:

- "Which room do you recommend for a family with two kids?"
- "Compare all suites"
- "I'd like to book a room with a lake view from Friday to Sunday for 2 people"
- "Show my bookings" / "Cancel my booking"
- Something unexpected, e.g. "Show the prices of all rooms as a chart"

### Solution

The `solution` branch implements all four approaches, the bonus and the side quest. Each of them is in its own commit. `main` keeps the skeletons for the participants.

| Approach | Implementation | What we learned |
| --- | --- | --- |
| Controlled | Four MUI components (`chat/src/demos/02-controlled/components/`): room cards, room comparison, booking confirmation, booking list. Their buttons send chat messages with `useSendMessage`. | `useComponent` returns an empty tool result and asks for a follow-up by default, so the agent showed the same component again. `followUp: false` ends the turn instead. |
| Declarative (A2UI) | A catalog (`chat/src/demos/03-declarative/`) with hotel blocks (`RoomCard`, `BookingSummary`, `PriceTag`, `FeatureList`, `BarChart`) on top of the basic catalog. Button clicks go to the agent as `log_a2ui_event`. | The agent sees a click only in the run that follows it, not in the chat history. So the prompt tells it to name what was clicked in its reply; otherwise it forgets which room the guest wanted to book. |
| Fully open | Two sandbox functions (`chat/src/demos/04-open-generative-ui/sandboxFunctions.ts`): `sendChatMessage` for buttons, `loadImage` for room photos. | The sandbox has an opaque origin, and Chrome blocks its requests to `localhost` (Local Network Access). `loadImage` loads a photo in the app, through a Vite proxy for `/room-images`, and returns a data URL. |
| MCP Apps | `show_rooms` and `show_bookings` with one HTML app (`chat/server/demos/05-mcp-apps/app.html`). The app books and cancels with app-only tools (`visibility: ["app"]`) and tells the agent with `sendMessage`. | The model sends empty strings for optional parameters, so the tools treat empty values as missing. `tsx watch` does not restart when `app.html` changes. |

**Bonus (CI):** `chat/src/brand.ts` has the colors, fonts and rules of the website and is the only place they are defined. Each approach gets the CI in its own way:

- Controlled: the MUI theme (`chat/src/theme.ts`) uses `brand.ts`, so the components follow the CI without extra work.
- Declarative: the catalog replaces the basic `Text`, `Button`, `Card`, `Divider` and `TextField` with MUI versions that keep the A2UI schema (`brandedBasics.tsx`). A button whose action books something is always brass, whatever the agent chose.
- Fully open: the agent only follows the CI when it is told to, so `designSkill` gives it the rules and a base stylesheet. This is the only approach where the CI depends on the model.
- MCP Apps: the server puts the brand CSS into the app HTML.

**Side quest (Step 3):** the AI Hub chat on the website gets the context of the page and seven tools, see "Context and tools" in `website/README.md`. What we learned:

- The agent keeps the tools and the context of the start of its answer. So every tool that changes the page returns the new context, and the agent can continue with it in the same answer.
- Every page sends its own context, including the forms the guest is filling in. A page without context would leave the context of the previous page.
- Tools without `readOnlyHint` (`submitBooking`, `sendContactMessage`) show an approval in the chat. The agent didn't call them until the tool description said that the chat asks for approval itself.
- The context has today's date, so the agent understands "this Friday".
- The `Book now` button of the booking page did nothing, as the form had no `id`. This is fixed in its own commit.

## Step 3: Side quest – let the Dextinity AI Hub control the website

The website embeds our [Dextinity AI Hub](https://www.dextinity.com/de) chat, but the chat knows nothing about the website. Change that with the beta client tools and context, see [ai-hub-context-and-tools.md](ai-hub-context-and-tools.md). Start in `website/src/aiHub/AiHubChat.tsx`.

1. Set up the bridge to the `<ai-hub-chat>` element
2. Give the agent tools to use the website (some ideas: navigate, filter rooms, fill in forms, ...)
3. Pass context about what the user sees right now
4. Play around: how far can the agent drive the website?
