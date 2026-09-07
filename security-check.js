import './config.js'

const strong = Boolean(process.env.ADMIN_PASSWORD_HASH)
const legacy = Boolean(process.env.ADMIN_PASSWORD)
const user = Boolean(process.env.ADMIN_USERNAME)
const db = Boolean(process.env.DATABASE_URL)
const publicUrl = String(process.env.PUBLIC_URL || '').trim()

console.log('\nNordHome — security check')
console.log(`${db?'OK ':'NO '} PostgreSQL / Supabase`)
console.log(`${user?'OK ':'NO '} Admin username`)
console.log(`${strong?'OK ':'NO '} Admin password scrypt hash`)
console.log(`${legacy?'WARN':'OK '} Plaintext ADMIN_PASSWORD ${legacy?'ще присутній':'відсутній'}`)
console.log(`${publicUrl.startsWith('https://')?'OK ':'INFO'} HTTPS public URL ${publicUrl||'ще не налаштований'}`)
console.log('OK  Admin login rate limit: 7 / 15 min / IP')
console.log('OK  API rate limit: 180 / min / IP')
console.log('OK  Security headers enabled')
if(!strong) console.log('\nЗапусти: npm run admin:setup')
console.log('')
if(!db||!user||!strong) process.exitCode=2
