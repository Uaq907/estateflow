# EstateFlow Quick Database Setup
Write-Host "========================================" -ForegroundColor Green
Write-Host "EstateFlow Database Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if XAMPP is already installed
$xamppPath = "C:\xampp"
if (Test-Path $xamppPath) {
    Write-Host "✅ XAMPP found at $xamppPath" -ForegroundColor Green
    
    # Try to start MySQL
    Write-Host "Starting MySQL service..." -ForegroundColor Yellow
    try {
        Start-Process -FilePath "$xamppPath\mysql_start.bat" -Wait -NoNewWindow
        Start-Sleep -Seconds 3
    } catch {
        Write-Host "Could not start MySQL automatically. Please start it manually from XAMPP Control Panel." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ XAMPP not found. Please install XAMPP first:" -ForegroundColor Red
    Write-Host "1. Go to: https://www.apachefriends.org/download.html" -ForegroundColor Cyan
    Write-Host "2. Download XAMPP for Windows" -ForegroundColor Cyan
    Write-Host "3. Install with default settings" -ForegroundColor Cyan
    Write-Host "4. Start XAMPP Control Panel and start MySQL service" -ForegroundColor Cyan
    Write-Host "5. Run this script again" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to continue"
    exit
}

# Test MySQL connection
Write-Host "Testing MySQL connection..." -ForegroundColor Yellow
try {
    $mysqlPath = "$xamppPath\mysql\bin\mysql.exe"
    if (Test-Path $mysqlPath) {
        & $mysqlPath -u root -e "SELECT 'MySQL is working!' as status;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ MySQL connection successful!" -ForegroundColor Green
        } else {
            Write-Host "❌ MySQL connection failed. Please check XAMPP Control Panel." -ForegroundColor Red
            exit
        }
    } else {
        Write-Host "❌ MySQL executable not found. Please check XAMPP installation." -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "❌ MySQL connection failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Create database
Write-Host "Creating estateflow database..." -ForegroundColor Yellow
& $mysqlPath -u root -e "CREATE DATABASE IF NOT EXISTS estateflow;"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database 'estateflow' created successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create database" -ForegroundColor Red
    exit
}

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
$migrationFiles = Get-ChildItem -Path "src\migrations\*.sql" | Sort-Object Name
foreach ($file in $migrationFiles) {
    Write-Host "Running migration: $($file.Name)" -ForegroundColor Cyan
    Get-Content $file.FullName | & $mysqlPath -u root estateflow
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Migration $($file.Name) may have failed, but continuing..." -ForegroundColor Yellow
    }
}
Write-Host "✅ Migrations completed!" -ForegroundColor Green

# Import demo data
Write-Host "Importing demo data..." -ForegroundColor Yellow
try {
    node import-real-data-from-original.js
    Write-Host "✅ Demo data import completed!" -ForegroundColor Green
} catch {
    Write-Host "Warning: Demo data import may have failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your EstateFlow application should now work!" -ForegroundColor Green
Write-Host ""
Write-Host "Default login credentials:" -ForegroundColor Cyan
Write-Host "Email: alice.j@estateflow.com" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Or:" -ForegroundColor Cyan
Write-Host "Email: bob.w@estateflow.com" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Or:" -ForegroundColor Cyan
Write-Host "Email: charlie.b@estateflow.com" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "You can now login at: http://localhost:5000" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"
