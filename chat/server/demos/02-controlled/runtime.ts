import { concierge, type DemoRuntime } from "../shared.ts";

// Controlled generative UI: the frontend registers finished components with `useComponent`,
// which the agent sees as tools. Nothing is needed here except prompt instructions.
// TODO: tell the agent when to use your components.
export const controlledRuntime: DemoRuntime = {
    prompt: concierge,
};
