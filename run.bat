@echo off
setlocal

REM Navigate to script directory
cd /d %~dp0

REM Check Node
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Please install Node.js LTS from https://nodejs.org/
  pause
  exit /b 1
)

REM Install deps
call npm install
if errorlevel 1 (
  echo [WARN] npm install failed. Trying with npx corepack enable...
  npx --yes corepack enable
  call npm install
)

REM Open browser
start "" http://localhost:3000

REM Run server
call npm run dev

endlocal
pause

