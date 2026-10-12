import { createTheme } from '@mui/material'

// Colors and type of the Hotel Seeblick website (`website/src/index.css`)
export const brand = {
  forest: '#1F3A33',
  forestDeep: '#16291F',
  forestMid: '#2E5248',
  brass: '#8A5F2A',
  lake: '#2A6380',
  lakeMist: '#E4EFF3',
  lakeFoam: '#BFD9E6',
  sand: '#D9C9A8',
  ink: '#1E2422',
  stone: '#4A5551',
  fieldLine: '#B9C2BE',
}

const displayFont = "'Cormorant Garamond', Georgia, serif"
const bodyFont = "'Mulish', system-ui, sans-serif"

export const theme = createTheme({
  palette: {
    // Forest for actions, brass only for conversion (booking), lake for the water and prices
    primary: { main: brand.forest, dark: brand.forestDeep, light: brand.forestMid },
    secondary: { main: brand.brass },
    info: { main: brand.lake },
    text: { primary: brand.ink, secondary: brand.stone },
    divider: brand.fieldLine,
    background: { default: '#FFFFFF', paper: '#FFFFFF' },
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: bodyFont,
    h1: { fontFamily: displayFont, fontWeight: 500 },
    h2: { fontFamily: displayFont, fontWeight: 500 },
    h3: { fontFamily: displayFont, fontWeight: 500 },
    h4: { fontFamily: displayFont, fontWeight: 600 },
    h5: { fontFamily: displayFont, fontWeight: 600 },
    h6: { fontFamily: displayFont, fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2 },
    overline: { fontWeight: 700, letterSpacing: '0.3em' },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40, paddingInline: 20 } },
    },
    MuiCard: { defaultProps: { variant: 'outlined' } },
    MuiChip: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiAppBar: { defaultProps: { elevation: 0 } },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderLeft: '3px solid transparent',
          '&.Mui-selected': { borderLeftColor: brand.lake, backgroundColor: brand.lakeMist },
          '&.Mui-selected:hover': { backgroundColor: brand.lakeMist },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        ':focus-visible': { outline: `2px solid ${brand.lake}`, outlineOffset: 2 },
      },
    },
  },
})
