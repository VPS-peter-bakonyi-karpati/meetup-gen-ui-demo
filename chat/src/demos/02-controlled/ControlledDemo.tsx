import { DemoChat } from '../shared/DemoChat.tsx'
import { NotImplementedAlert } from '../shared/NotImplementedAlert.tsx'

// Controlled generative UI: the developer ships finished components, the agent only
// decides *which* one to show and *what data* to pass in (taken from its hotel tools).
// TODO: register your components with `useComponent({ name, description, parameters, render })`.
// `useSendMessage` from `../shared/useSendMessage.ts` lets buttons in your components send chat messages.

export function ControlledDemo() {
  // TODO: remove the alert once the demo is implemented
  return <DemoChat header={<NotImplementedAlert />} />
}
