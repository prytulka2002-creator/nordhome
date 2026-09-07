import fs from 'node:fs/promises'
import { projectEnvPath, persistentEnvPath, persistentDir } from './config.js'

const KEYS = [
  'DATABASE_URL',
  'NOVA_POSHTA_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'EMAIL_SMTP_HOST',
  'EMAIL_SMTP_PORT',
  'EMAIL_SMTP_SECURE',
  'EMAIL_SMTP_USER',
  'EMAIL_SMTP_PASS',
  'EMAIL_FROM',
  'PUBLIC_URL',
  'PORT',
]

function parseEnv(text) {
  const out = {}
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const i = line.indexOf('=')
    if (i < 1) continue
    out[line.slice(0, i).trim()] = line.slice(i + 1)
  }
  return out
}

try {
  let local = {}
  try { local = parseEnv(await fs.readFile(projectEnvPath, 'utf8')) } catch {}
  let saved = {}
  try { saved = parseEnv(await fs.readFile(persistentEnvPath, 'utf8')) } catch {}

  for (const key of KEYS) {
    if (local[key] !== undefined && local[key] !== '') saved[key] = local[key]
    else if (process.env[key] !== undefined && process.env[key] !== '') saved[key] ??= process.env[key]
  }

  await fs.mkdir(persistentDir, { recursive: true })
  const text = KEYS.filter(k => saved[k] !== undefined).map(k => `${k}=${saved[k]}`).join('\n') + '\n'
  await fs.writeFile(persistentEnvPath, text, 'utf8')
  console.log('\n✅ Налаштування NordHome збережені постійно.')
  console.log(`📁 ${persistentEnvPath}`)
  console.log('Тепер нові версії NordHome зможуть підхоплювати PostgreSQL, Нову пошту, Telegram, email і адмін-доступ автоматично.\n')
} catch (error) {
  console.error(`\n❌ ${error.message}\n`)
  process.exitCode = 1
}
