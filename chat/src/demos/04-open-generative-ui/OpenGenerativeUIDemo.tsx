import { useEffect } from 'react'
import { DemoChat } from '../shared/DemoChat.tsx'
import { useSendMessage } from '../shared/useSendMessage.ts'
import { sendMessageRef } from './sandboxFunctions.ts'

// Open generative UI: the agent writes HTML, CSS and JS itself, which is rendered in a sandboxed iframe.
// It is enabled in `src/demos/index.ts` via `providerProps: { openGenerativeUI: { sandboxFunctions } }`.
// Sandbox functions (`sandboxFunctions.ts`) are the only way for the generated UI to talk back to the app.

export function OpenGenerativeUIDemo() {
  const sendMessage = useSendMessage()
  useEffect(() => {
    sendMessageRef.current = sendMessage
    return () => {
      sendMessageRef.current = undefined
    }
  }, [sendMessage])

  return <DemoChat />
}
