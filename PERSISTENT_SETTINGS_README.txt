NordHome v2.1 — постійні налаштування

1. Розпакуй цю версію ПОВЕРХ своєї поточної папки nordhome-react, не видаляючи стару папку.
   Файл .env у ZIP відсутній, тому твій поточний .env не перезапишеться.
2. Один раз запусти SAVE_NORDHOME_SETTINGS.bat
   або в CMD: npm run config:save
3. Налаштування будуть збережені у профілі Windows у папці .nordhome/.env.
4. У наступних версіях NordHome ці параметри підхопляться автоматично, навіть у новій папці:
   - DATABASE_URL
   - NOVA_POSHTA_API_KEY
   - TELEGRAM_BOT_TOKEN
   - TELEGRAM_CHAT_ID
   - ADMIN_USERNAME / ADMIN_PASSWORD
   - PORT

Не надсилай і не публікуй файл .nordhome/.env.
