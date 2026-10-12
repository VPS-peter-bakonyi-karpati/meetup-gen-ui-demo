import { createServer } from "node:http";
import { BuiltInAgent, CopilotRuntime } from "@copilotkit/runtime/v2";
import { createCopilotNodeListener } from "@copilotkit/runtime/v2/node";
import { basicChatRuntime } from "./demos/01-basic-chat/runtime.ts";
import { controlledRuntime } from "./demos/02-controlled/runtime.ts";
import { declarativeRuntime } from "./demos/03-declarative/runtime.ts";
import { openGenerativeUIRuntime } from "./demos/04-open-generative-ui/runtime.ts";
import { handleMcpRequest } from "./demos/05-mcp-apps/mcpServer.ts";
import { mcpAppsRuntime } from "./demos/05-mcp-apps/runtime.ts";
import { port, serverUrl } from "./config.ts";
import type { DemoRuntime } from "./demos/shared.ts";
import { hotelTools } from "./hotel.ts";

// "<provider>/<model>", e.g. "openai/gpt-5.6-terra" or "anthropic/claude-sonnet-4-6".
// The provider reads its key from OPENAI_API_KEY / ANTHROPIC_API_KEY (and optionally OPENAI_BASE_URL).
const model = process.env.MODEL ?? "openai/gpt-5.6-terra";

// One runtime per demo, so each demo only gets the generative UI middleware it shows.
// The demo ids must match `src/demos/index.ts`.
const demoRuntimes: Record<string, DemoRuntime> = {
    "basic-chat": basicChatRuntime,
    controlled: controlledRuntime,
    declarative: declarativeRuntime,
    "open-generative-ui": openGenerativeUIRuntime,
    "mcp-apps": mcpAppsRuntime,
};

const listeners = Object.entries(demoRuntimes).map(([id, { prompt, options }]) => {
    const basePath = `/api/copilotkit/${id}`;
    const runtime = new CopilotRuntime({
        ...options,
        // Several steps, so the agent can e.g. search rooms and then render them in one turn
        agents: { default: new BuiltInAgent({ model, prompt, tools: Object.values(hotelTools), maxSteps: 10 }) },
    });
    return { basePath, listener: createCopilotNodeListener({ runtime, basePath }) };
});

createServer(async (req, res) => {
    const url = req.url ?? "/";
    const match = listeners.find(({ basePath }) => url === basePath || url.startsWith(`${basePath}/`));
    if (match) {
        return match.listener(req, res);
    }
    if (await handleMcpRequest(req, res, serverUrl)) {
        return;
    }
    res.writeHead(404).end();
}).listen(port, () => {
    console.log(`CopilotKit runtimes listening on ${serverUrl}/api/copilotkit/<demo> (model: ${model})`);
    console.log(`MCP server listening on ${serverUrl}/mcp`);
});
