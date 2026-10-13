// Connection to the `bridge` of the `<ai-hub-chat>` web component (beta, see `ai-hub-context-and-tools.md`): the
// context tells the agent what the guest sees, and the host tools let the agent use the website.
import { useEffect } from 'react'
import type { Room } from '../content/rooms.ts'
import { today } from '../lib/dates.ts'

export interface HostTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  /** Without it, the guest has to approve every call in the chat */
  readOnlyHint?: boolean
  handler: (input: never) => Promise<unknown>
}

export interface AiHubBridge {
  setContext(context: Record<string, unknown> | null): void
  registerHostTools(tools: HostTool[]): void
}

let bridge: AiHubBridge | undefined
/** What the current page shows, set by the page with `useAiHubContext` */
let pageContext: Record<string, unknown> = {}

export function connectBridge(newBridge: AiHubBridge, tools: HostTool[]) {
  bridge = newBridge
  bridge.registerHostTools(tools)
  sendContext()
}

export function disconnectBridge() {
  bridge = undefined
}

/** The context of the agent: the current page and the date, which the agent needs for "this weekend" */
export const currentContext = () => ({ url: location.pathname + location.search, today: today(), ...pageContext })

const sendContext = () => bridge?.setContext(currentContext())

/** The facts of a room that the agent needs to talk about it, without the long description */
export const roomContext = ({ id, name, type, view, maxGuests, pricePerNight, size, features }: Room) => ({
  id,
  name,
  type,
  view,
  maxGuests,
  pricePerNight,
  size,
  features,
})

/** Tells the agent what the page shows. Every page calls it, so the context never belongs to the previous page. */
export function useAiHubContext(context: Record<string, unknown>) {
  // Compared as JSON, so a new object with the same content doesn't send the context again
  const json = JSON.stringify(context)
  useEffect(() => {
    pageContext = JSON.parse(json)
    sendContext()
  }, [json])
}

// Actions that need the state of a page, e.g. the name in the booking form, which isn't in the URL
type PageAction = (input: unknown) => unknown
const pageActions = new Map<string, PageAction>()

/** Makes an action of the mounted page available to the host tools (`runPageAction`) */
export function useAiHubAction<T>(name: string, action: (input: T) => unknown) {
  useEffect(() => {
    // The host tool passes the input that its schema describes
    const pageAction = action as PageAction
    pageActions.set(name, pageAction)
    return () => {
      if (pageActions.get(name) === pageAction) pageActions.delete(name)
    }
  }, [name, action])
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

/** Runs an action of the current page. Waits a moment for it, as the page may still be rendering after a navigation. */
export async function runPageAction(name: string, input: unknown, missingMessage: string) {
  for (let attempt = 0; attempt < 20 && !pageActions.has(name); attempt++) {
    await wait(50)
  }
  const action = pageActions.get(name)
  if (!action) throw new Error(missingMessage)
  return action(input)
}

/**
 * The context after a tool changed the page. The agent keeps the context of the start of its answer, so the tools
 * return the new one. Waits until `isReady` returns true (e.g. availability loaded), for at most two seconds.
 */
export async function contextAfterChange(isReady: (context: Record<string, unknown>) => boolean = () => true) {
  // Lets the page render and publish its context
  await wait(50)
  for (let attempt = 0; attempt < 40 && !isReady(currentContext()); attempt++) {
    await wait(50)
  }
  return currentContext()
}
