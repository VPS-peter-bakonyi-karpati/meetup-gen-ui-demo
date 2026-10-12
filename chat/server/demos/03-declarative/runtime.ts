import { concierge, type DemoRuntime } from "../shared.ts";

// Declarative generative UI (A2UI): the agent composes a UI tree from a catalog of building blocks
// that the frontend registers via the provider's `a2ui` prop.
// TODO: enable the A2UI middleware, e.g. `a2ui: { injectA2UITool: true, defaultCatalogId: "<your catalog id>" }`,
// and tell the agent when to use it.
export const declarativeRuntime: DemoRuntime = {
    prompt: concierge,
    options: {},
};
