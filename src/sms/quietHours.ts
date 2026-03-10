export function isQuietHoursNow(args: {
  now: number
  timezone: string
  enabled: boolean
  startHour?: number
  endHour?: number
}): boolean {
  if (!args.enabled) return false
  const start = args.startHour ?? 21
  const end = args.endHour ?? 8
  const hour = localHour(args.now, args.timezone)
  return isHourInQuietWindow(hour, start, end)
}

export function nextAllowedSendAt(args: {
  now: number
  timezone: string
  enabled: boolean
  startHour?: number
  endHour?: number
}): number {
  if (!args.enabled) return args.now
  const start = args.startHour ?? 21
  const end = args.endHour ?? 8
  let cursor = args.now
  for (let i = 0; i < 96; i += 1) {
    const hour = localHour(cursor, args.timezone)
    if (!isHourInQuietWindow(hour, start, end)) return cursor
    cursor += 30 * 60 * 1000
  }
  return args.now + 8 * 60 * 60 * 1000
}

function localHour(timestamp: number, timezone: string): number {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(timestamp))
  return Number.parseInt(formatted, 10)
}

function isHourInQuietWindow(hour: number, startHour: number, endHour: number): boolean {
  if (startHour === endHour) return false
  if (startHour < endHour) return hour >= startHour && hour < endHour
  return hour >= startHour || hour < endHour
}
