# SiteScape AI Setup Script for Windows

Write-Host "🚀 SiteScape AI - Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host "Checking MongoDB installation..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version
    Write-Host "✅ MongoDB found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MongoDB not found. Please install MongoDB from https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    Write-Host "   Or use MongoDB Compass to run a local instance" -ForegroundColor Yellow
}

# Check .env file
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please update with your OpenRouter API key" -ForegroundColor Green
    Write-Host "   Get your API key from: https://openrouter.ai/keys" -ForegroundColor Cyan
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray

# Root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install

# Backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
Set-Location ..

# Frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your OpenRouter API key" -ForegroundColor White
Write-Host "2. Start MongoDB (if not running): net start MongoDB" -ForegroundColor White
Write-Host "3. Run the application: npm run dev" -ForegroundColor White
Write-Host "4. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see README.md" -ForegroundColor Gray
