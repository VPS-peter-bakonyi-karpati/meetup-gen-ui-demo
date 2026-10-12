import { randomUUID, useAgent, useCopilotKit } from '@copilotkit/react-core/v2'
import { useCallback } from 'react'

/** Sends a message to the agent as if the user had typed it, e.g. from a button in a generated UI. */
export function useSendMessage() {
  const { agent } = useAgent()
  const { copilotkit } = useCopilotKit()

  return useCallback(
    (content: string) => {
      agent.addMessage({ id: randomUUID(), role: 'user', content })
      void copilotkit.runAgent({ agent })
    },
    [agent, copilotkit],
  )
}
