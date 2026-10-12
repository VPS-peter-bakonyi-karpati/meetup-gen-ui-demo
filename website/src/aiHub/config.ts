export const apiKey = import.meta.env.VITE_AI_HUB_API_KEY
export const widgetId = import.meta.env.VITE_AI_HUB_WIDGET_ID || undefined

if (!apiKey) {
  console.warn('AI Hub chat is disabled: set VITE_AI_HUB_API_KEY in .env.local')
}

export const aiHubAvailable = Boolean(apiKey)
