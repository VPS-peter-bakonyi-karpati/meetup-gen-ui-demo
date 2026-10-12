import { CopilotChat, useConfigureSuggestions } from '@copilotkit/react-core/v2'
import { Box } from '@mui/material'
import type { ReactNode } from 'react'

// The three use cases every demo covers
const hotelSuggestions = [
  'Which room do you recommend for a family with two kids?',
  "I'd like to book a room with a lake view",
  'Show my bookings',
]

interface DemoChatProps {
  placeholder?: string
  /** Prompts shown as suggestion pills before the first message */
  suggestions?: string[]
  /** Shown above the chat, e.g. a `NotImplementedAlert` */
  header?: ReactNode
}

export function DemoChat({ placeholder = 'Ask about rooms and bookings…', suggestions = hotelSuggestions, header }: DemoChatProps) {
  useConfigureSuggestions(
    {
      suggestions: suggestions.map((message) => ({ title: message, message })),
      available: 'before-first-message',
    },
    // Joined so inline arrays don't re-register the suggestions on every render
    [suggestions.join('\n')],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {header}
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <CopilotChat labels={{ chatInputPlaceholder: placeholder }} />
      </Box>
    </Box>
  )
}
