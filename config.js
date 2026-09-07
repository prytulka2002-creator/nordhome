import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const projectEnvPath = path.join(__dirname, '.env')
export const persistentDir = path.join(os.homedir(), '.nordhome')
export const persistentEnvPath = path.join(persistentDir, '.env')

// Save the keys supplied by Windows / hosting before reading NordHome files.
// Priority: system/hosting ENV > project .env > persistent ~/.nordhome/.env
const systemEnvKeys = new Set(Object.keys(process.env))

function unquote(value) {
  if (value.length >= 2) {
    const first = value[0]
    const last = value[value.length - 1]
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      const body = value.slice(1, -1)
      return first === '"'
        ? body.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
        : body
    }
  }
  return value
}

export function parseEnvText(text) {
  const out = {}
  for (const rawLine of String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/)) {
    let line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    if (line.startsWith('export ')) line = line.slice(7).trim()
    const i = line.indexOf('=')
    if (i < 1) continue
    const key = line.slice(0, i).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
    const value = unquote(line.slice(i + 1).trim())
    out[key] = value
  }
  return out
}

function readEnvFileSync(filePath) {
  try {
    return parseEnvText(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return {}
  }
}

function applyEnv(values, { override = false } = {}) {
  for (const [key, value] of Object.entries(values)) {
    if (systemEnvKeys.has(key)) continue
    if (override || process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = value
    }
  }
}

// Persistent settings are the fallback for every future NordHome folder.
applyEnv(readEnvFileSync(persistentEnvPath), { override: false })
// A local project .env may override the persistent copy for this project only.
applyEnv(readEnvFileSync(projectEnvPath), { override: true })

export function getConfigStatus() {
  return {
    database: Boolean(process.env.DATABASE_URL),
    novaPoshta: Boolean(process.env.NOVA_POSHTA_API_KEY),
    telegramBot: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    telegramChat: Boolean(process.env.TELEGRAM_CHAT_ID),
    adminUser: Boolean(process.env.ADMIN_USERNAME),
    adminPassword: Boolean(process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD),
    adminPasswordHashed: Boolean(process.env.ADMIN_PASSWORD_HASH),
    emailHost: Boolean(process.env.EMAIL_SMTP_HOST),
    emailFrom: Boolean(process.env.EMAIL_FROM),
    emailReady: Boolean(process.env.EMAIL_SMTP_HOST && process.env.EMAIL_FROM),
    projectEnvPath,
    persistentEnvPath,
  }
}

export async function ensurePersistentEnv() {
  await fsp.mkdir(persistentDir, { recursive: true })
  try { await fsp.access(persistentEnvPath) }
  catch { await fsp.writeFile(persistentEnvPath, 'PORT=3001\n', 'utf8') }
  return persistentEnvPath
}

function envLine(key, value) {
  // Our parser keeps everything after the first '=' verbatim, including # and =,
  // so database URLs and bot tokens can be stored without special handling.
  return `${key}=${String(value ?? '').replace(/[\r\n]/g, '')}`
}

export async function upsertPersistentEnv(key, value) {
  await ensurePersistentEnv()
  let text = await fsp.readFile(persistentEnvPath, 'utf8')
  const line = envLine(key, value)
  const re = new RegExp(`^${key}=.*$`, 'm')
  text = re.test(text) ? text.replace(re, line) : `${text.trimEnd()}\n${line}\n`
  await fsp.writeFile(persistentEnvPath, text, 'utf8')
  if (!systemEnvKeys.has(key)) process.env[key] = String(value ?? '')
}
