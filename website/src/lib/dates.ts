const millisecondsPerDay = 24 * 60 * 60 * 1000

/** Date in the format YYYY-MM-DD, as used by `<input type="date">` and the hotel API */
export const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

export const addDays = (isoDate: string, days: number) => toIsoDate(new Date(Date.parse(isoDate) + days * millisecondsPerDay))

export const today = () => toIsoDate(new Date())

export const countNights = (checkIn: string, checkOut: string) =>
  checkIn && checkOut ? Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / millisecondsPerDay) : 0

export const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
