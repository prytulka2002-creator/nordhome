@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ================================
echo NordHome - запуск магазину
echo ================================
if not exist node_modules (
  echo Встановлюю залежності...
  call npm install
  if errorlevel 1 (
    echo.
    echo Помилка npm install.
    pause
    exit /b 1
  )
)
echo.
echo Запускаю сайт...
echo Після запуску відкрийте http://localhost:5173
call npm run dev
pause
