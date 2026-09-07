import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { getConfigStatus, upsertPersistentEnv, persistentEnvPath } from './config.js'

const rl=readline.createInterface({input,output})
const ask=async(label,current='')=>{
  const suffix=current?' [Enter = залишити поточне]':''
  const value=(await rl.question(`${label}${suffix}: `)).trim()
  return value || current
}
try{
  console.log('\nNordHome — налаштування email через SMTP')
  console.log('Дані зберігаються лише на цьому комп’ютері у ~/.nordhome/.env.\n')
  const host=await ask('SMTP host',process.env.EMAIL_SMTP_HOST||'')
  const port=await ask('SMTP port',process.env.EMAIL_SMTP_PORT||'587')
  const secureRaw=await ask('Secure TLS одразу? true/false',process.env.EMAIL_SMTP_SECURE||'false')
  const user=await ask('SMTP user',process.env.EMAIL_SMTP_USER||'')
  const pass=await ask('SMTP password / app password',process.env.EMAIL_SMTP_PASS||'')
  const from=await ask('Email відправника (FROM)',process.env.EMAIL_FROM||user)
  const publicUrl=await ask('Публічна адреса сайту (необов’язково)',process.env.PUBLIC_URL||'')
  if(!host||!from)throw new Error('Потрібні щонайменше SMTP host та FROM email.')
  for(const [k,v] of Object.entries({EMAIL_SMTP_HOST:host,EMAIL_SMTP_PORT:port,EMAIL_SMTP_SECURE:String(/^true$/i.test(secureRaw)),EMAIL_SMTP_USER:user,EMAIL_SMTP_PASS:pass,EMAIL_FROM:from,PUBLIC_URL:publicUrl})) await upsertPersistentEnv(k,v)
  console.log(`\n✅ Email налаштовано. Постійний конфіг: ${persistentEnvPath}`)
  console.log('Перезапусти npm run dev, щоб сервер використав нові налаштування.\n')
}catch(e){console.error(`\n❌ ${e.message}\n`);process.exitCode=1}finally{rl.close()}
