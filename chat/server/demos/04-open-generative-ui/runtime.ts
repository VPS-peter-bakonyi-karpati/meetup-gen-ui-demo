import { concierge, type DemoRuntime } from "../shared.ts";

// Open generative UI: the agent writes HTML/CSS/JS itself, which is rendered in a sandboxed iframe.
// TODO: enable the middleware with `openGenerativeUI: true` and tell the agent when to use it.
export const openGenerativeUIRuntime: DemoRuntime = {
    prompt: concierge,
    options: {},
};
