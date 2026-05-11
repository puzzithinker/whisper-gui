@echo off
setlocal enabledelayedexpansion

echo Running whisper-gui in debug mode to see errors...
echo.

where cargo >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] cargo not found
    exit /b 1
)

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] node not found
    exit /b 1
)

call npm install
if %ERRORLEVEL% neq 0 exit /b 1

echo Starting in debug mode (console window will stay open)...
echo.
call npm run tauri dev