export type ZoneId = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

export type ScaleType = "frequency" | "quality";

export interface QuestionDefinition {
  id: number;
  zoneId: ZoneId;
  text: string;
  reverseScored: boolean;
  scale: ScaleType;
}

export interface ZoneDefinition {
  id: ZoneId;
  name: string;
  questionIds: readonly number[];
}

const reverseScoredIds: ReadonlySet<number> = new Set([11, 13, 14, 15, 16, 17, 18, 19]);

export const GC_SDOH_30_QUESTIONS: readonly QuestionDefinition[] = [
  {
    id: 1,
    zoneId: "P1",
    text: "I have people I can rely on for emotional support.",
    reverseScored: reverseScoredIds.has(1),
    scale: "frequency",
  },
  {
    id: 2,
    zoneId: "P1",
    text: "I feel connected to my community.",
    reverseScored: reverseScoredIds.has(2),
    scale: "frequency",
  },
  {
    id: 3,
    zoneId: "P1",
    text: "I have someone to help in an emergency.",
    reverseScored: reverseScoredIds.has(3),
    scale: "frequency",
  },
  {
    id: 4,
    zoneId: "P1",
    text: "I can talk to others about my caregiving challenges.",
    reverseScored: reverseScoredIds.has(4),
    scale: "frequency",
  },
  {
    id: 5,
    zoneId: "P1",
    text: "I feel supported by family and friends.",
    reverseScored: reverseScoredIds.has(5),
    scale: "frequency",
  },
  {
    id: 6,
    zoneId: "P1",
    text: "I have people who understand what I'm going through.",
    reverseScored: reverseScoredIds.has(6),
    scale: "frequency",
  },
  {
    id: 7,
    zoneId: "P1",
    text: "I can ask for help when I need it.",
    reverseScored: reverseScoredIds.has(7),
    scale: "frequency",
  },
  {
    id: 8,
    zoneId: "P1",
    text: "I participate in social activities.",
    reverseScored: reverseScoredIds.has(8),
    scale: "frequency",
  },
  {
    id: 9,
    zoneId: "P3",
    text: "My housing is stable and secure.",
    reverseScored: reverseScoredIds.has(9),
    scale: "frequency",
  },
  {
    id: 10,
    zoneId: "P3",
    text: "My home is safe and in good condition.",
    reverseScored: reverseScoredIds.has(10),
    scale: "frequency",
  },
  {
    id: 11,
    zoneId: "P3",
    text: "I worry about losing my housing.",
    reverseScored: reverseScoredIds.has(11),
    scale: "frequency",
  },
  {
    id: 12,
    zoneId: "P3",
    text: "My housing meets my caregiving needs.",
    reverseScored: reverseScoredIds.has(12),
    scale: "frequency",
  },
  {
    id: 13,
    zoneId: "P4",
    text: "I worry about having enough money for basic needs.",
    reverseScored: reverseScoredIds.has(13),
    scale: "frequency",
  },
  {
    id: 14,
    zoneId: "P4",
    text: "I have difficulty paying for medical care.",
    reverseScored: reverseScoredIds.has(14),
    scale: "frequency",
  },
  {
    id: 15,
    zoneId: "P4",
    text: "I have difficulty paying for medications.",
    reverseScored: reverseScoredIds.has(15),
    scale: "frequency",
  },
  {
    id: 16,
    zoneId: "P4",
    text: "I worry about housing costs.",
    reverseScored: reverseScoredIds.has(16),
    scale: "frequency",
  },
  {
    id: 17,
    zoneId: "P4",
    text: "I have difficulty paying for utilities.",
    reverseScored: reverseScoredIds.has(17),
    scale: "frequency",
  },
  {
    id: 18,
    zoneId: "P4",
    text: "I have difficulty paying for food.",
    reverseScored: reverseScoredIds.has(18),
    scale: "frequency",
  },
  {
    id: 19,
    zoneId: "P4",
    text: "Transportation costs are a burden.",
    reverseScored: reverseScoredIds.has(19),
    scale: "frequency",
  },
  {
    id: 20,
    zoneId: "P4",
    text: "I can afford internet/phone service.",
    reverseScored: reverseScoredIds.has(20),
    scale: "frequency",
  },
  {
    id: 21,
    zoneId: "P5",
    text: "I can easily communicate with healthcare providers.",
    reverseScored: reverseScoredIds.has(21),
    scale: "frequency",
  },
  {
    id: 22,
    zoneId: "P5",
    text: "I understand the medical information I receive.",
    reverseScored: reverseScoredIds.has(22),
    scale: "frequency",
  },
  {
    id: 23,
    zoneId: "P5",
    text: "I can coordinate care between multiple providers.",
    reverseScored: reverseScoredIds.has(23),
    scale: "frequency",
  },
  {
    id: 24,
    zoneId: "P5",
    text: "I have access to medical records when needed.",
    reverseScored: reverseScoredIds.has(24),
    scale: "frequency",
  },
  {
    id: 25,
    zoneId: "P5",
    text: "I have legal documents in order (power of attorney, etc.).",
    reverseScored: reverseScoredIds.has(25),
    scale: "frequency",
  },
  {
    id: 26,
    zoneId: "P5",
    text: "I understand my rights as a caregiver.",
    reverseScored: reverseScoredIds.has(26),
    scale: "frequency",
  },
  {
    id: 27,
    zoneId: "P6",
    text: "I feel prepared for caregiving emergencies.",
    reverseScored: reverseScoredIds.has(27),
    scale: "frequency",
  },
  {
    id: 28,
    zoneId: "P6",
    text: "I feel safe in my neighborhood.",
    reverseScored: reverseScoredIds.has(28),
    scale: "frequency",
  },
  {
    id: 29,
    zoneId: "P2",
    text: "How often do you feel physically exhausted from caregiving?",
    reverseScored: reverseScoredIds.has(29),
    scale: "frequency",
  },
  {
    id: 30,
    zoneId: "P2",
    text: "How would you rate your sleep quality overall?",
    reverseScored: reverseScoredIds.has(30),
    scale: "quality",
  },
];

export const GC_SDOH_30_ZONES: readonly ZoneDefinition[] = [
  { id: "P1", name: "Relationship & Social Support", questionIds: [1, 2, 3, 4, 5, 6, 7, 8] },
  { id: "P2", name: "Physical Health", questionIds: [29, 30] },
  { id: "P3", name: "Housing & Environment", questionIds: [9, 10, 11, 12] },
  { id: "P4", name: "Financial Resources", questionIds: [13, 14, 15, 16, 17, 18, 19, 20] },
  { id: "P5", name: "Legal & Navigation", questionIds: [21, 22, 23, 24, 25, 26] },
  { id: "P6", name: "Emotional Wellbeing", questionIds: [27, 28] },
];

export const GC_SDOH_30_REVERSE_SCORED_IDS = reverseScoredIds;
