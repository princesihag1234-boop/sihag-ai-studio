@echo off
setlocal
title Stop SIHAG AI STUDIO

echo ==========================================
echo       STOP SIHAG AI STUDIO
echo ==========================================
echo.

echo Stopping frontend on port 3000...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  taskkill /PID %%P /F >nul 2>&1
)

echo Stopping backend on port 8000...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
  taskkill /PID %%P /F >nul 2>&1
)

echo.
echo SIHAG AI STUDIO has been stopped.
timeout /t 2 /nobreak >nul

endlocal
exit /b 0
