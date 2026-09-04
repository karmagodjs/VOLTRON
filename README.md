#  VOLTRON - Volatility Alpha

### Autonomous AI Options Trading Agent

VOLTRON is an AI-powered options trading agent that combines **quantitative volatility analysis, Gemini AI reasoning, risk management, and Alpaca Paper Trading**.

It analyzes **Implied Volatility (IV), Realized Volatility (RV), and the IV/RV ratio** to identify potential options opportunities. Gemini evaluates the market context, while deterministic risk gates control whether a trade can be executed.

If AI, market data, liquidity, or risk checks fail, VOLTRON automatically chooses **NO TRADE**.

##  Pipeline

```text
Market Data
    ↓
IV / RV Analysis
    ↓
Gemini AI
    ↓
Strategy Selection
    ↓
Risk Engine
    ↓
Alpaca Paper Trading
    ↓
Position Monitoring
````

##  Risk Controls

* Opportunity Score ≥ 70
* Trade Risk ≤ 1%
* Daily Loss Limit < 2%
* Portfolio Exposure ≤ 30%
* Options Spread ≤ 5%
* Maximum 3 consecutive losses
* Kill Switch
* Options Buying Power Validation
* Maximum 10 Contracts

##  Tech Stack

**Frontend:** Next.js, React, TypeScript \
**Backend:** Python, FastAPI \
**AI:** Google Gemini \
**Trading:** Alpaca Paper Trading \
**Deployment:** Vercel + Render

##  Live Demo

[Open VOLTRON Dashboard](https://voltron-cyan.vercel.app/dashboard)

##  Current Status

* $100,000 Fresh Alpaca Paper Account
* Options Level 3
* 93+ Tests Passed
* Trading Safety Gate Enabled
* Fail-Closed AI & Risk System

##  Disclaimer

VOLTRON is a hackathon research project using Alpaca Paper Trading. It is not financial advice.
