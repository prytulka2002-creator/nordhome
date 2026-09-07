import fs from 'node:fs/promises'
import { ensurePersistentEnv, persistentEnvPath } from './config.js'
import readline from 'node:readline/promises'
import process from 'node:process'

const envPath = persistentEnvPath
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function upsertEnv(text, key, value) {
  const line = `${key}=${value}`
  const re = new RegExp(`^${key}=.*$`, 'm')
  if (re.test(text)) return text.replace(re, line)
  return `${text.trimEnd()}\n${line}\n`
}

async function telegram(token, method, body = undefined) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? {'Content-Type':'application/json'} : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.ok) {
    const description = payload?.description || `HTTP ${response.status}`
    throw new Error(description)
  }
  return payload.result
}

try {
  await ensurePersistentEnv()
  console.log('\n=== NordHome — Telegram setup ===\n')
  console.log('1) У Telegram відкрий @BotFather')
  console.log('2) Створи бота командою /newbot')
  console.log('3) Скопіюй токен, який видасть BotFather\n')

  const token = (await rl.question('Встав BOT TOKEN сюди: ')).trim()
  if (!token || !/^\d+:[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error('Токен виглядає некоректно. Скопіюй його повністю з BotFather.')
  }

  const me = await telegram(token, 'getMe')
  console.log(`\nБот знайдений: @${me.username}`)
  console.log(`\nТепер відкрий @${me.username} у Telegram і натисни START або надішли /start.`)
  await rl.question('Коли відправиш /start — натисни Enter тут... ')

  const updates = await telegram(token, 'getUpdates')
  const privateChats = updates
    .map(u => u.message?.chat || u.edited_message?.chat || u.callback_query?.message?.chat)
    .filter(chat => chat?.id && chat.type === 'private')

  const chat = privateChats.at(-1)
  if (!chat) {
    throw new Error('Не знайшов приватний чат. Напиши боту /start, зачекай 2–3 секунди і запусти SETUP_TELEGRAM.bat ще раз.')
  }

  let envText = ''
  try { envText = await fs.readFile(envPath, 'utf8') } catch { envText = 'PORT=3001\n' }
  envText = upsertEnv(envText, 'TELEGRAM_BOT_TOKEN', token)
  envText = upsertEnv(envText, 'TELEGRAM_CHAT_ID', String(chat.id))
  await fs.writeFile(envPath, envText, 'utf8')

  await telegram(token, 'sendMessage', {
    chat_id: chat.id,
    text: '✅ NordHome підключено! Нові замовлення будуть приходити сюди.'
  })

  console.log('\n✅ Готово! Telegram підключений.')
  console.log('✅ Тестове повідомлення вже відправлено тобі в Telegram.')
  console.log('✅ Токен і chat ID збережені у постійній конфігурації NordHome.')
  console.log('\nТепер перезапусти сайт: Ctrl+C → npm run dev\n')
} catch (error) {
  console.error(`\n❌ ${error.message}\n`)
  process.exitCode = 1
} finally {
  rl.close()
}
