// MCP server for the MCP Apps demo, served at `/mcp` (stateless Streamable HTTP).
// An MCP App is a tool that declares a `ui://` HTML resource; the host (CopilotKit) embeds that
// resource in a sandboxed iframe. See https://github.com/modelcontextprotocol/ext-apps.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const require = createRequire(import.meta.url);
// Browser bundle of the MCP Apps client SDK, served at `/mcp-assets/ext-apps.js` so the app HTML
// doesn't need a CDN: `import { App } from "<assetBaseUrl>/mcp-assets/ext-apps.js"`.
const appSdkBundle = readFileSync(
    require.resolve("@modelcontextprotocol/ext-apps/app-with-deps"),
    "utf8",
);

// `assetBaseUrl` is the URL of this server, for loading assets from within the app HTML.
function createMcpServer(_assetBaseUrl: string) {
    const server = new McpServer({ name: "hotel-mcp-server", version: "1.0.0" });

    // TODO: register your tools and their UI resources with `registerAppTool` and `registerAppResource`
    // from "@modelcontextprotocol/ext-apps/server". `server/hotel.ts` has functions to call the hotel API.

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
