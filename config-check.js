import { getConfigStatus } from './config.js'

const s = getConfigStatus()
const rows = [
  ['PostgreSQL / Supabase', s.database],
  ['Нова пошта', s.novaPoshta],
  ['Telegram Bot Token', s.telegramBot],
  ['Telegram Chat ID', s.telegramChat],
  ['Логін адмінки', s.adminUser],
  ['Пароль адмінки', s.adminPassword],
  ['Пароль адмінки хешований', s.adminPasswordHashed],
  ['Email SMTP', s.emailReady],
]
console.log('\nNordHome — перевірка конфігурації')
for (const [name, ok] of rows) console.log(`${ok ? 'OK ' : 'NO '} ${name}`)
console.log(`\nПостійний конфіг: ${s.persistentEnvPath}`)
console.log(`Локальний конфіг:  ${s.projectEnvPath}\n`)
if (!s.database) process.exitCode = 2

console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'OK' : 'NO')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'NO')
console.log('SUPABASE_STORAGE_BUCKET:', process.env.SUPABASE_STORAGE_BUCKET || 'product-images (default)')
