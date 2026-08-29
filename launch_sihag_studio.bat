@echo off
setlocal
title SIHAG AI STUDIO Launcher

cd /d "%~dp0"

echo ==========================================
echo          SIHAG AI STUDIO
echo ==========================================
echo.

if not exist "package.json" (
  echo ERROR: package.json was not found.
  echo Put this launcher inside the SIHAG AI STUDIO project folder.
  echo.
  pause
  exit /b 1
)

if not exist ".next\BUILD_ID" (
  echo Production build not found.
  echo.
  echo Run this command first:
  echo   npm.cmd run build
  echo.
  pause
  exit /b 1
)

echo Starting AI backend...
start "SIHAG AI Backend" cmd /k "cd /d ""%~dp0backend"" && call run_backend.bat"

echo Starting SIHAG AI STUDIO...
start "SIHAG AI STUDIO" cmd /k "cd /d ""%~dp0"" && npm.cmd start"

echo.
echo Waiting for the local app to start...
timeout /t 5 /nobreak >nul

echo Opening SIHAG AI STUDIO in your browser...
start "" "http://localhost:3000"

echo.
echo Launcher complete.
echo Keep the SIHAG AI Backend and SIHAG AI STUDIO windows open while editing.
timeout /t 2 /nobreak >nul

endlocal
exit /b 0
