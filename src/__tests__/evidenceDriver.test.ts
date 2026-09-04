import { createHash } from 'node:crypto'
import {
  chmodSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const roots: string[] = []
const DRIVER = join(process.cwd(), 'node_modules/.bin/tsx')
const SCRIPT = join(process.cwd(), 'scripts/evidence-driver.ts')

interface DriverResult {
  ok: boolean
  outcome: string
  data_schema: string
  data: Record<string, unknown>
  artifacts: unknown[]
  diagnostics: string[]
}

function invoke(request: Record<string, unknown>, root: string): DriverResult {
  const result = spawnSync(DRIVER, [SCRIPT], {
    cwd: root,
    input: JSON.stringify(request),
    encoding: 'utf8',
  })
  expect(result.status, result.stderr).toBe(0)
  return JSON.parse(result.stdout) as DriverResult
}

function fixture(initial = '{"stale":true}\n'): string {
  const root = mkdtempSync(join(tmpdir(), 'gc-tools-hound-'))
  roots.push(root)
  mkdirSync(join(root, 'data'))
  writeFileSync(join(root, 'data/instruments-export.json'), initial)
  return root
}

function emptyFixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'gc-tools-hound-'))
  roots.push(root)
  mkdirSync(join(root, 'data'))
  return root
}

function projectRequest(mode: 'plan' | 'execute', driverPlan?: Record<string, unknown>) {
  const request: Record<string, unknown> = {
    schema_version: 'hound.driver.request.v1',
    mode,
    operation: 'corpus.project',
    as_of: '2026-08-06',
    input: { schema_version: 'gc-tools.hound.project.input.v1' },
  }
  if (mode === 'execute') {
    request.plan_id = 'a'.repeat(64)
    request.driver_plan = driverPlan
  }
  return request
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('gc-tools Hound corpus.project', () => {
  it('plans exact owner-local bytes with a digest-bound effect', () => {
    const root = fixture()
    const result = invoke(projectRequest('plan'), root)

    expect(result.ok).toBe(true)
    expect(result.outcome).toBe('planned')
    expect(result.data_schema).toBe('gc-tools.hound.project-plan.v1')
    expect(result.data).toMatchObject({
      expected_effects: [{
        path: 'data/instruments-export.json',
        mode: '0644',
        before_sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
        after_sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      }],
      artifact_ref: {
        schema_version: 'givecare.artifact-ref/v1',
        owner: 'tools.assessments',
        kind: 'owner-projection',
        artifact_id: 'data/instruments-export.json',
        revision: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
        access: 'public',
      },
      projection: {
        byte_length: expect.any(Number),
        media_type: 'application/json',
      },
    })
    const artifactRef = result.data.artifact_ref as Record<string, unknown>
    expect(Object.keys(artifactRef).sort()).toEqual([
      'access',
      'artifact_id',
      'kind',
      'owner',
      'revision',
      'schema_version',
      'sha256',
    ])
    expect(artifactRef.revision).toBe(`sha256:${artifactRef.sha256}`)
    expect(result.artifacts).toEqual([artifactRef])
  })

  it('executes only the exact bound plan and reports the final digest', () => {
    const root = fixture()
    const planned = invoke(projectRequest('plan'), root)
    const result = invoke(projectRequest('execute', planned.data), root)

    expect(result.ok).toBe(true)
    expect(result.outcome).toBe('completed')
    expect(result.data).toMatchObject({
      written: ['data/instruments-export.json'],
      artifact_ref: planned.data.artifact_ref,
      projection: planned.data.projection,
    })
    expect(result.artifacts).toEqual([planned.data.artifact_ref])
    const projected = readFileSync(join(root, 'data/instruments-export.json'))
    expect(projected.toString('utf8')).toContain(
      'Canonical shared SDOH instrument definition',
    )
    expect(createHash('sha256').update(projected).digest('hex')).toBe(
      (result.data.artifact_ref as Record<string, unknown>).sha256,
    )
    const after = invoke(projectRequest('plan'), root)
    expect(after.outcome).toBe('no-change')
    expect(after.data).toMatchObject({ expected_effects: [] })
  })

  it('creates the projection from a fresh owner checkout with exact mode', () => {
    const root = emptyFixture()
    const planned = invoke(projectRequest('plan'), root)

    expect(planned.data).toMatchObject({
      expected_effects: [{
        path: 'data/instruments-export.json',
        mode: '0644',
        before_sha256: null,
      }],
    })

    const result = invoke(projectRequest('execute', planned.data), root)
    const target = join(root, 'data/instruments-export.json')
    expect(result).toMatchObject({ ok: true, outcome: 'completed' })
    expect(lstatSync(target).mode & 0o7777).toBe(0o644)
    expect(createHash('sha256').update(readFileSync(target)).digest('hex')).toBe(
      (result.data.artifact_ref as Record<string, unknown>).sha256,
    )
  })

  it('repairs mode drift even when the artifact bytes already match', () => {
    const root = emptyFixture()
    const initialPlan = invoke(projectRequest('plan'), root)
    invoke(projectRequest('execute', initialPlan.data), root)
    const target = join(root, 'data/instruments-export.json')
    chmodSync(target, 0o600)

    const planned = invoke(projectRequest('plan'), root)
    expect(planned.data).toMatchObject({
      expected_effects: [{
        mode: '0644',
        before_sha256: (planned.data.artifact_ref as Record<string, unknown>).sha256,
        after_sha256: (planned.data.artifact_ref as Record<string, unknown>).sha256,
      }],
    })
    const result = invoke(projectRequest('execute', planned.data), root)
    expect(result).toMatchObject({ ok: true, outcome: 'completed' })
    expect(lstatSync(target).mode & 0o7777).toBe(0o644)
  })

  it('refuses symbolic links at the target and projection directory', () => {
    const targetRoot = emptyFixture()
    const outsideTarget = join(targetRoot, 'outside.json')
    writeFileSync(outsideTarget, '{"outside":true}\n')
    symlinkSync(outsideTarget, join(targetRoot, 'data/instruments-export.json'))

    const targetResult = invoke(projectRequest('plan'), targetRoot)
    expect(targetResult).toMatchObject({ ok: false, outcome: 'failed' })
    expect(targetResult.diagnostics[0]).toContain('regular file')

    const brokenRoot = emptyFixture()
    symlinkSync(join(brokenRoot, 'missing.json'), join(brokenRoot, 'data/instruments-export.json'))
    const brokenResult = invoke(projectRequest('plan'), brokenRoot)
    expect(brokenResult).toMatchObject({ ok: false, outcome: 'failed' })
    expect(brokenResult.diagnostics[0]).toContain('regular file')

    const directoryRoot = mkdtempSync(join(tmpdir(), 'gc-tools-hound-'))
    const outsideDirectory = mkdtempSync(join(tmpdir(), 'gc-tools-hound-outside-'))
    roots.push(directoryRoot, outsideDirectory)
    symlinkSync(outsideDirectory, join(directoryRoot, 'data'))

    const directoryResult = invoke(projectRequest('plan'), directoryRoot)
    expect(directoryResult).toMatchObject({ ok: false, outcome: 'failed' })
    expect(directoryResult.diagnostics[0]).toContain('real directory')
  })

  it('refuses a changed or malformed execution plan', () => {
    const root = fixture()
    const planned = invoke(projectRequest('plan'), root)
    const changed = structuredClone(planned.data)
    ;(changed.artifact_ref as Record<string, unknown>).sha256 = 'b'.repeat(64)

    const mismatch = invoke(projectRequest('execute', changed), root)
    const malformed = invoke({ ...projectRequest('plan'), extra: true }, root)

    expect(mismatch).toMatchObject({ ok: false, outcome: 'failed' })
    expect(mismatch.diagnostics[0]).toContain('no longer matches')
    expect(malformed).toMatchObject({ ok: false, outcome: 'failed' })
    expect(malformed.diagnostics[0]).toContain('invalid fields')
  })
})
