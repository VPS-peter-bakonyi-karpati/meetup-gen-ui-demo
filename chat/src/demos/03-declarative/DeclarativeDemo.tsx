import { DemoChat } from '../shared/DemoChat.tsx'
import { NotImplementedAlert } from '../shared/NotImplementedAlert.tsx'

// Declarative generative UI (A2UI): the agent composes a UI from a catalog of building blocks.
// TODO: create a catalog with `createCatalog` from `@copilotkit/a2ui-renderer` and register it
// in `src/demos/index.ts` via `providerProps: { a2ui: { catalog } }`.

export function DeclarativeDemo() {
  // TODO: remove the alert once the demo is implemented
  return <DemoChat header={<NotImplementedAlert />} />
}
