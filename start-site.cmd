@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

set "PHP_BIN="
if exist "tools\php\php.exe" set "PHP_BIN=tools\php\php.exe"
if not defined PHP_BIN (
  where php >nul 2>nul && set "PHP_BIN=php"
)
if not defined PHP_BIN (
  echo [??] ??? PHP??????????????????
  start "" "%~dp0index.html"
  pause
  exit /b
)

echo ============================================
echo   ???? ? ??????
echo   PHP  : %PHP_BIN%
echo   ?? : http://127.0.0.1:8080/index.php
echo   ?? : http://127.0.0.1:8080/admin.php
echo          ?? admin   ?? TWT@2026^!
echo   ?? : ?????????? stop-site.cmd
echo ============================================

start "????-PHP??" cmd /c ""%PHP_BIN%" -c "tools\php\php.ini" -S 127.0.0.1:8080 -t ."
ping -n 2 127.0.0.1 >nul
start "" "http://127.0.0.1:8080/index.php"
ping -n 3 127.0.0.1 >nul
exit /b

