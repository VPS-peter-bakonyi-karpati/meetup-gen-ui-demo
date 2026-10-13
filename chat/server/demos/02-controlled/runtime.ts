import { concierge, type DemoRuntime } from "../shared.ts";

// Controlled generative UI: the frontend registers finished components with `useComponent`,
// which the agent sees as tools. Nothing is needed here except prompt instructions.
export const controlledRuntime: DemoRuntime = {
    prompt: [
        concierge,
        "Show your results with the UI components instead of text:",
        "show_rooms for recommendations and available rooms, compare_rooms for comparisons, show_booking_confirmation after book_room, and show_bookings for the bookings of a guest (also when there are none).",
        "Pass the data from your hotel tools unchanged, including imageUrl, and only the rooms or bookings that answer the question.",
        "Showing a component ends your turn, so call it last and only once.",
        "Don't repeat the shown data in text: write at most one short sentence before the component, e.g. why the rooms fit.",
    ].join(" "),
};
