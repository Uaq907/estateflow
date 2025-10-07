@echo off
echo Creating .env file for EstateFlow...

(
echo # Database Configuration
echo DB_HOST=localhost
echo DB_USER=root
echo DB_PASSWORD=
echo DB_DATABASE=estateflow
echo.
echo # Application Configuration
echo NEXTAUTH_SECRET=your-secret-key-here-change-this
echo NEXTAUTH_URL=http://localhost:5000
) > .env

echo .env file created successfully!
echo.
pause


