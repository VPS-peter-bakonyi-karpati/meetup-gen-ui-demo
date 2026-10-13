const euro = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

export const formatPrice = (amount: number) => euro.format(amount)

/** Formats a YYYY-MM-DD date; returns the input if it is not a complete date yet (e.g. while streaming) */
export function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? date : day.format(parsed)
}

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
