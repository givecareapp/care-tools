#!/usr/bin/env node
import { createHash } from 'node:crypto'
import {
  closeSync,
  fchmodSync,
  fsyncSync,
  lstatSync,
  mkdtempSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
import { buildInstrumentExport } from '../src/assessments/instrumentExport'

const PROTOCOL = 'hound.protocol.v1'
const RESPONSE_SCHEMA = 'hound.driver.response.v1'
const PROJECT_INPUT_SCHEMA = 'gc-tools.hound.project.input.v1'
const OUTPUT_PATH = 'data/instruments-export.json'
const OUTPUT_MODE = 0o644
const SHA256 = /^[a-f0-9]{64}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

type Outcome = 'planned' | 'completed' | 'no-change' | 'failed'

interface DriverResponse {
  schema_version: typeof RESPONSE_SCHEMA
  ok: boolean
  outcome: Outcome
  data_schema: string
  data: Record<string, unknown>
  artifacts: unknown[]
  proofs: unknown[]
  diagnostics: string[]
}

interface ArtifactRef {
  schema_version: 'givecare.artifact-ref/v1'
  owner: 'tools.assessments'
  kind: 'owner-projection'
  artifact_id: typeof OUTPUT_PATH
  revision: string
  sha256: string
  access: 'public'
}

interface ProjectionMetadata {
  byte_length: number
  media_type: 'application/json'
}

interface ExpectedEffect {
  path: typeof OUTPUT_PATH
  mode: '0644'
  before_sha256: string | null
  after_sha256: string
}

interface ProjectPlan extends Record<string, unknown> {
  expected_effects: ExpectedEffect[]
  artifact_ref: ArtifactRef
  projection: ProjectionMetadata
}

function response(
  outcome: Outcome,
  dataSchema: string,
  data: Record<string, unknown>,
  artifacts: unknown[] = [],
  proofs: unknown[] = [],
  diagnostics: string[] = [],
): DriverResponse {
  return {
    schema_version: RESPONSE_SCHEMA,
    ok: outcome !== 'failed',
    outcome,
    data_schema: dataSchema,
    data,
    artifacts,
    proofs,
    diagnostics,
  }
}

function failed(message: string): DriverResponse {
  return response('failed', 'gc-tools.hound.error.v1', {}, [], [], [message])
}

function sha256(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort()
  return isDeepStrictEqual(actual, [...expected].sort())
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function renderInstrumentExport(): Buffer {
  return Buffer.from(`${JSON.stringify(buildInstrumentExport(), null, 2)}\n`, 'utf8')
}

function projectionPaths(repoRoot: string): { directory: string; target: string } {
  const resolvedRoot = resolve(repoRoot)
  const realRoot = realpathSync(resolvedRoot)
  if (realRoot !== resolvedRoot) throw new Error('repository root must not use a symbolic link')

  const target = resolve(resolvedRoot, OUTPUT_PATH)
  const directory = dirname(target)
  const relativeTarget = relative(resolvedRoot, target)
  if (relativeTarget !== OUTPUT_PATH) throw new Error(`${OUTPUT_PATH} leaves the repository`)

  const directoryStat = lstatSync(directory)
  if (!directoryStat.isDirectory() || directoryStat.isSymbolicLink()) {
    throw new Error(`${dirname(OUTPUT_PATH)} must be a real directory`)
  }
  if (realpathSync(directory) !== directory) {
    throw new Error(`${dirname(OUTPUT_PATH)} must not traverse a symbolic link`)
  }
  return { directory, target }
}

function inspectTarget(repoRoot: string): { bytes: Buffer | null; mode: number | null } {
  const { target } = projectionPaths(repoRoot)
  let stat: ReturnType<typeof lstatSync>
  try {
    stat = lstatSync(target)
  } catch (error) {
    if (isObject(error) && error.code === 'ENOENT') return { bytes: null, mode: null }
    throw error
  }
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${OUTPUT_PATH} must be a regular file`)
  }
  return { bytes: readFileSync(target), mode: stat.mode & 0o7777 }
}

function buildProjectPlan(repoRoot: string): { plan: ProjectPlan; content: Buffer } {
  const content = renderInstrumentExport()
  const afterSha256 = sha256(content)
  const current = inspectTarget(repoRoot)
  const beforeSha256 = current.bytes === null ? null : sha256(current.bytes)
  const changed = beforeSha256 !== afterSha256 || current.mode !== OUTPUT_MODE
  const artifactRef: ArtifactRef = {
    schema_version: 'givecare.artifact-ref/v1',
    owner: 'tools.assessments',
    kind: 'owner-projection',
    artifact_id: OUTPUT_PATH,
    revision: `sha256:${afterSha256}`,
    sha256: afterSha256,
    access: 'public',
  }
  const projection: ProjectionMetadata = {
    byte_length: content.byteLength,
    media_type: 'application/json',
  }
  const expectedEffects: ExpectedEffect[] = changed
    ? [{
        path: OUTPUT_PATH,
        mode: '0644',
        before_sha256: beforeSha256,
        after_sha256: afterSha256,
      }]
    : []
  return {
    plan: { expected_effects: expectedEffects, artifact_ref: artifactRef, projection },
    content,
  }
}

function fsyncDirectory(directory: string): void {
  const descriptor = openSync(directory, 'r')
  try {
    fsyncSync(descriptor)
  } finally {
    closeSync(descriptor)
  }
}

function atomicWrite(repoRoot: string, content: Buffer): void {
  const { directory, target } = projectionPaths(repoRoot)
  const scratch = mkdtempSync(join(directory, '.instruments-export-'))
  const temporary = join(scratch, 'projection.json')
  let descriptor: number | null = null
  try {
    descriptor = openSync(temporary, 'wx', OUTPUT_MODE)
    writeFileSync(descriptor, content)
    fchmodSync(descriptor, OUTPUT_MODE)
    fsyncSync(descriptor)
    closeSync(descriptor)
    descriptor = null
    renameSync(temporary, target)
    fsyncDirectory(directory)
    rmdirSync(scratch)
    fsyncDirectory(directory)

    const projected = inspectTarget(repoRoot)
    if (
      projected.bytes === null
      || projected.mode !== OUTPUT_MODE
      || !projected.bytes.equals(content)
    ) {
      throw new Error('projected artifact does not match the planned bytes and mode')
    }
  } finally {
    if (descriptor !== null) closeSync(descriptor)
    rmSync(scratch, { recursive: true, force: true })
  }
}

function validateProjectRequest(value: Record<string, unknown>): void {
  const base = ['schema_version', 'mode', 'operation', 'as_of', 'input']
  const expected = value.mode === 'execute' ? [...base, 'plan_id', 'driver_plan'] : base
  if (!hasExactKeys(value, expected)) throw new Error('project request has invalid fields')
  if (value.schema_version !== 'hound.driver.request.v1') throw new Error('request schema_version is invalid')
  if (value.mode !== 'plan' && value.mode !== 'execute') throw new Error('project mode must be plan or execute')
  if (value.operation !== 'corpus.project') throw new Error('operation must be corpus.project')
  if (typeof value.as_of !== 'string' || !DATE.test(value.as_of)) throw new Error('as_of must be YYYY-MM-DD')
  if (!isObject(value.input) || !hasExactKeys(value.input, ['schema_version'])) {
    throw new Error('project input has invalid fields')
  }
  if (value.input.schema_version !== PROJECT_INPUT_SCHEMA) {
    throw new Error(`project input schema_version must be ${PROJECT_INPUT_SCHEMA}`)
  }
  if (value.mode === 'execute') {
    if (typeof value.plan_id !== 'string' || !SHA256.test(value.plan_id)) {
      throw new Error('execute plan_id must be a SHA-256 digest')
    }
    if (!isObject(value.driver_plan)) throw new Error('execute driver_plan must be an object')
  }
}

export function handleRequest(value: unknown, repoRoot = process.cwd()): DriverResponse {
  try {
    if (!isObject(value)) throw new Error('request must be an object')
    if (value.mode === 'check') {
      if (!hasExactKeys(value, ['schema_version', 'mode'])) throw new Error('check request has invalid fields')
      if (value.schema_version !== 'hound.driver.request.v1') throw new Error('request schema_version is invalid')
      return response('completed', 'hound.driver.check.v1', { protocol: PROTOCOL })
    }

    validateProjectRequest(value)
    const { plan, content } = buildProjectPlan(repoRoot)
    const proof = {
      kind: 'owner-instrument-export',
      passed: true,
      path: plan.artifact_ref.artifact_id,
      sha256: plan.artifact_ref.sha256,
    }

    if (value.mode === 'plan') {
      return response(
        plan.expected_effects.length > 0 ? 'planned' : 'no-change',
        'gc-tools.hound.project-plan.v1',
        plan,
        [plan.artifact_ref],
        [proof],
      )
    }

    if (!isDeepStrictEqual(value.driver_plan, plan)) {
      throw new Error('bound projection plan no longer matches the owner source')
    }
    if (plan.expected_effects.length > 0) atomicWrite(repoRoot, content)
    return response(
      plan.expected_effects.length > 0 ? 'completed' : 'no-change',
      'gc-tools.hound.project-result.v1',
      {
        written: plan.expected_effects.map(effect => effect.path),
        artifact_ref: plan.artifact_ref,
        projection: plan.projection,
      },
      [plan.artifact_ref],
      [proof],
    )
  } catch (error) {
    return failed(error instanceof Error ? error.message : 'gc-tools Hound operation failed')
  }
}

const isMain = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  let result: DriverResponse
  try {
    result = handleRequest(JSON.parse(readFileSync(0, 'utf8')))
  } catch (error) {
    result = failed(error instanceof Error ? error.message : 'invalid JSON request')
  }
  process.stdout.write(`${JSON.stringify(result)}\n`)
}
