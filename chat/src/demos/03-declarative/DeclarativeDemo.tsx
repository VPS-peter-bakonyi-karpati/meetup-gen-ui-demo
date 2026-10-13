import { DemoChat } from '../shared/DemoChat.tsx'

// Declarative generative UI (A2UI): the agent composes a UI from a catalog of building blocks.
// The catalog is in `catalog.ts` and registered in `src/demos/index.ts` via `providerProps: { a2ui: { catalog } }`.
// Buttons in the generated UI send their action to the agent, so nothing else is needed here.

export function DeclarativeDemo() {
  return <DemoChat />
}
