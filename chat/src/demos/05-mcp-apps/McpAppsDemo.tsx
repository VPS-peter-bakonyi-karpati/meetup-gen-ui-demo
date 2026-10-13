import { DemoChat } from '../shared/DemoChat.tsx'

// MCP Apps: the UI comes from an MCP server as a `ui://` HTML resource and runs in a sandboxed
// iframe. The app only embeds it, so there is nothing to do here: see `server/demos/05-mcp-apps/`.

export function McpAppsDemo() {
  return <DemoChat />
}
