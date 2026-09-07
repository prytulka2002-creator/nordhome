import './config.js'
const checks = [
  ['DATABASE_URL', Boolean(process.env.DATABASE_URL), true],
  ['ADMIN_USERNAME', Boolean(process.env.ADMIN_USERNAME), true],
  ['ADMIN_PASSWORD_HASH', Boolean(process.env.ADMIN_PASSWORD_HASH), true],
  ['PUBLIC_URL (HTTPS)', /^https:\/\//i.test(process.env.PUBLIC_URL || ''), true],
  ['NOVA_POSHTA_API_KEY', Boolean(process.env.NOVA_POSHTA_API_KEY), false],
  ['Telegram', Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID), false],
  ['Email SMTP', Boolean(process.env.EMAIL_SMTP_HOST && process.env.EMAIL_FROM), false],
]
let failed=false
console.log('\nNordHome production readiness\n')
for (const [name, ok, required] of checks) {
  console.log(`${ok?'OK  ':required?'FAIL':'INFO'} ${name}`)
  if(required&&!ok) failed=true
}
if(process.env.ADMIN_PASSWORD) { console.log('FAIL plaintext ADMIN_PASSWORD must be removed'); failed=true }
else console.log('OK   plaintext ADMIN_PASSWORD absent')
console.log(`OK   HOST=${process.env.HOST || '0.0.0.0'} / PORT=${process.env.PORT || '3001'}`)
console.log('\n'+(failed?'Not ready for public production yet.':'Production configuration looks ready.')+'\n')
process.exitCode=failed?1:0
