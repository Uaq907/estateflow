@echo off
echo Setting up EstateFlow Database...
echo.

REM Check if XAMPP MySQL exists
if not exist "C:\xampp\mysql\bin\mysql.exe" (
    echo ERROR: XAMPP MySQL not found at C:\xampp\mysql\bin\mysql.exe
    echo Please install XAMPP first from: https://www.apachefriends.org/download.html
    echo Then start MySQL service in XAMPP Control Panel
    pause
    exit /b 1
)

echo ✅ XAMPP MySQL found!

REM Create database
echo Creating estateflow database...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS estateflow;"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database. Make sure MySQL is running in XAMPP.
    pause
    exit /b 1
)
echo ✅ Database created!

REM Run initial migration
echo Running initial schema migration...
"C:\xampp\mysql\bin\mysql.exe" -u root estateflow < "src\migrations\0001_initial_schema.sql"
echo ✅ Initial schema loaded!

REM Import demo data
echo Importing demo data...
node import-real-data-from-original.js
echo ✅ Demo data imported!

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now login with these credentials:
echo Email: alice.j@estateflow.com
echo Password: password123
echo.
echo Or:
echo Email: bob.w@estateflow.com
echo Password: password123
echo.
echo Or:
echo Email: charlie.b@estateflow.com
echo Password: password123
echo.
echo Your app is running at: http://localhost:5000
echo.
pause

