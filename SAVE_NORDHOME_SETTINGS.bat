@echo off
cd /d "%~dp0"
echo NordHome: saving permanent settings...
node save-settings.js
pause
