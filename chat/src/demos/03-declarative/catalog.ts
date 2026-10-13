import { Catalog } from '@a2ui/web_core/v0_9'
import { createCatalog, type CatalogRenderers } from '@copilotkit/a2ui-renderer'
import { brandedBasics } from './brandedBasics.tsx'
import { BarChart, BookingSummary, FeatureList, PriceTag, RoomCard } from './components.tsx'
import { definitions, type Definitions } from './definitions.ts'

// Declarative generative UI (A2UI): hotel building blocks on top of the basic catalog (Row, Column,
// Card, Text, Button, …). The agent composes them; buttons of the basic catalog send their action to the agent.

/** Must match `defaultCatalogId` in `server/demos/03-declarative/runtime.ts` */
const catalogId = 'seeblick://catalog'

// The renderers get resolved props (see `Props`), while `createCatalog` types them with the raw schema
// (which includes the `{ path }` bindings), so the types need a cast.
const renderers = { RoomCard, PriceTag, FeatureList, BookingSummary, BarChart } as unknown as CatalogRenderers<Definitions>

const hotelCatalog = createCatalog(definitions, renderers, { catalogId, includeBasicCatalog: true })

// The branded basic components replace the ones with the same name (the catalog keeps the last one per name)
export const catalog = new Catalog(
  catalogId,
  [...hotelCatalog.components.values(), ...brandedBasics],
  [...hotelCatalog.functions.values()],
)
