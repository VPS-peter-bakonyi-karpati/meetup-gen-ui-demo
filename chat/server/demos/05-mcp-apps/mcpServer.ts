// MCP server for the MCP Apps demo, served at `/mcp` (stateless Streamable HTTP).
// An MCP App is a tool that declares a `ui://` HTML resource; the host (CopilotKit) embeds that
// resource in a sandboxed iframe. See https://github.com/modelcontextprotocol/ext-apps.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { RESOURCE_MIME_TYPE, registerAppResource, registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { hotelApiUrl } from "../../config.ts";
import { cancelBooking, createBooking, listBookings, listRooms, searchRooms } from "../../hotel.ts";

const require = createRequire(import.meta.url);
// Browser bundle of the MCP Apps client SDK, served at `/mcp-assets/ext-apps.js` so the app HTML
// doesn't need a CDN: `import { App } from "<assetBaseUrl>/mcp-assets/ext-apps.js"`.
const appSdkBundle = readFileSync(
    require.resolve("@modelcontextprotocol/ext-apps/app-with-deps"),
    "utf8",
);

// One app for all tools: it shows rooms or bookings, depending on the tool result
const appUri = "ui://hotel/app.html";
const appHtml = readFileSync(new URL("./app.html", import.meta.url), "utf8");

/** Returns the data to the app (`structuredContent`) and a short summary to the model (`content`) */
async function toolResult(summary: string, load: () => Promise<Record<string, unknown>>): Promise<CallToolResult> {
    try {
        const data = await load();
        return { content: [{ type: "text", text: summary }], structuredContent: data };
    } catch (error) {
        return { content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }], isError: true };
    }
}

const stay = {
    checkIn: z.string().describe("Check-in date, YYYY-MM-DD"),
    checkOut: z.string().describe("Check-out date, YYYY-MM-DD"),
    guests: z.number().int().min(1),
};

// `assetBaseUrl` is the URL of this server, for loading assets from within the app HTML.
function createMcpServer(assetBaseUrl: string) {
    const server = new McpServer({ name: "hotel-mcp-server", version: "1.0.0" });

    registerAppTool(
        server,
        "show_rooms",
        {
            description:
                "Shows rooms as cards with photo, features and price, in an app where the guest can book them. With dates and guests, only the available rooms are shown, with their total price.",
            inputSchema: {
                guests: stay.guests.optional(),
                checkIn: stay.checkIn.optional(),
                checkOut: stay.checkOut.optional(),
                roomIds: z.array(z.string()).optional().describe("Only show these rooms, e.g. for a recommendation or comparison"),
            },
            _meta: { ui: { resourceUri: appUri } },
        },
        ({ guests, checkIn, checkOut, roomIds }) =>
            toolResult("The rooms are shown to the guest, who can book them in the app.", async () => {
                // Models often send empty values for the optional parameters, so these count as missing
                const hasStay = Boolean(checkIn && checkOut && guests);
                const rooms = (hasStay ? await searchRooms({ checkIn: checkIn!, checkOut: checkOut!, guests: guests! }) : await listRooms(guests || undefined)) as { id: string }[];
                return {
                    view: "rooms",
                    rooms: roomIds?.length ? rooms.filter((room) => roomIds.includes(room.id)) : rooms,
                    stay: hasStay ? { checkIn, checkOut, guests } : null,
                };
            }),
    );

    registerAppTool(
        server,
        "show_bookings",
        {
            description: "Shows the bookings made under the given guest name, in an app where the guest can cancel them.",
            inputSchema: { guestName: z.string() },
            _meta: { ui: { resourceUri: appUri } },
        },
        ({ guestName }) =>
            toolResult("The bookings are shown to the guest, who can cancel them in the app.", async () => ({
                view: "bookings",
                guestName,
                bookings: await listBookings(guestName),
            })),
    );

    // Only for the app (`visibility: ["app"]`): the model doesn't see these tools,
    // the app calls them with `app.callServerTool` when the guest clicks a button.
    registerAppTool(
        server,
        "book_room_from_app",
        {
            description: "Books a room for the guest.",
            inputSchema: { roomId: z.string(), guestName: z.string(), ...stay },
            _meta: { ui: { resourceUri: appUri, visibility: ["app"] } },
        },
        (input) => toolResult("Booked.", async () => ({ booking: await createBooking(input) })),
    );

    registerAppTool(
        server,
        "cancel_booking_from_app",
        {
            description: "Cancels a booking of the guest.",
            inputSchema: { bookingId: z.number().int(), guestName: z.string() },
            _meta: { ui: { resourceUri: appUri, visibility: ["app"] } },
        },
        (input) => toolResult("Cancelled.", async () => ({ cancelled: await cancelBooking(input) })),
    );

    registerAppResource(server, "Hotel Seeblick", appUri, {}, async () => ({
        contents: [
            {
                uri: appUri,
                mimeType: RESOURCE_MIME_TYPE,
                text: appHtml.replaceAll("{{ASSET_BASE_URL}}", assetBaseUrl),
                // The app loads the SDK from this server and the room photos from the hotel API
                _meta: { ui: { csp: { resourceDomains: [assetBaseUrl, hotelApiUrl] } } },
            },
        ],
    }));

    return server;
}

/** Handles `/mcp` and `/mcp-assets/*`. Returns false for other paths. */
export async function handleMcpRequest(req: IncomingMessage, res: ServerResponse, assetBaseUrl: string) {
    const { pathname } = new URL(req.url ?? "/", "http://localhost");

    if (pathname === "/mcp-assets/ext-apps.js") {
        // Module scripts loaded cross-origin from the iframe need CORS.
        res.writeHead(200, { "Content-Type": "text/javascript", "Access-Control-Allow-Origin": "*" });
        res.end(appSdkBundle);
        return true;
    }

    if (pathname === "/mcp") {
        const server = createMcpServer(assetBaseUrl);
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        res.on("close", () => {
            void transport.close();
            void server.close();
        });
        await server.connect(transport);
        await transport.handleRequest(req, res);
        return true;
    }

    return false;
}
