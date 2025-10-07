@echo off
echo Setting up MySQL for EstateFlow...

REM Initialize MySQL data directory
echo Initializing MySQL data directory...
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --initialize-insecure --console

REM Start MySQL service
echo Starting MySQL service...
net start mysql

REM Wait a moment for service to start
timeout /t 5 /nobreak

REM Connect to MySQL and create database
echo Creating estateflow database...
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS estateflow;"

echo.
echo MySQL setup completed!
echo You can now restart your EstateFlow application.
echo.
pause


