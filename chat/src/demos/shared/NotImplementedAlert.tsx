import { Alert, AlertTitle } from '@mui/material'

/** Shown by the demo skeletons until they are implemented. See the README in the repository root. */
export function NotImplementedAlert() {
  return (
    <Alert severity="info" sx={{ m: 2, mb: 0 }}>
      <AlertTitle>Not implemented yet</AlertTitle>
      This demo still has to be implemented: see the README and the TODO comments in its files. Until then it is a
      plain text chat like the basic chat.
    </Alert>
  )
}
