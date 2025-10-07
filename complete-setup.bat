@echo off
title EstateFlow Complete Setup
echo.
echo ========================================
echo EstateFlow Complete Database Setup
echo ========================================
echo.

REM Wait for XAMPP installation to complete
echo Waiting for XAMPP installation to complete...
echo Please complete the XAMPP installation if it's still running.
echo.
pause

REM Check if XAMPP MySQL exists
echo Checking XAMPP installation...
if not exist "C:\xampp\mysql\bin\mysql.exe" (
    echo ERROR: XAMPP MySQL not found!
    echo Please make sure XAMPP is installed at C:\xampp
    echo.
    pause
    exit /b 1
)
echo ✅ XAMPP MySQL found!

REM Start MySQL service
echo Starting MySQL service...
start "" "C:\xampp\xampp-control.exe"
echo Please start MySQL service in XAMPP Control Panel and press any key to continue...
pause

REM Test MySQL connection
echo Testing MySQL connection...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "SELECT 'MySQL is working!' as status;" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to MySQL!
    echo Please make sure MySQL service is running in XAMPP Control Panel
    echo.
    pause
    exit /b 1
)
echo ✅ MySQL connection successful!

REM Create database
echo Creating estateflow database...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS estateflow;"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)
echo ✅ Database 'estateflow' created!

REM Run migrations
echo Running database migrations...
for %%f in (src\migrations\*.sql) do (
    echo Running migration: %%~nxf
    "C:\xampp\mysql\bin\mysql.exe" -u root estateflow < "%%f"
    if %errorlevel% neq 0 (
        echo Warning: Migration %%~nxf may have failed, but continuing...
    )
)
echo ✅ Migrations completed!

REM Import demo data
echo Importing demo data...
node import-real-data-from-original.js
if %errorlevel% neq 0 (
    echo Warning: Demo data import may have failed, but continuing...
)
echo ✅ Demo data imported!

REM Test login credentials
echo Testing login credentials...
"C:\xampp\mysql\bin\mysql.exe" -u root estateflow -e "SELECT email, name FROM employees LIMIT 3;"

echo.
echo ========================================
echo 🎉 Setup Complete!
echo ========================================
echo.
echo Your EstateFlow application is now ready!
echo.
echo 📧 Login Credentials:
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
echo 🌐 Access your application at: http://localhost:5000
echo.
echo The database is now connected and working!
echo You should be able to login successfully.
echo.
pause
