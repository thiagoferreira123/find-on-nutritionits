import type { CatalogDailyHours, CatalogWeeklyHours } from './types'

const DAYS = [
  ['monday', 'Seg'], ['tuesday', 'Ter'], ['wednesday', 'Qua'],
  ['thursday', 'Qui'], ['friday', 'Sex'], ['saturday', 'Sáb'],
  ['sunday', 'Dom'],
] as const

export function publicScheduleUrl(value: string | null | undefined, appOrigin: string): string | null {
  if (!value) return null
  try {
    const parsed = value.startsWith('/')
      ? new URL(value, `${appOrigin.replace(/\/+$/, '')}/`)
      : new URL(value)
    const url = parsed.pathname.startsWith('/agenda/')
      ? new URL(`${parsed.pathname}${parsed.search}${parsed.hash}`, `${appOrigin.replace(/\/+$/, '')}/`)
      : parsed
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

function hoursLabel(hours: CatalogDailyHours): string {
  const start = hours.start.slice(0, 5)
  const end = hours.end.slice(0, 5)
  if (hours.break_start && hours.break_end) {
    return `${start}–${hours.break_start.slice(0, 5)} e ${hours.break_end.slice(0, 5)}–${end}`
  }
  return `${start}–${end}`
}

export function groupWeeklyHours(hours: CatalogWeeklyHours | null | undefined): Array<{ days: string; hours: string }> {
  const groups: Array<{ first: string; last: string; hours: string }> = []
  for (const [key, label] of DAYS) {
    const dayHours = hours?.[key]
    if (!dayHours) continue
    const formatted = hoursLabel(dayHours)
    const previous = groups.at(-1)
    const previousIndex = previous ? DAYS.findIndex(([, day]) => day === previous.last) : -2
    const currentIndex = DAYS.findIndex(([day]) => day === key)
    if (previous && previous.hours === formatted && currentIndex === previousIndex + 1) {
      previous.last = label
    } else {
      groups.push({ first: label, last: label, hours: formatted })
    }
  }
  return groups.map((group) => ({
    days: group.first === group.last ? group.first : `${group.first}–${group.last}`,
    hours: group.hours,
  }))
}
