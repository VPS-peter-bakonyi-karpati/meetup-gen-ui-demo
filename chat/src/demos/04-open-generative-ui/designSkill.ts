import { brandCss, brandRules } from '../../brand.ts'

// Design guidelines for the generated UI (`openGenerativeUI.designSkill`), instead of CopilotKit's default
// shadcn-like style. The agent can only follow the CI if it is told, so it gets the rules and the base CSS.
export const designSkill = [
  'Every generated UI follows the CI of Hotel Seeblick, a small hotel at a lake in the Alps:',
  ...brandRules.map((rule) => `- ${rule}`),
  'Start your css with this base stylesheet, unchanged, and build on its variables and classes (e.g. <button class="book">, <button class="primary">, .eyebrow, .price):',
  brandCss.trim(),
].join('\n')
