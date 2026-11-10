@echo off
chcp 65001 >nul
echo ??????????...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
  taskkill /f /pid %%a >nul 2>nul
)
echo ????
ping -n 2 127.0.0.1 >nul

