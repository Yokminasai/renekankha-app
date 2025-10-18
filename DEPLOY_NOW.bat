@echo off
title RENEKANKHA - Deploy to Vercel
color 0A
cls

echo.
echo ============================================
echo  RENEKANKHA - Deploy to Vercel
echo ============================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git not found. Please install Git first.
    pause
    exit /b 1
)

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo [1/5] Checking git status...
git status

echo.
echo [2/5] Adding changes to git...
git add -A

echo.
echo [3/5] Committing changes...
git commit -m "Fix: server.js routing issue - serve index.html correctly"

echo.
echo [4/5] Pushing to GitHub...
git push origin main

echo.
echo [5/5] Waiting for Vercel to deploy...
echo.
echo ✓ Code pushed to GitHub!
echo ✓ Vercel will automatically deploy the changes
echo.
echo Check deployment status at: https://vercel.com/dashboard
echo.
pause
