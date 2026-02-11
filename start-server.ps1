# Yellow Bank Banking Agent - Server Startup Script
# Run this script to start the server

Write-Host "🚀 Yellow Bank Banking Agent Server" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\Users\user\OneDrive\Desktop\yellow bank"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if server is already running
$existingProcess = Get-Process -Name node -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "⚠️  Node.js process detected. Stopping existing processes..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "✅ Starting server..." -ForegroundColor Green
Write-Host "📡 Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📖 API Documentation: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "💬 Chat Endpoint: POST http://localhost:3000/api/chat" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Start the server
node server.js
