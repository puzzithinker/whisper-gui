@echo off
echo Running whisper-gui.exe with console visible...
echo.
echo If the app crashes, the error will appear below.
echo.
"src-tauri\target\release\whisper-gui.exe" 2>&1
echo.
echo Exit code: %ERRORLEVEL%
pause