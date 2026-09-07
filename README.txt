NORDHOME v2.0 — POSTGRESQL
============================

Ця версія більше НЕ використовує data/products.json та data/orders.json.
Товари, замовлення та позиції замовлень зберігаються у PostgreSQL.

ПЕРШИЙ ЗАПУСК
1. Створи базу PostgreSQL (хмарну або локальну).
2. Скопіюй її connection string у .env:
   DATABASE_URL=postgresql://...
3. У цей самий .env перенеси NOVA_POSHTA_API_KEY, TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID зі старої робочої версії.
4. У CMD у папці NordHome виконай:
   npm install
   npm run db:setup
   npm run dev

Команда npm run db:setup створить таблиці та один раз перенесе 8 стартових товарів у PostgreSQL.
Повторний запуск не створює дублікати, якщо товари вже є.

ПЕРЕВІРКА
- Сайт: http://localhost:5173
- Адмінка: http://localhost:5173/admin
- API/БД: http://localhost:3001/api/health
  При справній БД відповідь містить database: connected.

ВАЖЛИВО ПРО ФАЙЛИ
Код React/Node фізично залишається файлами — так працюють вебсайти.
Але бізнес-дані NordHome тепер у PostgreSQL. Фото, які завантажуються з адмінки, поки зберігаються у public/uploads; на етапі публікації перенесемо їх у хмарне object storage, а в PostgreSQL залишатимуться URL.

----------------------------

NORDHOME — React + Vite + Node.js

ЗАПУСК ЛОКАЛЬНО
1. Відкрий CMD у папці nordhome-react.
2. npm install
3. npm run dev
4. Відкрий http://localhost:5173

ЗАМОВЛЕННЯ
- Форма checkout надсилає POST /api/orders.
- Сервер зберігає замовлення у data/orders.json.
- Після успішного замовлення клієнт бачить номер NH-...

TELEGRAM
1. Скопіюй .env.example у файл .env.
2. Заповни TELEGRAM_BOT_TOKEN та TELEGRAM_CHAT_ID.
3. Ніколи не публікуй .env і не вставляй токен у src/App.jsx.
4. Перезапусти npm run dev після зміни .env.

ВАЖЛИВО
Локальний data/orders.json підходить для розробки та тестування. Перед публічним запуском магазину краще перенести замовлення у справжню базу даних.


ОНОВЛЕННЯ 1.2 — ПОШУК НАСЕЛЕНИХ ПУНКТІВ УКРАЇНИ
- Поле «Місто» замінене на автопошук «Населений пункт».
- Пошук охоплює міста, села та селища з бази КАТОТТГ.
- У підказках показуються область, район і громада, коли ці дані доступні.
- У замовлення передається UA-код КАТОТТГ та адміністративні дані вибраного населеного пункту.
- Після розпакування виконайте npm install, бо додано залежність ua-geo-set.

ОНОВЛЕННЯ 1.3 — ДОСТАВКА
- Додано 3 служби доставки: Нова пошта, Укрпошта, Meest Пошта.
- Для Нової пошти: відділення / поштомат / кур'єр.
- Для Укрпошти: відділення / доставка на адресу.
- Для Meest: відділення / поштомат / кур'єр.
- Обрана служба та спосіб доставки зберігаються разом із замовленням.
- На цьому етапі номер/адреса відділення або поштомата вводяться вручну.
  Наступний етап — підключення живих API перевізників для автоматичного списку точок видачі.


NOVA POSHTA LIVE API
-------------------
1. Copy .env.example to .env
2. Put your key after NOVA_POSHTA_API_KEY=
3. Do NOT add quotes and do NOT share the .env file.
4. Restart npm run dev after changing .env.
5. In Checkout choose settlement -> Nova Poshta -> Branch/Parcel locker.
The browser talks only to the local NordHome server; the secret key remains on the server side.


ШВИДКИЙ ЗАПУСК WINDOWS
1. Двічі натисніть START_NORDHOME.bat.
2. Дочекайтесь запуску.
3. Відкрийте http://localhost:5173

API-ключ Нової пошти вже записаний у локальний .env. Не публікуйте .env і не додавайте його в Git.

TELEGRAM СПОВІЩЕННЯ
-------------------
Запусти SETUP_TELEGRAM.bat і дотримуйся підказок. Скрипт сам визначить Telegram chat ID і збереже налаштування в .env.

=== ADMIN PANEL v1.6 ===
Open: http://localhost:5173/admin
Default local login: admin
Default local password: NordHome2026!
Before publishing, run SETUP_ADMIN.bat and set your own password.

The admin panel can:
- view orders and order details;
- change order statuses;
- add, edit, hide and delete products;
- upload JPG/PNG/WEBP product photos from the computer;
- change prices, categories, descriptions, colors, dimensions, materials and availability.

IMPORTANT when moving from the previous version:
Copy your old .env values for NOVA_POSHTA_API_KEY, TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID into this project's .env so integrations keep working.


NordHome v1.7: Nova Poshta request protection added: 30-minute server cache, in-flight request deduplication, client debounce/cache, one controlled retry, and a retry button for HTTP 429.

NordHome v1.8: виправлено перше завантаження відділень Нової пошти (React StrictMode).

=== v3.12 — EMAIL-СПОВІЩЕННЯ ===
Email клієнту надсилається після оформлення замовлення та при реальній зміні статусу в адмінці.
Налаштування SMTP виконується локально командою: npm run email:setup
Секрети зберігаються у ~/.nordhome/.env. Якщо SMTP не налаштовано або клієнт не залишив email, магазин працює як раніше.
