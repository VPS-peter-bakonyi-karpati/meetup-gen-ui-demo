import { DemoChat } from '../shared/DemoChat.tsx'
import { NotImplementedAlert } from '../shared/NotImplementedAlert.tsx'

// MCP Apps: the UI comes from an MCP server as a `ui://` HTML resource and runs in a sandboxed
// iframe. The app only embeds it, so there is nothing to do here.
// TODO: build the MCP server in `server/demos/05-mcp-apps/mcpServer.ts`.

export function McpAppsDemo() {
  // TODO: remove the alert once the demo is implemented
  return <DemoChat header={<NotImplementedAlert />} />
}
