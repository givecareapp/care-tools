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

export type ResponseMap = Record<number, number>;

export type ZoneRiskLevel = "low" | "moderate" | "high";

export type OverallRiskLevel = "low" | "moderate" | "high";

export interface ValidationError {
  questionId: number;
  code: "unknown_question" | "out_of_range" | "missing_response";
  message: string;
  value?: number;
}

export interface ZoneScoreResult {
  zoneId: ZoneId;
  score: number | null;
  risk: ZoneRiskLevel | null;
  answered: number;
  total: number;
}

export interface FullAssessmentResult {
  zones: Record<ZoneId, ZoneScoreResult>;
  overallRisk: OverallRiskLevel | null;
  errors: ValidationError[];
}

export interface AdaptiveZoneScore {
  zoneId: ZoneId;
  score: number | null;
  confidence: number;
  answered: number;
  total: number;
}

export interface AdaptiveAssessmentResult {
  zones: Record<ZoneId, AdaptiveZoneScore>;
  errors: ValidationError[];
}

const questionById = new Map<number, QuestionDefinition>(
  GC_SDOH_30_QUESTIONS.map((question) => [question.id, question]),
);

const zoneById = new Map<ZoneId, ZoneDefinition>(
  GC_SDOH_30_ZONES.map((zone) => [zone.id, zone]),
);

const MIN_RESPONSE = 1;
const MAX_RESPONSE = 5;

const isValidResponseValue = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= MIN_RESPONSE && value <= MAX_RESPONSE;

const normalizeResponseValue = (questionId: number, value: number): number => {
  const question = questionById.get(questionId);
  if (!question) {
    return value;
  }
  return question.reverseScored ? MAX_RESPONSE + MIN_RESPONSE - value : value;
};

const normalizeResponseToScore = (questionId: number, value: number): number => {
  const normalized = normalizeResponseValue(questionId, value);
  return ((normalized - MIN_RESPONSE) / (MAX_RESPONSE - MIN_RESPONSE)) * 100;
};

const mean = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0) / values.length;

const buildZoneScores = (
  responses: ResponseMap,
  scoreScale: "1-5" | "0-100",
): Record<ZoneId, { score: number | null; answered: number; total: number }> => {
  const scores = {} as Record<ZoneId, { score: number | null; answered: number; total: number }>;

  for (const zone of GC_SDOH_30_ZONES) {
    const values: number[] = [];

    for (const questionId of zone.questionIds) {
      const response = responses[questionId];
      if (!isValidResponseValue(response)) {
        continue;
      }
      const normalized =
        scoreScale === "0-100"
          ? normalizeResponseToScore(questionId, response)
          : normalizeResponseValue(questionId, response);
      values.push(normalized);
    }

    const answered = values.length;
    const total = zone.questionIds.length;
    const score = answered > 0 ? mean(values) : null;
    scores[zone.id] = { score, answered, total };
  }

  return scores;
};

export const getQuestionDefinition = (questionId: number): QuestionDefinition | undefined =>
  questionById.get(questionId);

export const getZoneDefinition = (zoneId: ZoneId): ZoneDefinition | undefined => zoneById.get(zoneId);

export const validateResponses = (responses: ResponseMap): ValidationError[] => {
  const errors: ValidationError[] = [];

  for (const [rawId, rawValue] of Object.entries(responses)) {
    const questionId = Number(rawId);
    const question = Number.isInteger(questionId) ? questionById.get(questionId) : undefined;

    if (!question) {
      errors.push({
        questionId: Number.isFinite(questionId) ? questionId : -1,
        code: "unknown_question",
        message: `Unknown question ID: ${rawId}`,
        value: typeof rawValue === "number" ? rawValue : undefined,
      });
      continue;
    }

    if (!isValidResponseValue(rawValue)) {
      errors.push({
        questionId,
        code: "out_of_range",
        message: `Response for question ${questionId} must be between ${MIN_RESPONSE} and ${MAX_RESPONSE}.`,
        value: typeof rawValue === "number" ? rawValue : undefined,
      });
    }
  }

  return errors;
};

export const classifyZoneRisk = (score: number): ZoneRiskLevel => {
  if (score >= 3.5) {
    return "low";
  }
  if (score >= 2.5) {
    return "moderate";
  }
  return "high";
};

export const classifyOverallRisk = (
  zoneRisks: Record<ZoneId, ZoneRiskLevel>,
  options?: { critical?: boolean },
): OverallRiskLevel => {
  if (options?.critical) {
    return "high";
  }

  const risks = Object.values(zoneRisks);
  const highCount = risks.filter((risk) => risk === "high").length;

  if (highCount >= 3) {
    return "high";
  }

  if (highCount >= 1) {
    return "moderate";
  }

  const allLow = risks.every((risk) => risk === "low");
  return allLow ? "low" : "moderate";
};

export const scoreFullAssessment = (
  responses: ResponseMap,
  options?: { critical?: boolean },
): FullAssessmentResult => {
  const errors = validateResponses(responses);
  const baseScores = buildZoneScores(responses, "1-5");
  const zones = {} as Record<ZoneId, ZoneScoreResult>;
  const zoneRisks = {} as Record<ZoneId, ZoneRiskLevel>;
  let hasIncomplete = false;

  for (const zone of GC_SDOH_30_ZONES) {
    const baseScore = baseScores[zone.id];
    const answered = baseScore.answered;
    const total = baseScore.total;
    const isComplete = answered === total;

    if (!isComplete) {
      hasIncomplete = true;
      for (const questionId of zone.questionIds) {
        if (responses[questionId] === undefined) {
          errors.push({
            questionId,
            code: "missing_response",
            message: `Missing response for question ${questionId}.`,
          });
        }
      }
    }

    const score = isComplete ? baseScore.score : null;
    const risk = score !== null ? classifyZoneRisk(score) : null;
    if (risk) {
      zoneRisks[zone.id] = risk;
    }

    zones[zone.id] = {
      zoneId: zone.id,
      score,
      risk,
      answered,
      total,
    };
  }

  let overallRisk: OverallRiskLevel | null = null;
  if (options?.critical) {
    overallRisk = "high";
  } else if (!hasIncomplete) {
    overallRisk = classifyOverallRisk(zoneRisks);
  }

  return { zones, overallRisk, errors };
};

export const scoreAdaptiveAssessment = (responses: ResponseMap): AdaptiveAssessmentResult => {
  const errors = validateResponses(responses);
  const baseScores = buildZoneScores(responses, "0-100");
  const zones = {} as Record<ZoneId, AdaptiveZoneScore>;

  for (const zone of GC_SDOH_30_ZONES) {
    const baseScore = baseScores[zone.id];
    const confidence = baseScore.total > 0 ? baseScore.answered / baseScore.total : 0;

    zones[zone.id] = {
      zoneId: zone.id,
      score: baseScore.score,
      confidence,
      answered: baseScore.answered,
      total: baseScore.total,
    };
  }

  return { zones, errors };
};
