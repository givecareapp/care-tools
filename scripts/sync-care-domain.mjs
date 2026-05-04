#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const defaultCareDomainSrc = path.resolve(repoRoot, '..', 'gc-sms', 'packages', 'care-domain', 'src')
const careDomainSrc = path.resolve(process.env.GIVECARE_CARE_DOMAIN_SRC || defaultCareDomainSrc)
const checkOnly = process.argv.includes('--check')

const SYNC_FILES = [
  'geo/timezone.ts',
  'geo/zipToState.ts',
  'lib/time.ts',
  'sms/regulatory.ts',
]

function rel(p) {
  return path.relative(repoRoot, p)
}

if (!fs.existsSync(careDomainSrc)) {
  console.log(`care-domain source not found at ${careDomainSrc}; skipping sync check`)
  process.exit(0)
}

const drifted = []
for (const file of SYNC_FILES) {
  const source = path.join(careDomainSrc, file)
  const target = path.join(repoRoot, 'src', file)
  if (!fs.existsSync(source)) {
    throw new Error(`Missing care-domain source file: ${source}`)
  }
  const sourceText = fs.readFileSync(source, 'utf8')
  const targetText = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : ''
  if (sourceText === targetText) continue

  drifted.push(file)
  if (!checkOnly) {
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, sourceText)
    console.log(`synced ${file}`)
  }
}

if (checkOnly && drifted.length > 0) {
  console.error('Public-safe care-domain drift detected:')
  for (const file of drifted) console.error(`  - ${file}`)
  console.error('Run: npm run sync:care-domain')
  process.exit(1)
}

if (drifted.length === 0) {
  console.log('public-safe care-domain files are in sync')
} else if (!checkOnly) {
  console.log(`synced ${drifted.length} public-safe file(s) from ${rel(careDomainSrc)}`)
}
