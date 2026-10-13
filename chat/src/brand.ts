// The CI of Hotel Seeblick (from the website, `website/src/index.css`), in one place for all generation approaches:
// the MUI theme (`theme.ts`) for the controlled and declarative demos, the design guidelines for the fully open
// demo, and the CSS of the MCP App (`server/demos/05-mcp-apps/`). No imports, so the server can use it too.

export const brand = {
  forest: '#1F3A33',
  forestDeep: '#16291F',
  forestMid: '#2E5248',
  brass: '#8A5F2A',
  brassDark: '#6F4C21',
  lake: '#2A6380',
  lakeMist: '#E4EFF3',
  lakeFoam: '#BFD9E6',
  sand: '#D9C9A8',
  ink: '#1E2422',
  stone: '#4A5551',
  fieldLine: '#B9C2BE',
  white: '#FFFFFF',
  error: '#A3261E',
}

export const fonts = {
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'Mulish', system-ui, sans-serif",
  /** Stylesheet that loads both fonts */
  url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Mulish:wght@400;600;700&display=swap',
}

/** The CI as rules, for agents that write their own UI */
export const brandRules = [
  `Fonts: headings in ${fonts.display} (weight 500–600), all other text in ${fonts.body}. Load them with <link rel="stylesheet" href="${fonts.url}">.`,
  `Colors: text ${brand.ink}, secondary text ${brand.stone}, surfaces white on a ${brand.lakeMist} background, borders 1px solid ${brand.fieldLine}.`,
  `Actions are forest (${brand.forest}, hover ${brand.forestDeep}) with white text. Brass (${brand.brass}, hover ${brand.brassDark}) is only for booking buttons. Secondary buttons have a forest border and forest text on white.`,
  `Prices and small accents are lake (${brand.lake}). Errors are ${brand.error}.`,
  'Square corners everywhere (border-radius 0), no shadows, no gradients.',
  `Eyebrows (small labels above headings): 12–13px, bold, uppercase, letter-spacing 0.3em, lake color.`,
  'Buttons: at least 40px high, 20px side padding, bold 15px text, no text-transform.',
  'Calm and spacious: 16–24px padding in cards, 12–16px gaps.',
]

/** Base CSS of the CI for plain HTML UIs, as CSS variables and element styles */
export const brandCss = `
@import url('${fonts.url}');
:root {
  --forest: ${brand.forest}; --forest-deep: ${brand.forestDeep}; --brass: ${brand.brass}; --brass-dark: ${brand.brassDark};
  --lake: ${brand.lake}; --lake-mist: ${brand.lakeMist}; --ink: ${brand.ink}; --stone: ${brand.stone};
  --field-line: ${brand.fieldLine}; --error: ${brand.error};
  --font-display: ${fonts.display}; --font-body: ${fonts.body};
}
* { box-sizing: border-box; border-radius: 0; }
body { margin: 0; font: 15px/1.5 var(--font-body); color: var(--ink); }
h1, h2, h3 { margin: 0; font-family: var(--font-display); font-weight: 500; line-height: 1.2; }
button { min-height: 40px; padding: 0 20px; border: 1px solid var(--forest); background: #fff; color: var(--forest); font: 700 15px var(--font-body); cursor: pointer; }
button:hover { border-color: var(--forest-deep); color: var(--forest-deep); }
button.primary { background: var(--forest); color: #fff; }
button.primary:hover { background: var(--forest-deep); color: #fff; }
button.book { background: var(--brass); border-color: var(--brass); color: #fff; }
button.book:hover { background: var(--brass-dark); border-color: var(--brass-dark); color: #fff; }
button:disabled { opacity: 0.45; cursor: not-allowed; }
label { display: grid; gap: 4px; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--stone); }
input { min-height: 40px; padding: 0 10px; border: 1px solid var(--field-line); background: #fff; color: var(--ink); font: 15px var(--font-body); letter-spacing: normal; text-transform: none; }
:focus-visible { outline: 2px solid var(--lake); outline-offset: 2px; }
.eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: var(--lake); }
.price { font-weight: 700; color: var(--lake); }
.error { color: var(--error); font-weight: 700; }
`
