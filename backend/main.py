import os
import sys
from typing import Optional
from fastapi import FastAPI, Query, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.service import voltron_service

app = FastAPI(
    title="VOLTRON Volatility Alpha Trading Engine API",
    description="Institutional AI Options Terminal Backend",
    version="2.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# MODELS
# ==========================================
class KillSwitchRequest(BaseModel):
    active: bool

class CopilotRequest(BaseModel):
    message: str

class BacktestRequest(BaseModel):
    strategy: str = "IRON_CONDOR"
    symbol: str = "SPY"
    start_date: str = "2025-01-01"
    end_date: str = "2026-08-31"
    starting_capital: float = 100000.0
    iv_rv_threshold: float = 1.40
    confidence_threshold: float = 70.0
    risk_per_trade_pct: float = 1.0
    max_exposure_pct: float = 30.0

# ==========================================
# ENDPOINTS
# ==========================================

@app.get("/")
def root():
    return {
        "terminal": "VOLTRON",
        "tagline": "Volatility Alpha — Autonomous AI Options Trading",
        "status": "OPERATIONAL",
        "mode": "PAPER_TRADING",
        "version": "2.0.0"
    }

@app.get("/api/account")
def get_account():
    return voltron_service.get_account_summary()

@app.get("/api/market")
def get_market(symbol: str = Query("SPY")):
    return voltron_service.get_market_data(symbol=symbol.upper())

@app.get("/api/options")
def get_options(symbol: str = Query("SPY"), expiration: Optional[str] = Query(None)):
    return voltron_service.get_options_chain(symbol=symbol.upper(), expiration=expiration)

@app.get("/api/volatility")
def get_volatility(symbol: str = Query("SPY")):
    market = voltron_service.get_market_data(symbol=symbol.upper())
    return {
        "symbol": market["symbol"],
        "realized_volatility": market["realized_volatility"],
        "implied_volatility": market["implied_volatility"],
        "iv_rv_ratio": market["iv_rv_ratio"],
        "iv_premium": market["iv_premium"],
        "opportunity_score": market["opportunity_score"],
        "market_regime": market["market_regime"],
        "vol_signal": market["vol_signal"],
        "history": market["history"]
    }

@app.get("/api/agent")
def get_agent_state(symbol: str = Query("SPY")):
    analysis = voltron_service.get_ai_analysis(symbol=symbol.upper())
    acc = voltron_service.get_account_summary()
    return {
        "status": "ACTIVE" if voltron_service.agent_running else "IDLE" if not voltron_service.agent_paused else "PAUSED",
        "running": voltron_service.agent_running,
        "paused": voltron_service.agent_paused,
        "cycle": voltron_service.cycle_count,
        "symbol": symbol.upper(),
        "analysis": analysis,
        "active_order": "VLT-8941",
        "kill_switch": voltron_service.risk_engine.kill_switch,
        "paper_connected": True,
        "portfolio_value": acc["portfolio_value"]
    }

@app.get("/api/agent/timeline")
def get_agent_timeline():
    return {
        "events": voltron_service.timeline_events,
        "cycle": voltron_service.cycle_count,
        "status": "ACTIVE" if voltron_service.agent_running else "MONITORING"
    }

@app.post("/api/agent/start")
def start_agent():
    voltron_service.agent_running = True
    voltron_service.agent_paused = False
    return {"status": "ACTIVE", "message": "Autonomous agent started."}

@app.post("/api/agent/pause")
def pause_agent():
    voltron_service.agent_paused = True
    voltron_service.agent_running = False
    return {"status": "PAUSED", "message": "Autonomous agent paused."}

@app.post("/api/agent/stop")
def stop_agent():
    voltron_service.agent_running = False
    voltron_service.agent_paused = False
    return {"status": "STOPPED", "message": "Autonomous agent stopped."}

@app.post("/api/agent/step")
def step_agent():
    voltron_service.cycle_count += 1
    return {"cycle": voltron_service.cycle_count, "status": "STEP_COMPLETE"}

@app.get("/api/strategy")
def get_strategy(strategy: str = Query("IRON_CONDOR"), symbol: str = Query("SPY")):
    return voltron_service.get_strategy_details(strategy_type=strategy.upper(), symbol=symbol.upper())

@app.get("/api/risk")
def get_risk():
    return voltron_service.get_risk_status()

@app.post("/api/risk/kill-switch")
def toggle_kill_switch(payload: KillSwitchRequest):
    return voltron_service.set_kill_switch(payload.active)

@app.get("/api/portfolio")
def get_portfolio():
    acc = voltron_service.get_account_summary()
    positions = voltron_service.get_open_positions()
    return {
        "account": acc,
        "positions": positions
    }

@app.get("/api/trades")
def get_trades():
    return {
        "trades": voltron_service.get_trades_history()
    }

@app.post("/api/backtest/run")
def run_backtest(req: BacktestRequest):
    return voltron_service.run_backtest(
        strategy=req.strategy,
        symbol=req.symbol,
        start_date=req.start_date,
        end_date=req.end_date,
        starting_capital=req.starting_capital,
        iv_rv_threshold=req.iv_rv_threshold,
        confidence_threshold=req.confidence_threshold,
        risk_per_trade_pct=req.risk_per_trade_pct,
        max_exposure_pct=req.max_exposure_pct
    )

@app.get("/api/analytics")
def get_analytics():
    bt = voltron_service.run_backtest()
    return {
        "metrics": bt["summary"],
        "equity_curve": bt["equity_curve"],
        "strategies_breakdown": [
            {"strategy": "IRON_CONDOR", "win_rate": 78.4, "pnl": 5820.0, "trades": 34, "sharpe": 2.14},
            {"strategy": "BULL_PUT_SPREAD", "win_rate": 81.2, "pnl": 4120.0, "trades": 22, "sharpe": 2.45},
            {"strategy": "BEAR_CALL_SPREAD", "win_rate": 75.0, "pnl": 1950.0, "trades": 12, "sharpe": 1.88},
            {"strategy": "LONG_STRADDLE", "win_rate": 45.0, "pnl": -450.0, "trades": 4, "sharpe": 0.85},
        ],
        "monthly_pnl": [
            {"month": "Jan", "pnl": 1420.0},
            {"month": "Feb", "pnl": 980.0},
            {"month": "Mar", "pnl": 2150.0},
            {"month": "Apr", "pnl": -420.0},
            {"month": "May", "pnl": 1840.0},
            {"month": "Jun", "pnl": 2310.0},
            {"month": "Jul", "pnl": 1650.0},
            {"month": "Aug", "pnl": 1510.0},
        ]
    }

@app.get("/api/system")
def get_system():
    return voltron_service.get_system_health()

@app.post("/api/copilot/chat")
def chat_copilot(req: CopilotRequest):
    return voltron_service.copilot_query(req.message)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
