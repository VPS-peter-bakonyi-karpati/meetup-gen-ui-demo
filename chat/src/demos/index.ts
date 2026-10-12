import type { CopilotKitProviderProps } from '@copilotkit/react-core/v2'
import type { ComponentType } from 'react'
import { BasicChatDemo } from './01-basic-chat/BasicChatDemo.tsx'
import { ControlledDemo } from './02-controlled/ControlledDemo.tsx'
import { DeclarativeDemo } from './03-declarative/DeclarativeDemo.tsx'
import { OpenGenerativeUIDemo } from './04-open-generative-ui/OpenGenerativeUIDemo.tsx'
import { McpAppsDemo } from './05-mcp-apps/McpAppsDemo.tsx'

export interface Demo {
  /** Also selects the runtime: `/api/copilotkit/<id>` (see `server/index.ts` and `server/demos/`) */
  id: string
  title: string
  description: string
  component: ComponentType
  providerProps?: Partial<CopilotKitProviderProps>
}

// Ordered along the generative UI spectrum, from developer-controlled to agent-controlled
// (https://www.copilotkit.ai/generative-ui-spectrum), followed by MCP Apps.
export const demos: Demo[] = [
  {
    id: 'basic-chat',
    title: 'Basic chat',
    description: 'Plain LLM chat without generative UI.',
    component: BasicChatDemo,
  },
  {
    id: 'controlled',
    title: 'Controlled',
    description: 'Agent picks a prebuilt component and fills in the data.',
    component: ControlledDemo,
  },
  {
    id: 'declarative',
    title: 'Declarative (A2UI)',
    description: 'Agent composes a UI from a catalog of building blocks.',
    component: DeclarativeDemo,
  },
  {
    id: 'open-generative-ui',
    title: 'Fully open',
    description: 'Agent writes HTML/CSS/JS, rendered in a sandbox.',
    component: OpenGenerativeUIDemo,
  },
  {
    id: 'mcp-apps',
    title: 'MCP Apps',
    description: 'MCP server ships its own UI, embedded in a sandbox.',
    component: McpAppsDemo,
  },
]
