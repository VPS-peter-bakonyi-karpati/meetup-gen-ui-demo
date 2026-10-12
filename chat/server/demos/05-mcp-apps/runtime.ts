import { serverUrl } from "../../config.ts";
import { concierge, type DemoRuntime } from "../shared.ts";

// MCP Apps: tools of an MCP server that declare a `ui://` resource are rendered as sandboxed iframes.
// The MCP server in `mcpServer.ts` runs at `/mcp`.
export const hotelMcpServer = { type: "http", url: `${serverUrl}/mcp`, serverId: "hotel-mcp-server" } as const;

export const mcpAppsRuntime: DemoRuntime = {
    // TODO: tell the agent when to use the tools of your MCP server
    prompt: concierge,
    options: {
        // TODO: uncomment once `mcpServer.ts` registers at least one tool (tool discovery fails on a server without tools)
        // mcpApps: { servers: [hotelMcpServer] },
    },
};
