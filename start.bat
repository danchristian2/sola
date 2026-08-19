@echo off
cd /d "%~dp0"
echo Installing packages if needed, then starting SOLA...
echo Open http://localhost:5173 after it starts.
echo MongoDB must be running on 127.0.0.1:27017
echo.
call npm run dev
pause
