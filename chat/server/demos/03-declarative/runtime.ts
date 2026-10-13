import { concierge, type DemoRuntime } from "../shared.ts";

// Declarative generative UI (A2UI): the agent composes a UI tree from a catalog of building blocks
// that the frontend registers via the provider's `a2ui` prop. The frontend also sends the catalog's schema to the agent.
export const declarativeRuntime: DemoRuntime = {
    prompt: [
        concierge,
        "Show your results as a UI with render_a2ui instead of text: rooms, comparisons, bookings, booking confirmations and charts.",
        "Prefer the hotel components (RoomCard, BookingSummary, PriceTag, FeatureList, BarChart) and arrange them with Row, Column and List.",
        "Pass the data from your hotel tools unchanged, including imageUrl. Show several rooms side by side in a Row.",
        'Give every RoomCard a Row with a "Book" Button (action event "book_room") and a "Details" Button (action event "show_details"), and every listed booking a "Cancel" Button (action event "cancel_booking").',
        "Put the ids the action needs (roomId, bookingId, guestName) in the action's context.",
        "When the user clicks a button, you get a log_a2ui_event result: handle it like a message from the user, e.g. ask for the missing details before booking.",
        // The click is only part of that one run, not of the chat history, so the reply has to keep the details
        'You only see a click once, so name what was clicked in your reply, e.g. "To book the Seezimmer (room 201) from Oct 16 to 18 for 2 guests, what name should I use?"',
        "Don't repeat the shown data in text: add at most one short sentence.",
    ].join(" "),
    options: {
        // Must match `catalogId` in `src/demos/03-declarative/catalog.ts`
        a2ui: { injectA2UITool: true, defaultCatalogId: "seeblick://catalog" },
    },
};
