import { CopilotKitProvider } from '@copilotkit/react-core/v2'
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { demos } from './demos/index.ts'
import { brand, theme } from './theme.ts'

const drawerWidth = 280

/** The wave mark of the website, in front of eyebrows */
const WaveMark = () => (
  <svg aria-hidden="true" width="40" height="10" viewBox="0 0 40 10">
    <path d="M0 5 Q5 0 10 5 T20 5 T30 5 T40 5" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
)

export default function App() {
  const [activeDemoId, setActiveDemoId] = useState(demos[0].id)
  const activeDemo = demos.find((demo) => demo.id === activeDemoId) ?? demos[0]
  const DemoComponent = activeDemo.component

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: brand.forest }}>
          <Toolbar sx={{ gap: 3, minHeight: { xs: 72 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <Typography component="span" sx={{ fontFamily: theme.typography.h1.fontFamily, fontSize: 28, fontWeight: 600, letterSpacing: '0.04em', lineHeight: 1.1 }}>
                Hotel Seeblick
              </Typography>
              <Typography component="span" sx={{ fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: brand.sand }}>
                am See
              </Typography>
            </Box>
            <Typography component="span" sx={{ color: brand.sand, fontSize: 15, fontWeight: 600 }}>
              Generative UI Demos
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, borderRight: `1px solid ${brand.fieldLine}` } }}
        >
          <Toolbar sx={{ minHeight: { xs: 72 } }} />
          <Typography
            variant="overline"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, pt: 3, pb: 1, color: brand.lake, fontSize: 13, lineHeight: 1 }}
          >
            <WaveMark />
            Demos
          </Typography>
          <List>
            {demos.map((demo) => (
              <ListItemButton
                key={demo.id}
                selected={demo.id === activeDemoId}
                onClick={() => setActiveDemoId(demo.id)}
              >
                <ListItemText
                  primary={demo.title}
                  secondary={demo.description}
                  slotProps={{ primary: { sx: { fontWeight: 700 } } }}
                />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, bgcolor: brand.lakeMist }}>
          <Toolbar sx={{ minHeight: { xs: 72 } }} />
          <Box sx={{ flexGrow: 1, minHeight: 0 }}>
            {/* Keyed by demo so each demo gets a fresh provider and conversation */}
            <CopilotKitProvider
              key={activeDemo.id}
              runtimeUrl={`/api/copilotkit/${activeDemo.id}`}
              {...activeDemo.providerProps}
            >
              <DemoComponent />
            </CopilotKitProvider>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
