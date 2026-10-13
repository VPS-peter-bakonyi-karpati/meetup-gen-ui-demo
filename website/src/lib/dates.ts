const millisecondsPerDay = 24 * 60 * 60 * 1000

/** Date in the format YYYY-MM-DD, as used by `<input type="date">` and the hotel API */
export const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

export const addDays = (isoDate: string, days: number) => toIsoDate(new Date(Date.parse(isoDate) + days * millisecondsPerDay))

export const today = () => toIsoDate(new Date())

export const countNights = (checkIn: string, checkOut: string) =>
  checkIn && checkOut ? Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / millisecondsPerDay) : 0

export const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

/** Month in the format YYYY-MM */
export const thisMonth = () => today().slice(0, 7)

export const addMonths = (month: string, months: number) => {
  const [year, monthIndex] = month.split('-').map(Number)
  return toIsoDate(new Date(Date.UTC(year, monthIndex - 1 + months, 1))).slice(0, 7)
}

export const formatMonth = (month: string) =>
  new Date(`${month}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
