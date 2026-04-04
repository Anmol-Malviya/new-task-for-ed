@echo off
setlocal

:: Define project paths
set BASE_DIR=%~dp0
set BACKEND_DIR=%BASE_DIR%EventDhara-New-Model\backend
set FRONTEND_DIR=%BASE_DIR%EventDhara-New-Model\frontend

echo ==========================================
echo       Starting EventDhara Project
echo ==========================================

:: Start Django Backend
echo Launching Backend server...
start "EventDhara Backend" cmd /k "cd /d "%BACKEND_DIR%" && call .venv\Scripts\activate.bat && python manage.py runserver"

:: Start Next.js Frontend
echo Launching Frontend server...
start "EventDhara Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo Both servers are launching in separate windows.
echo - Backend: http://127.0.0.1:8000
echo - Frontend: http://localhost:3000
echo.
pause
