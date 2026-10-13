import { serverUrl } from "../../config.ts";
import { concierge, type DemoRuntime } from "../shared.ts";

// MCP Apps: tools of an MCP server that declare a `ui://` resource are rendered as sandboxed iframes.
// The MCP server in `mcpServer.ts` runs at `/mcp`.
export const hotelMcpServer = { type: "http", url: `${serverUrl}/mcp`, serverId: "hotel-mcp-server" } as const;

export const mcpAppsRuntime: DemoRuntime = {
    prompt: [
        concierge,
        "Show rooms with show_rooms and bookings with show_bookings instead of text. These tools load the data themselves.",
        "For recommendations and comparisons, pass the ids of the matching rooms to show_rooms (find them with list_rooms first). To show available rooms, pass the dates and guests.",
        "The guest books and cancels in the app, so after showing rooms or bookings, don't ask for more details: the app asks for them.",
        "When the guest tells you about a booking or cancellation they made in the app, just confirm it in one short sentence.",
        "Don't repeat the shown data in text: add at most one short sentence.",
    ].join(" "),
    options: {
        mcpApps: { servers: [hotelMcpServer] },
    },
};
