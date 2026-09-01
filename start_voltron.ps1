# VOLTRON — Launch Full-Stack AI Options Terminal
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "⚡ VOLTRON — Volatility Alpha Terminal Launcher" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Start FastAPI Backend in background
Write-Host "[1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
$BackendProcess = Start-Process -FilePath ".\.venv\Scripts\python.exe" -ArgumentList "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000" -PassThru

# 2. Start Next.js Frontend
Write-Host "[2/2] Starting Next.js Production Web Terminal on http://localhost:3000..." -ForegroundColor Green
Set-Location -Path ".\frontend"
npm run dev
