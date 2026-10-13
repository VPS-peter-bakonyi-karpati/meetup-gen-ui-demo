import { ButtonApi, CardApi, DividerApi, TextApi, TextFieldApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createReactComponent } from '@copilotkit/a2ui-renderer'
import { Box, Button, Card, Divider, OutlinedInput, Typography, type TypographyProps } from '@mui/material'
import { useId } from 'react'

// The basic catalog components that show text, buttons, surfaces and text fields have hardcoded styles (blue buttons,
// rounded corners). These replace them with the same schema, so the agent uses them as before, but they
// render with MUI and so follow the CI (`src/brand.ts`, `src/theme.ts`).

// Full width minus the margin that all basic components have
const fullWidth = 'calc(100% - 16px)'

// Smaller than the page headings, as they appear inside a chat message
const textVariants: Record<string, TypographyProps['variant']> = {
  h1: 'h4',
  h2: 'h5',
  h3: 'h6',
  h4: 'subtitle1',
  h5: 'subtitle2',
  caption: 'body2',
  body: 'body1',
}

const BrandedText = createReactComponent(TextApi, ({ props }) => (
  <Typography
    variant={textVariants[props.variant ?? 'body'] ?? 'body1'}
    sx={{ m: 1, fontWeight: props.variant === 'h4' || props.variant === 'h5' ? 700 : undefined, color: props.variant === 'caption' ? 'text.secondary' : undefined }}
  >
    {props.text ?? ''}
  </Typography>
))

const BrandedButton = createReactComponent(ButtonApi, ({ props, buildChild, context }) => {
  // Brass is only for booking, so buttons whose action books something are brass, whatever variant the agent chose
  const actionName: unknown = context.componentModel.properties.action?.event?.name
  const isBooking = typeof actionName === 'string' && /book/i.test(actionName)
  const variant = isBooking || props.variant === 'primary' ? 'contained' : props.variant === 'borderless' ? 'text' : 'outlined'
  return (
    <Button
      variant={variant}
      color={isBooking ? 'secondary' : 'primary'}
      disabled={props.isValid === false}
      onClick={props.action}
      sx={{ m: 1, '& *': { color: 'inherit', m: 0 } }}
    >
      {props.child ? buildChild(props.child) : null}
    </Button>
  )
})

const BrandedCard = createReactComponent(CardApi, ({ props, buildChild }) => (
  <Card sx={{ m: 1, p: 1, width: fullWidth }}>{props.child ? buildChild(props.child) : null}</Card>
))

const BrandedDivider = createReactComponent(DividerApi, ({ props }) => (
  <Divider orientation={props.axis === 'vertical' ? 'vertical' : 'horizontal'} flexItem sx={{ m: 1 }} />
))

const BrandedTextField = createReactComponent(TextFieldApi, ({ props }) => {
  const id = useId()
  const error = props.validationErrors?.[0]
  return (
    <Box sx={{ display: 'grid', gap: 0.75, m: 1, width: fullWidth }}>
      {props.label && (
        <Typography component="label" htmlFor={id} sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'text.secondary' }}>
          {props.label}
        </Typography>
      )}
      <OutlinedInput
        id={id}
        size="small"
        type={props.variant === 'number' ? 'number' : props.variant === 'obscured' ? 'password' : 'text'}
        multiline={props.variant === 'longText'}
        minRows={props.variant === 'longText' ? 3 : undefined}
        value={props.value ?? ''}
        onChange={(event) => props.setValue(event.target.value)}
        error={Boolean(error)}
        sx={{ bgcolor: 'background.paper' }}
      />
      {error && <Typography sx={{ color: 'error.main', fontSize: 13, fontWeight: 700 }}>{error}</Typography>}
    </Box>
  )
})

export const brandedBasics = [BrandedText, BrandedButton, BrandedCard, BrandedDivider, BrandedTextField]
