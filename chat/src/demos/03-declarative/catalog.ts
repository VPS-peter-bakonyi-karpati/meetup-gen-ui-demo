import { createCatalog, type CatalogRenderers } from '@copilotkit/a2ui-renderer'
import { BarChart, BookingSummary, FeatureList, PriceTag, RoomCard } from './components.tsx'
import { definitions, type Definitions } from './definitions.ts'

// Declarative generative UI (A2UI): hotel building blocks on top of the basic catalog (Row, Column,
// Card, Text, Button, …). The agent composes them; buttons of the basic catalog send their action to the agent.

/** Must match `defaultCatalogId` in `server/demos/03-declarative/runtime.ts` */
const catalogId = 'seeblick://catalog'

// The renderers get resolved props (see `Props`), while `createCatalog` types them with the raw schema
// (which includes the `{ path }` bindings), so the types need a cast.
const renderers = { RoomCard, PriceTag, FeatureList, BookingSummary, BarChart } as unknown as CatalogRenderers<Definitions>

export const catalog = createCatalog(definitions, renderers, { catalogId, includeBasicCatalog: true })
