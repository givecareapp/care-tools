/**
 * Zone-matched intervention tips.
 * Static v1 intervention bank for weekly tip emails.
 */

import { ZONE_LABELS, type ZoneCode } from '../scoring/givecareScore'

export type ZoneId = ZoneCode

export interface Intervention {
  title: string
  description: string
  duration: string
  category: string
}

export const ZONE_INTERVENTIONS: Record<ZoneId, Intervention> = {
  P1: {
    title: '5-Minute Body Reset',
    description:
      'Stand up, shake out your hands, roll your shoulders back 5 times, and take 3 slow breaths. Physical tension accumulates without us noticing — this resets it.',
    duration: '5 minutes',
    category: 'Physical',
  },
  P2: {
    title: 'Name It to Tame It',
    description:
      "Pause and name the emotion you're feeling right now — out loud or in writing. Research shows that labeling emotions reduces their intensity by activating the prefrontal cortex.",
    duration: '2 minutes',
    category: 'Emotional',
  },
  P3: {
    title: 'One Real Text',
    description:
      'Send one genuine text to someone you haven\'t talked to in a while. Not a meme — something real. "Thinking of you" counts. Social isolation compounds silently.',
    duration: '3 minutes',
    category: 'Social',
  },
  P4: {
    title: 'Benefits Quick Check',
    description:
      "Check if there are programs you haven't applied for yet. Many caregivers qualify for assistance they don't know about.",
    duration: '10 minutes',
    category: 'Financial',
  },
  P5: {
    title: 'Micro-Break Bookmark',
    description:
      "Pick one 15-minute window this week that's yours — no caregiving, no chores. Write it in your calendar now. The act of scheduling it makes it real.",
    duration: '2 minutes',
    category: 'Personal Time',
  },
  P6: {
    title: 'One Next Step',
    description:
      "Write down the one thing you're most uncertain about right now. Then write one small step you could take this week. Uncertainty shrinks when you give it a concrete next action.",
    duration: '5 minutes',
    category: 'Planning',
  },
}

export const ZONE_NAMES: Record<ZoneId, string> = { ...ZONE_LABELS }

/** Look up intervention for a zone, falling back to P2 (Emotional) for unknown zones. */
export function getInterventionForZone(zone: string): {
  intervention: Intervention
  zoneName: string
} {
  const zoneId = zone as ZoneId
  return {
    intervention: ZONE_INTERVENTIONS[zoneId] ?? ZONE_INTERVENTIONS.P2,
    zoneName: ZONE_NAMES[zoneId as ZoneId] ?? ZONE_NAMES.P2,
  }
}
