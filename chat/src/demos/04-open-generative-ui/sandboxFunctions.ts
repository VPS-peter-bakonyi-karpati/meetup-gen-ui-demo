import type { SandboxFunction } from '@copilotkit/react-core/v2'
import { z } from 'zod'

// Sandbox functions are the only way for the generated UI to talk back to the app.
// They are passed to the provider (`src/demos/index.ts`), outside of the chat, but sending a message
// needs the agent from inside the provider. So `OpenGenerativeUIDemo` sets this ref when it mounts.
export const sendMessageRef: { current?: (content: string) => void } = {}

/** Loads a room photo of the hotel API from the app's own origin (proxied by Vite) and returns it as a data URL */
async function loadRoomImage(url: string) {
  const { pathname } = new URL(url)
  if (!pathname.startsWith('/room-images/')) {
    throw new Error('Only room photos (imageUrl) can be loaded.')
  }
  const response = await fetch(pathname)
  if (!response.ok) {
    throw new Error(`The photo could not be loaded (${response.status}).`)
  }
  const blob = await response.blob()
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export const sandboxFunctions: SandboxFunction[] = [
  {
    name: 'sendChatMessage',
    description:
      'Sends a chat message to the assistant as if the guest had typed it, e.g. "I\'d like to book the Seezimmer (room 201)." Use it for buttons like Book, Details or Cancel.',
    parameters: z.object({ message: z.string() }),
    handler: async ({ message }: { message: string }) => {
      if (!sendMessageRef.current) {
        return { error: 'The chat is not ready.' }
      }
      sendMessageRef.current(message)
      return { sent: true }
    },
  },
  {
    // The sandbox has an opaque origin, and the browser blocks its requests to localhost
    // (Local Network Access), so `<img src="http://localhost:4112/…">` doesn't load in it.
    name: 'loadImage',
    description: 'Loads a room photo (imageUrl of a room) and returns it as a data URL to use as the src of an <img>.',
    parameters: z.object({ url: z.string() }),
    handler: async ({ url }: { url: string }) => loadRoomImage(url),
  },
]
