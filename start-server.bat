@echo off
title GB ENVIROTECH - Production Backend Server
color 0A
cls
echo ========================================================
echo   GB ENVIROTECH - Commercial Tissue Culture Platform
echo   Production Backend & Lead CRM Server
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Checking Node.js runtime...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [NOTICE] Using system Node.js path...
    set "PATH=C:\Program Files\nodejs;%PATH%"
)

echo [2/2] Launching GB Envirotech Server...
echo.
echo  * Main Website:   http://localhost:3000
echo  * Admin Lead CRM: http://localhost:3000/admin
echo  * Default Key:    GBEnviro@2026
echo.
echo Press Ctrl+C at any time to stop the server.
echo ========================================================
echo.

node server.js
pause
