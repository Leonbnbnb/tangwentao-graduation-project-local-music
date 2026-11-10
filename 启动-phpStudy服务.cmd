@echo off
chcp 65001 >nul
setlocal
set "PS=D:\phpstudy_pro"
set "PHP=%PS%\Extensions\php\php7.3.4nts"
set "NG=%PS%\Extensions\Nginx1.15.11"

echo ============================================
echo   ???? ? phpStudy ????
echo ============================================

netstat -ano | findstr ":9000" | findstr "LISTENING" >nul
if errorlevel 1 (
  echo [1/2] ?? PHP-CGI ^(9000^)...
  start "php-cgi 9000" /min "%PHP%\php-cgi.exe" -b 127.0.0.1:9000
  ping -n 3 127.0.0.1 >nul
) else (
  echo [1/2] PHP-CGI ???? ^(9000^)
)

netstat -ano | findstr ":80 " | findstr "LISTENING" >nul
if errorlevel 1 (
  echo [2/2] ?? Nginx ^(80^)...
  pushd "%NG%"
  start "Nginx" /min nginx.exe
  popd
  ping -n 3 127.0.0.1 >nul
) else (
  echo [2/2] Nginx ???? ^(80^)
)

echo.
echo ??: http://localhost/tingjian/index.php
echo ??: http://localhost/tingjian/admin.php   ^(admin / TWT@2026!^)
start "" "http://localhost/tingjian/index.php"
ping -n 3 127.0.0.1 >nul
exit /b
