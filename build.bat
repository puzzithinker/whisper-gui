@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   WhisperX GUI - Windows Build Script
echo ============================================
echo.

where cargo >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Rust/cargo not found. Install from https://rustup.rs
    exit /b 1
)

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    exit /b 1
)

echo [1/4] Installing npm dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed
    exit /b 1
)

echo.
echo [2/4] Checking frontend build...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend build failed
    exit /b 1
)

echo.
echo [3/4] Building Tauri app (this takes a few minutes)...
call npm run tauri build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Tauri build failed
    exit /b 1
)

echo.
echo [4/4] Build complete!
echo.
for %%f in (src-tauri\target\release\bundle\msi\*.msi) do (
    echo   MSI installer: %%f
)
for %%f in (src-tauri\target\release\bundle\nsis\*.exe) do (
    echo   EXE installer: %%f
)
echo.
echo   Standalone exe: src-tauri\target\release\whisper-gui.exe
echo.

endlocal