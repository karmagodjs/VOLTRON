@echo off
echo =================================================
echo  VOLTRON -- Volatility Alpha Terminal Launcher
echo =================================================
echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000...
start "VOLTRON Python Engine" .\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

echo [2/2] Starting Next.js Production Web Terminal on http://localhost:3000...
cd frontend
npm run dev
