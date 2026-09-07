import { ensurePersistentEnv, upsertPersistentEnv, persistentEnvPath } from './config.js'
import readline from 'node:readline/promises'
import process from 'node:process'
import crypto from 'node:crypto'

function hashPassword(password){
  const salt=crypto.randomBytes(16).toString('hex')
  const hash=crypto.scryptSync(String(password),salt,64).toString('hex')
  return `${salt}:${hash}`
}

const rl=readline.createInterface({input:process.stdin,output:process.stdout})
try{
  console.log('\n=== NordHome — безпечне налаштування Admin ===\n')
  const username=(await rl.question('Новий логін [admin]: ')).trim()||'admin'
  const password=(await rl.question('Новий пароль (мінімум 12 символів): ')).trim()
  if(password.length<12)throw new Error('Пароль має містити щонайменше 12 символів.')
  await ensurePersistentEnv()
  await upsertPersistentEnv('ADMIN_USERNAME', username)
  await upsertPersistentEnv('ADMIN_PASSWORD_HASH', hashPassword(password))
  await upsertPersistentEnv('ADMIN_PASSWORD', '')
  console.log(`\n✅ Логін збережено, пароль — лише у вигляді scrypt-хешу: ${persistentEnvPath}`)
  console.log('✅ Звичайний ADMIN_PASSWORD очищено. Перезапусти npm run dev.\n')
}catch(e){console.error(`\n❌ ${e.message}\n`);process.exitCode=1}finally{rl.close()}
