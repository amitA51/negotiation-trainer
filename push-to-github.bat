@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts/push-to-github.ps1"
if %errorlevel% neq 0 (
    echo.
    echo Script execution failed. Press any key to exit...
    pause >nul
)
