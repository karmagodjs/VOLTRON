# ⚡ VOLTRON — Volatility Alpha

> **Production-Grade Autonomous AI Options Trading Terminal**

VOLTRON is an institutional-grade autonomous AI options trading terminal that continuously evaluates volatility dispersion, models multi-leg options structures, verifies institutional risk gates, reasons via Google Gemini 3.6, and executes paper orders through the Alpaca Paper Trading environment.

---

## 🏛️ Architectural Pillars

VOLTRON merges five foundational design philosophies:

1. **QuantConnect (35%)**: Quant research workflow, vectorized & event-driven backtesting, strategy lifecycle, paper monitoring, algorithm performance attribution.
2. **TradingView (25%)**: Interactive multi-series financial chart workspace (Price, Realized Vol, Implied Vol, IV/RV ratio, Volume), timeframe selector, crosshair precision.
3. **Palantir AIP (20%)**: AI command center, explainable neural reasoning audit, data &rarr; intelligence &rarr; action workflow, autonomous status telemetry.
4. **Deribit (15%)**: Real-time options chain matrix, calls & puts, Black-Scholes Greeks (&Delta;, &Gamma;, &Theta;, &Vega;), ATM contract glow, multi-leg strategy payoff visualizer.
5. **VOLTRON (5%)**: Electric Cyan / JetDark terminal visual identity, monospace tabular telemetry, two-factor armed kill switch.

---

## 🔄 Autonomous Trading Pipeline

```
MARKET DATA (SIP Bars)
       ↓
VOLATILITY ENGINE (IV / RV Spread & Skew)
       ↓
AI ANALYST (Gemini 3.6 Neural Thesis & Confidence)
       ↓
STRATEGY ENGINE (Iron Condor / Spreads Payoff Optimization)
       ↓
RISK ENGINE (7-Gate Safety Verification & Circuit Breakers)
       ↓
EXECUTION (Alpaca Multi-Leg Paper Order Router)
       ↓
POSITION MONITOR (Dynamic 50% Take-Profit / 100% Stop-Loss Loop)
       ↓
LEARN & AUDIT (Trade Ledger & Performance Matrix)
```

---

## 🧭 Terminal Routes

| Route | Functionality |
|---|---|
| `/` | Premium institutional landing page with animated pipeline flow & system specs. |
| `/dashboard` | Master terminal dashboard with financial charts, alpha gauges, AI analyst, and live timeline. |
| `/markets` | Multi-asset volatility scanner table (SPY, QQQ, IWM, NVDA, AAPL, TSLA, MSFT, AMZN). |
| `/options` | Deribit-grade Options Chain terminal with Greeks, ATM highlight, and strikes matrix. |
| `/agent` | AI Command Center with neural reasoning audit, prompt inspector, and autonomous controls. |
| `/strategies` | Strategy Engine & Builder with multi-leg configuration, Greeks, and interactive payoff curve. |
| `/backtest` | QuantConnect-inspired Backtesting Lab with custom parameters, metrics grid, and equity curves. |
| `/trades` | Audited trade ledger with filtering, CSV export, and execution outcome triggers. |
| `/portfolio` | Active multi-leg position map with leg breakdowns, current cost to close, and Greeks exposure. |
| `/risk` | 7-Gate Safety Verification matrix, exposure gauges, and two-factor emergency kill switch. |
| `/analytics` | Quantitative performance attribution, monthly return distributions, and Sharpe/Sortino ratios. |
| `/system` | End-to-end service telemetry, microservice latencies, and process diagnostics. |
| `/settings` | Alpaca Paper API keys, Gemini model routing, risk thresholds, and display preferences. |

---

## 🛡️ 7 Institutional Risk Gates

Before any paper order is submitted, VOLTRON evaluates 7 strict risk parameters:
1. **Opportunity Score Gate**: Requires Volatility Alpha Score &ge; 70 / 100.
2. **Max Trade Risk Gate**: Single-trade max loss capped at &le; 1.0% of total portfolio equity.
3. **Daily Loss Limit Gate**: Automated circuit breaker halts execution if daily drawdown reaches 2.0%.
4. **Portfolio Exposure Gate**: Aggregate open margin strictly capped at &le; 30.0% of equity.
5. **Market Liquidity Gate**: Maximum bid-ask spread must be &le; 10.0%.
6. **Consecutive Losses Gate**: Enforces cooling period after 3 consecutive stop outs.
7. **Paper Safety Lock**: Trading is hard-locked to the Alpaca Paper environment.

---

## 🚀 Quickstart

### Prerequisites
- Python 3.11+ / 3.13+
- Node.js 18+ & npm

### Starting Full-Stack Terminal

```powershell
# In PowerShell:
.\start_voltron.ps1

# Or in Windows CMD:
.\start_voltron.bat
```

Or start services manually:

```bash
# 1. Start Python FastAPI Trading Engine
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# 2. Start Next.js Terminal Frontend
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
