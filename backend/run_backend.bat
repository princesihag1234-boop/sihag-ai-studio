@echo off
title SIHAG AI STUDIO Backend
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo.
    echo Creating Python virtual environment...
    py -m venv .venv

    if errorlevel 1 (
        echo.
        echo Could not run the "py" command.
        echo Install Python 3.11 or 3.12, then run this file again.
        pause
        exit /b 1
    )
)

echo.
echo Activating environment...
call ".venv\Scripts\activate.bat"

echo.
echo Installing/updating backend packages...
python -m pip install --upgrade pip
pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo Package installation failed.
    pause
    exit /b 1
)

echo.
echo ===============================================
echo  SIHAG AI STUDIO AI backend is starting...
echo  API:     http://127.0.0.1:8000
echo  Health:  http://127.0.0.1:8000/health
echo  Docs:    http://127.0.0.1:8000/docs
echo ===============================================
echo.
echo Keep this window OPEN while using AI tools.
echo Press CTRL+C to stop the backend.
echo.

python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

pause
