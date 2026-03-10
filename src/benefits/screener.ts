/**
 * Benefits screener — pure comparator that matches caregiver facts
 * against benefit program eligibility criteria.
 *
 * No DB access, no side effects. Suitable for direct testing.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CaregiverFacts {
  state?: string
  household_size?: string
  household_income_monthly?: string
  household_assets?: string
  applicant_age?: string
  care_recipient_age?: string
  citizenship?: string
  disability?: string
  care_recipient_disability?: string
  veteran_status?: string
  care_recipient_veteran?: string
  caregiver_relationship?: string
  cohabitation?: string
  employer_size?: string
  employment_hours_yearly?: string
  [key: string]: string | undefined
}

export type ScreeningResult = 'eligible' | 'maybe' | 'not_eligible'

export interface ProgramScreening {
  programId: string
  title: string
  result: ScreeningResult
  missingFacts: string[]
  failedChecks: string[]
}

/** Subset of benefitEligibility row relevant to screening. */
export interface EligibilityCriteria {
  residencyStates?: string[]
  incomeFplPercent?: number
  incomeGrossMonthlyMax?: Record<string, number>
  incomeNetMonthlyMax?: Record<string, number>
  incomeAssetLimit?: number
  applicantMinAge?: number
  applicantMaxAge?: number
  careRecipientMinAge?: number
  careRecipientMaxAge?: number
  citizenshipRequired?: boolean
  disabilityRequired?: boolean
  careRecipientDisabilityRequired?: boolean
  veteranStatusRequired?: boolean
  careRecipientVeteranRequired?: boolean
  caregiverRelationship?: string[]
  cohabitationRequired?: boolean
  employerSizeMin?: number
  employmentHoursMin?: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type CheckCtx = {
  missing: string[]
  failed: string[]
}

function requireFact(ctx: CheckCtx, facts: CaregiverFacts, key: string): string | undefined {
  const v = facts[key]
  if (v === undefined || v === '') {
    ctx.missing.push(key)
    return undefined
  }
  return v
}

function yesNo(value: string): boolean | undefined {
  const v = value.trim().toLowerCase()
  if (v === 'yes' || v === 'true' || v === '1') return true
  if (v === 'no' || v === 'false' || v === '0') return false
  return undefined
}

// ---------------------------------------------------------------------------
// Individual checks
// ---------------------------------------------------------------------------

function checkResidency(ctx: CheckCtx, facts: CaregiverFacts, criteria: EligibilityCriteria): void {
  if (!criteria.residencyStates) return
  const state = requireFact(ctx, facts, 'state')
  if (state === undefined) return
  if (!criteria.residencyStates.includes(state.toUpperCase())) {
    ctx.failed.push('residency')
  }
}

function checkGrossIncome(
  ctx: CheckCtx,
  facts: CaregiverFacts,
  criteria: EligibilityCriteria
): void {
  if (!criteria.incomeGrossMonthlyMax) return
  const size = requireFact(ctx, facts, 'household_size')
  const income = requireFact(ctx, facts, 'household_income_monthly')
  if (size === undefined || income === undefined) return
  const threshold = criteria.incomeGrossMonthlyMax[size]
  if (threshold === undefined) return
  if (Number(income) > threshold) {
    ctx.failed.push('income_gross')
  }
}

function checkNetIncome(ctx: CheckCtx, facts: CaregiverFacts, criteria: EligibilityCriteria): void {
  if (!criteria.incomeNetMonthlyMax) return
  const size = requireFact(ctx, facts, 'household_size')
  const income = requireFact(ctx, facts, 'household_income_monthly')
  if (size === undefined || income === undefined) return
  const threshold = criteria.incomeNetMonthlyMax[size]
  if (threshold === undefined) return
  if (Number(income) > threshold) {
    ctx.failed.push('income_net')
  }
}

function checkFplIncome(ctx: CheckCtx, facts: CaregiverFacts, criteria: EligibilityCriteria): void {
  if (!criteria.incomeFplPercent) return
  if (criteria.incomeGrossMonthlyMax) return
  requireFact(ctx, facts, 'household_income_monthly')
}

function checkAssets(ctx: CheckCtx, facts: CaregiverFacts, criteria: EligibilityCriteria): void {
  if (criteria.incomeAssetLimit === undefined) return
  const assets = requireFact(ctx, facts, 'household_assets')
  if (assets === undefined) return
  if (Number(assets) > criteria.incomeAssetLimit) {
    ctx.failed.push('assets')
  }
}

function checkAge(
  ctx: CheckCtx,
  facts: CaregiverFacts,
  factKey: string,
  min: number | undefined,
  max: number | undefined,
  label: string
): void {
  if (min === undefined && max === undefined) return
  const age = requireFact(ctx, facts, factKey)
  if (age === undefined) return
  const n = Number(age)
  if (min !== undefined && n < min) ctx.failed.push(`${label}_min`)
  if (max !== undefined && n > max) ctx.failed.push(`${label}_max`)
}

function checkBooleanRequired(
  ctx: CheckCtx,
  facts: CaregiverFacts,
  required: boolean | undefined,
  factKey: string,
  label: string
): void {
  if (required !== true) return
  const val = requireFact(ctx, facts, factKey)
  if (val === undefined) return
  const parsed = yesNo(val)
  if (parsed === false) {
    ctx.failed.push(label)
  }
}

function checkRelationship(
  ctx: CheckCtx,
  facts: CaregiverFacts,
  criteria: EligibilityCriteria
): void {
  if (!criteria.caregiverRelationship) return
  const rel = requireFact(ctx, facts, 'caregiver_relationship')
  if (rel === undefined) return
  if (!criteria.caregiverRelationship.includes(rel.toLowerCase())) {
    ctx.failed.push('relationship')
  }
}

function checkEmployer(ctx: CheckCtx, facts: CaregiverFacts, criteria: EligibilityCriteria): void {
  if (criteria.employerSizeMin !== undefined) {
    const size = requireFact(ctx, facts, 'employer_size')
    if (size !== undefined && Number(size) < criteria.employerSizeMin) {
      ctx.failed.push('employer_size')
    }
  }
  if (criteria.employmentHoursMin !== undefined) {
    const hours = requireFact(ctx, facts, 'employment_hours_yearly')
    if (hours !== undefined && Number(hours) < criteria.employmentHoursMin) {
      ctx.failed.push('employment_hours')
    }
  }
}

// ---------------------------------------------------------------------------
// Main screener
// ---------------------------------------------------------------------------

function screenOne(
  facts: CaregiverFacts,
  programId: string,
  title: string,
  criteria: EligibilityCriteria
): ProgramScreening {
  const ctx: CheckCtx = { missing: [], failed: [] }

  checkResidency(ctx, facts, criteria)
  checkGrossIncome(ctx, facts, criteria)
  checkNetIncome(ctx, facts, criteria)
  checkFplIncome(ctx, facts, criteria)
  checkAssets(ctx, facts, criteria)
  checkAge(
    ctx,
    facts,
    'applicant_age',
    criteria.applicantMinAge,
    criteria.applicantMaxAge,
    'applicant_age'
  )
  checkAge(
    ctx,
    facts,
    'care_recipient_age',
    criteria.careRecipientMinAge,
    criteria.careRecipientMaxAge,
    'care_recipient_age'
  )
  checkBooleanRequired(ctx, facts, criteria.citizenshipRequired, 'citizenship', 'citizenship')
  checkBooleanRequired(ctx, facts, criteria.disabilityRequired, 'disability', 'disability')
  checkBooleanRequired(
    ctx,
    facts,
    criteria.careRecipientDisabilityRequired,
    'care_recipient_disability',
    'care_recipient_disability'
  )
  checkBooleanRequired(
    ctx,
    facts,
    criteria.veteranStatusRequired,
    'veteran_status',
    'veteran_status'
  )
  checkBooleanRequired(
    ctx,
    facts,
    criteria.careRecipientVeteranRequired,
    'care_recipient_veteran',
    'care_recipient_veteran'
  )
  checkRelationship(ctx, facts, criteria)
  checkBooleanRequired(ctx, facts, criteria.cohabitationRequired, 'cohabitation', 'cohabitation')
  checkEmployer(ctx, facts, criteria)

  const missingFacts = [...new Set(ctx.missing)]
  const failedChecks = [...new Set(ctx.failed)]

  let result: ScreeningResult
  if (failedChecks.length > 0) {
    result = 'not_eligible'
  } else if (missingFacts.length > 0) {
    result = 'maybe'
  } else {
    result = 'eligible'
  }

  return { programId, title, result, missingFacts, failedChecks }
}

export function screenPrograms(
  facts: CaregiverFacts,
  programs: Array<{ programId: string; title: string }>,
  eligibility: Map<string, EligibilityCriteria>
): ProgramScreening[] {
  return programs.map(p => {
    const criteria = eligibility.get(p.programId)
    if (!criteria) {
      return {
        programId: p.programId,
        title: p.title,
        result: 'maybe' as ScreeningResult,
        missingFacts: [],
        failedChecks: [],
      }
    }
    return screenOne(facts, p.programId, p.title, criteria)
  })
}

// ---------------------------------------------------------------------------
// Next question suggestion
// ---------------------------------------------------------------------------

const FACT_PRIORITY: string[] = [
  'state',
  'household_size',
  'household_income_monthly',
  'applicant_age',
  'citizenship',
  'care_recipient_disability',
  'caregiver_relationship',
  'care_recipient_age',
  'cohabitation',
  'disability',
  'veteran_status',
  'care_recipient_veteran',
  'employer_size',
  'employment_hours_yearly',
  'household_assets',
]

export function suggestNextQuestion(screenings: ProgramScreening[]): string | null {
  const freq = new Map<string, number>()
  for (const s of screenings) {
    if (s.result !== 'maybe') continue
    for (const f of s.missingFacts) {
      freq.set(f, (freq.get(f) ?? 0) + 1)
    }
  }

  if (freq.size === 0) return null

  const entries = [...freq.entries()]
  entries.sort((a, b) => {
    const idxA = FACT_PRIORITY.indexOf(a[0])
    const idxB = FACT_PRIORITY.indexOf(b[0])
    const priA = idxA === -1 ? FACT_PRIORITY.length : idxA
    const priB = idxB === -1 ? FACT_PRIORITY.length : idxB
    if (priA !== priB) return priA - priB
    return b[1] - a[1]
  })

  return entries[0]?.[0] ?? null
}
