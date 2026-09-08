import './config.js'
import { query } from './db.js'

const base = String(process.env.PUBLIC_URL || '').replace(/\/$/, '')
const checks = []
const add = (name, ok, detail='') => checks.push({name,ok,detail})

add('NODE_ENV=production', process.env.NODE_ENV === 'production', process.env.NODE_ENV || 'not set')
add('PUBLIC_URL HTTPS', /^https:\/\//i.test(base), base || 'not set')
add('Admin password hash', Boolean(process.env.ADMIN_PASSWORD_HASH), process.env.ADMIN_PASSWORD_HASH ? 'configured' : 'missing')
add('Plaintext admin password absent', !process.env.ADMIN_PASSWORD, process.env.ADMIN_PASSWORD ? 'remove ADMIN_PASSWORD' : 'ok')
try { await query('SELECT 1'); add('PostgreSQL / Supabase', true, 'connected') } catch (e) { add('PostgreSQL / Supabase', false, e.message) }
add('Nova Poshta', Boolean(process.env.NOVA_POSHTA_API_KEY), process.env.NOVA_POSHTA_API_KEY ? 'configured' : 'optional/missing')
add('Telegram orders', Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID), process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID ? 'configured' : 'optional/missing')
add('Customer email', Boolean(process.env.EMAIL_SMTP_HOST && process.env.EMAIL_SMTP_USER && process.env.EMAIL_SMTP_PASS && process.env.EMAIL_FROM), process.env.EMAIL_SMTP_HOST ? 'SMTP configured (network delivery still depends on host)' : 'optional/missing')

if (base) {
  for (const endpoint of ['/api/health','/api/products','/api/settings']) {
    try {
      const r = await fetch(base + endpoint, { signal: AbortSignal.timeout(20000) })
      add(`Public ${endpoint}`, r.ok, `HTTP ${r.status}`)
    } catch (e) { add(`Public ${endpoint}`, false, e.message) }
  }
}

console.log('\nNordHome v3.21 launch check\n')
for (const c of checks) console.log(`${c.ok?'OK  ':'FAIL'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`)
const critical = checks.filter(c => ['NODE_ENV=production','PUBLIC_URL HTTPS','Admin password hash','Plaintext admin password absent','PostgreSQL / Supabase','Public /api/health','Public /api/products','Public /api/settings'].includes(c.name))
const failed = critical.some(c=>!c.ok)
console.log(`\n${failed?'Launch check has critical failures.':'Core launch checks passed.'}\n`)
process.exitCode = failed ? 1 : 0
