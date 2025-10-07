@echo off
echo Starting EstateFlow for external access...

REM Get the local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)
:found

REM Remove spaces from IP
set IP=%IP: =%

echo.
echo ===============================================
echo EstateFlow is starting for external access...
echo ===============================================
echo.
echo Local Access:    http://localhost:5000
echo External Access: http://%IP%:5000
echo.
echo Share the external URL with others on your network
echo ===============================================
echo.

REM Start the server with external access
npm run dev

pause


