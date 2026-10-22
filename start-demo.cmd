@echo off
rem Synteco Demo - one-click start for Windows (production mode, low memory).
rem First time only: pnpm install, pnpm demo:setup, pnpm demo:build
title Synteco Demo
cd /d "%~dp0"

docker info >nul 2>&1
if errorlevel 1 (
  echo Docker is not running. Start Docker Desktop, wait until it says "Engine running", then run this file again.
  pause
  exit /b 1
)

echo Starting the database (Docker: PostgreSQL, Redis, Typesense)...
docker compose up -d --wait
if errorlevel 1 (
  echo Could not start the database containers.
  pause
  exit /b 1
)

if not exist "apps\web\.next\BUILD_ID" (
  echo First run: building the apps, this takes a few minutes...
  call pnpm demo:build
)

echo.
echo  Shop:   http://localhost:3001   customer@synteco.kz / Customer123!
echo  Admin:  http://localhost:3002   admin@synteco.kz / Admin123!
echo  API:    http://localhost:3000/api-docs
echo  Close this window to stop the demo.
echo.
call pnpm demo:start
pause
