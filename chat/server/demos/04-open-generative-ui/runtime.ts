import { concierge, type DemoRuntime } from "../shared.ts";

// Open generative UI: the agent writes HTML/CSS/JS itself, which is rendered in a sandboxed iframe.
export const openGenerativeUIRuntime: DemoRuntime = {
    prompt: [
        concierge,
        "Show your results as a UI with generateSandboxedUi instead of text: rooms, comparisons, bookings, booking confirmations and charts.",
        "Ask your questions to the guest in plain text, not in a generated UI.",
        "Call generateSandboxedUi only after your hotel tools have returned, and put their data inline in the HTML. Never make up data.",
        // The sandbox can't load images from localhost, see `loadImage` in `src/demos/04-open-generative-ui/sandboxFunctions.ts`
        'Show room photos, but the sandbox can\'t load imageUrl directly: write <img data-image-url="<imageUrl>" alt="<room name>"> and load them in your first jsExpression with document.querySelectorAll("img[data-image-url]").forEach(async (img) => { img.src = await Websandbox.connection.remote.loadImage({ url: img.dataset.imageUrl }); }).',
        'For buttons like "Book", "Details" or "Cancel", call the sandbox function sendChatMessage with a clear sentence from the guest that names the room or booking, e.g. "I\'d like to book the Seezimmer (room 201) from 2026-10-16 to 2026-10-18 for 2 guests."',
        "Don't repeat the shown data in text: add at most one short sentence.",
    ].join(" "),
    options: { openGenerativeUI: true },
};
