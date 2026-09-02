# ⚡ VOLTRON — Autonomous AI Options Trading Terminal

> **Production-Grade Autonomous AI Options Trading & Volatility Intelligence System**  
> **Live Production URL:** [https://frontend-two-kappa-80npppsqjt.vercel.app](https://frontend-two-kappa-80npppsqjt.vercel.app)  
> **Execution Environment:** Alpaca Paper Sandbox (`https://paper-api.alpaca.markets`)  

---

## 🏛️ Executive Overview

**VOLTRON** is an institutional-grade, multi-stage autonomous options trading platform that merges **deterministic quantitative volatility modeling**, **Google Gemini 3.6 Pro macroeconomic reasoning**, and **7 pre-trade safety risk gates** with direct **Alpaca Paper execution**.

VOLTRON solves the critical problem of LLM hallucinations in quantitative finance: the AI is strictly bounded to macroeconomic thesis synthesis and confidence scoring, while strike selection, options Greeks calculations ($\Delta, \Gamma, \Theta, \nu$), risk gating, and multi-leg order construction are handled deterministically by mathematical engines.

---

## 🔄 Autonomous Trading Pipeline

```
MARKET DATA (Alpaca Stock & Options SIP Feed)
       ↓
VOLATILITY ENGINE (Realized Vol vs Implied Vol Skew & Dislocation)
       ↓
AI ANALYST (Google Gemini 3.6 Pro Macroeconomic Thesis & Confidence)
       ↓
STRATEGY SELECTOR (Deterministic Iron Condor / Vertical Spreads Mapping)
       ↓
RISK & SAFETY ENGINE (7 Institutional Pre-Trade Gates & Circuit Breakers)
       ↓
ORDER BUILDER (Alpaca Level-3 Multi-Leg MLeg Limit Order Structuring)
       ↓
ALPACA PAPER ROUTER (Submits to https://paper-api.alpaca.markets)
       ↓
POSITION MONITOR (Dynamic +50% Take-Profit / -100% Stop-Loss Exit Loop)
       ↓
AUDIT & OBSERVABILITY (End-to-End Correlation Trace ID & Immutable Ledger)
```

---

## 🧭 Live Terminal Modules

| Route | Module Name | Core Capabilities |
|---|---|---|
| [**`/dashboard`**](https://frontend-two-kappa-80npppsqjt.vercel.app/dashboard) | Command Center | Live ticker tape (SPY, QQQ, NVDA), portfolio equity walk, real-time Greek telemetry ($\Delta, \Theta, \nu, \Gamma$). |
| [**`/agent`**](https://frontend-two-kappa-80npppsqjt.vercel.app/agent) | AI Agent Command Center | 8-stage state machine stepper, Gemini 3.6 thesis synthesis, live cycle timeline, and pause/resume controls. |
| [**`/options`**](https://frontend-two-kappa-80npppsqjt.vercel.app/options) | Options Trading Terminal | Deribit-density Options Chain with Call/Put Greeks, IV/RV spread bar, and interactive payoff visualizer. |
| [**`/backtest`**](https://frontend-two-kappa-80npppsqjt.vercel.app/backtest) | Quant Backtest Lab | Multi-strategy historical backtesting engine, parameter tuning, equity curves, and underwater drawdown. |
| [**`/portfolio`**](https://frontend-two-kappa-80npppsqjt.vercel.app/portfolio) | Portfolio Operations | Real Alpaca paper equity metrics, grouped multi-leg positions, live Greek totals, dynamic TP/SL loop. |
| [**`/trades`**](https://frontend-two-kappa-80npppsqjt.vercel.app/trades) | Order Operations | Real-time Execution Monitor (submitted, filled, rejected, latency), nested option legs, and CSV export. |
| [**`/risk`**](https://frontend-two-kappa-80npppsqjt.vercel.app/risk) | Risk & Safety Command | 6 real-time risk gauges, 7 clickable gate detail cards, candidate trade decision card, and Kill Switch. |
| [**`/analytics`**](https://frontend-two-kappa-80npppsqjt.vercel.app/analytics) | Performance Intelligence | 6-tab research workspace, 10 executive KPIs, strategy comparison matrix, AI confidence buckets, and DTE attribution. |
| [**`/system`**](https://frontend-two-kappa-80npppsqjt.vercel.app/system) | Observability & Audit | 11-component service health matrix, structured event stream, trade reconstruction trace (`VOL-2026-000128`), and audit ledger. |
| [**`/settings`**](https://frontend-two-kappa-80npppsqjt.vercel.app/settings) | System Configuration | Masked Alpaca Paper credentials, Gemini model routing, risk thresholds, and display preferences. |

---

## 🛡️ 7 Institutional Pre-Trade Risk Gates

Before any paper order is submitted, VOLTRON evaluates 7 strict risk parameters:
1. **Opportunity Score Gate:** Requires Volatility Dislocation Score $\ge 70 / 100$.
2. **Max Trade Risk Gate:** Single-trade max loss strictly capped at $\le 1.0\%$ of total portfolio equity.
3. **Daily Loss Limit Gate:** Automated circuit breaker halts execution if daily drawdown reaches $2.0\%$.
4. **Portfolio Exposure Gate:** Aggregate open margin strictly capped at $\le 30.0\%$ of equity.
5. **Market Liquidity Gate:** Maximum bid-ask spread must be $\le 10.0\%$.
6. **Consecutive Losses Gate:** Enforces automated cooling period after 3 consecutive stop outs.
7. **Emergency Kill Switch:** Armed state instantly intercepts and blocks 100% of outgoing orders.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.11+ / 3.13+
- Node.js 18+ & npm

### 1. Clone & Configure Environment
```bash
git clone https://github.com/voltron-quant/voltron.git
cd voltron
cp .env.example .env
```
Edit `.env` and provide your Alpaca Paper API credentials and Google Gemini API key.

### 2. Run Backend Python Engine
```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### 3. Run Next.js Frontend Terminal
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification Suite

VOLTRON includes 51 automated tests covering Unit, Integration, Security, Stress, and E2E regression:

```bash
# Run complete test suite (51/51 passing)
python -m unittest tests/unit/test_quant_pipeline.py tests/unit/test_risk_safety_boundaries.py tests/unit/test_ai_safety_failures.py tests/unit/test_options_execution_mleg.py tests/integration/test_autonomous_lifecycle.py tests/security/test_security_audit.py tests/stress/test_stress_load.py tests/test_qa_suite.py
```

---

## 📄 Documentation Deliverables

- [**`HACKATHON_WRITEUP.md`**](file:///C:/Users/karma/voltron/HACKATHON_WRITEUP.md) — 1-page executive writeup for hackathon judges.
- [**`DEMO_SCRIPT.md`**](file:///C:/Users/karma/voltron/DEMO_SCRIPT.md) — Timestamped 3-5 minute live walkthrough presentation script.
- [**`PITCH.md`**](file:///C:/Users/karma/voltron/PITCH.md) — 60-second elevator pitch.
- [**`FINAL_TEST_MATRIX.md`**](file:///C:/Users/karma/voltron/FINAL_TEST_MATRIX.md) — Full test execution matrix with evidence.
- [**`QA_REPORT.md`**](file:///C:/Users/karma/voltron/QA_REPORT.md) — Detailed QA and stress profiling analysis.
- [**`SECURITY_REPORT.md`**](file:///C:/Users/karma/voltron/SECURITY_REPORT.md) — Institutional security and secret audit.
- [**`FAILURE_MATRIX.md`**](file:///C:/Users/karma/voltron/FAILURE_MATRIX.md) — Adverse failure modes and fail-closed state verification.
- [**`RELEASE_STATUS.md`**](file:///C:/Users/karma/voltron/RELEASE_STATUS.md) — Final release candidate sign-off.
