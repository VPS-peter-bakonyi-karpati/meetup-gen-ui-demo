import { createTheme } from '@mui/material'
import { brand, fonts } from './brand.ts'

export const theme = createTheme({
  palette: {
    // Forest for actions, brass only for conversion (booking), lake for the water and prices
    primary: { main: brand.forest, dark: brand.forestDeep, light: brand.forestMid },
    secondary: { main: brand.brass },
    info: { main: brand.lake },
    text: { primary: brand.ink, secondary: brand.stone },
    divider: brand.fieldLine,
    background: { default: brand.white, paper: brand.white },
    error: { main: brand.error },
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: fonts.body,
    h1: { fontFamily: fonts.display, fontWeight: 500 },
    h2: { fontFamily: fonts.display, fontWeight: 500 },
    h3: { fontFamily: fonts.display, fontWeight: 500 },
    h4: { fontFamily: fonts.display, fontWeight: 600 },
    h5: { fontFamily: fonts.display, fontWeight: 600 },
    h6: { fontFamily: fonts.display, fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2 },
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
