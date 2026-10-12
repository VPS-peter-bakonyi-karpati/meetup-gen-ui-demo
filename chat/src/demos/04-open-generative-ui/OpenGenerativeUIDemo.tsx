import { DemoChat } from '../shared/DemoChat.tsx'
import { NotImplementedAlert } from '../shared/NotImplementedAlert.tsx'

// Open generative UI: the agent writes HTML, CSS and JS itself, which is rendered in a sandboxed iframe.
// TODO: enable it in `src/demos/index.ts` via `providerProps: { openGenerativeUI: { ... } }`.
// Sandbox functions (`openGenerativeUI.sandboxFunctions`) are the only way for the generated UI
// to talk back to the app, e.g. to send a chat message with `useSendMessage`.

export function OpenGenerativeUIDemo() {
  // TODO: remove the alert once the demo is implemented
  return <DemoChat header={<NotImplementedAlert />} />
}
