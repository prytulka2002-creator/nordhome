@echo off
cd /d "%~dp0"
title NordHome - Telegram Setup
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js ne znaideno. Vstanovit Node.js i zapusti tsei fail znovu.
  pause
  exit /b 1
)
node setup-telegram.js
echo.
pause
