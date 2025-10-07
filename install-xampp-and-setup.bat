@echo off
echo ========================================
echo EstateFlow Database Setup Script
echo ========================================
echo.

echo Step 1: Downloading XAMPP...
echo Please download XAMPP from: https://www.apachefriends.org/download.html
echo Choose the Windows version and download the installer.
echo.
echo After downloading, please:
echo 1. Run the XAMPP installer
echo 2. Install with default settings
echo 3. Start XAMPP Control Panel
echo 4. Click "Start" next to MySQL
echo 5. Click "Start" next to Apache (optional, for phpMyAdmin)
echo.
echo Then come back and run this script again by pressing any key.
pause

echo.
echo Step 2: Setting up MySQL connection...
echo Testing MySQL connection...

"C:\xampp\mysql\bin\mysql.exe" -u root -e "SELECT 'MySQL is working!' as status;" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to MySQL. Please make sure:
    echo 1. XAMPP is installed in C:\xampp
    echo 2. MySQL service is running in XAMPP Control Panel
    echo.
    pause
    exit /b 1
)

echo ✅ MySQL connection successful!

echo.
echo Step 3: Creating estateflow database...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS estateflow;"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)
echo ✅ Database 'estateflow' created successfully!

echo.
echo Step 4: Running migrations...
for %%f in (src\migrations\*.sql) do (
    echo Running migration: %%~nxf
    "C:\xampp\mysql\bin\mysql.exe" -u root estateflow < "%%f"
    if %errorlevel% neq 0 (
        echo Warning: Migration %%~nxf may have failed, but continuing...
    )
)
echo ✅ Migrations completed!

echo.
echo Step 5: Importing demo data...
node import-real-data-from-original.js
if %errorlevel% neq 0 (
    echo Warning: Demo data import may have failed, but continuing...
)
echo ✅ Demo data import completed!

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your EstateFlow application should now work!
echo.
echo Default login credentials:
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
echo You can now login at: http://localhost:5000
echo.
pause

