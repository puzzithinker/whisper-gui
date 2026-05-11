@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   WhisperX GUI - Debug Build Diagnostics
echo ============================================
echo.
echo This builds whisper-gui with console output
echo visible so any startup errors are shown.
echo.

where cargo >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Rust/cargo not found
    exit /b 1
)

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found
    exit /b 1
)

echo [1/3] Installing npm dependencies...
call npm install
if %ERRORLEVEL% neq 0 exit /b 1

echo.
echo [2/3] Building frontend...
call npm run build
if %ERRORLEVEL% neq 0 exit /b 1

echo.
echo [3/3] Building Tauri app in debug mode...
echo         (console window will stay open to show errors)
echo.
call cargo build --manifest-path src-tauri\Cargo.toml
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Cargo build failed
    exit /b 1
)

echo.
echo ============================================
echo   Build complete. Running debug exe...
echo ============================================
echo.
"src-tauri\target\debug\whisper-gui.exe" 2>&1
echo.
echo.
echo Exit code: %ERRORLEVEL%
pause