export type RegulatoryCommand = 'STOP' | 'START' | 'UNSTOP' | 'HELP'

export function isShareKeyword(text: string): boolean {
  return text.trim().toLowerCase() === 'share'
}

const STOP_KEYWORDS = new Set(['STOP', 'STOPALL', 'UNSUBSCRIBE', 'PAUSE', 'CANCEL', 'END', 'QUIT'])

const START_KEYWORDS = new Set(['START', 'UNSTOP', 'RESUME'])
const HELP_KEYWORDS = new Set(['HELP', 'INFO'])

export function parseRegulatoryCommand(text: string): RegulatoryCommand | null {
  const normalized = text.trim().toUpperCase()
  if (STOP_KEYWORDS.has(normalized)) return 'STOP'
  if (START_KEYWORDS.has(normalized)) {
    return normalized === 'UNSTOP' ? 'UNSTOP' : 'START'
  }
  if (HELP_KEYWORDS.has(normalized)) return 'HELP'
  return null
}

export function regulatoryResponse(command: RegulatoryCommand): string {
  switch (command) {
    case 'STOP':
      return 'You are unsubscribed from GiveCare messages. Reply START to re-subscribe. Reply HELP for support details.'
    case 'START':
    case 'UNSTOP':
      return 'You are re-subscribed to GiveCare messages. Reply STOP to unsubscribe, HELP for assistance.'
    case 'HELP':
      return 'GiveCare support: AI caregiver companion by SMS. Reply STOP to unsubscribe, START to resume. For immediate crisis support call or text 988.'
  }
}
