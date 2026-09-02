# 🎬 VOLTRON — LIVE HACKATHON DEMO SCRIPT (3–5 MINS)

**Target Audience:** Hackathon Judges & Quantitative Engineers  
**Live Production URL:** [https://frontend-two-kappa-80npppsqjt.vercel.app](https://frontend-two-kappa-80npppsqjt.vercel.app)  
**Demo Flow:** 9 Coordinated Modules (`/dashboard` → `/agent` → `/options` → `/risk` → `/trades` → `/portfolio` → `/backtest` → `/analytics` → `/system`)

---

## ⏱️ Timeline & Presentation Flow

### **[00:00 - 00:30] 1. Introduction & Mission Statement**
- **Action:** Open [`/dashboard`](https://frontend-two-kappa-80npppsqjt.vercel.app/dashboard).
- **Spoken Script:**  
  *"Welcome judges. This is VOLTRON—an institutional autonomous AI options trading terminal. Most retail trading algorithms fail because LLMs hallucinate prices or lack strict risk controls. VOLTRON solves this by pairing Google Gemini 3.6 Pro's macroeconomic reasoning with deterministic volatility quantitative modeling and 7 pre-trade safety gates connected to Alpaca Paper."*
- **Key Visuals:** High-density command center with live ticker strip (SPY, QQQ, NVDA), portfolio equity, and real-time Greek telemetry ($\Delta, \Theta, \nu$).

---

### **[00:30 - 01:10] 2. Autonomous AI Agent & State Machine**
- **Action:** Navigate to [`/agent`](https://frontend-two-kappa-80npppsqjt.vercel.app/agent).
- **Spoken Script:**  
  *"Here in the AI Agent Command Center, VOLTRON operates on an 8-stage autonomous cycle: Scan, Analyze, Select Strategy, Evaluate Risk, Execute, Monitor, Exit, and Log. Notice that our Gemini 3.6 analyst does not guess prices—it evaluates market regime dislocations, assigns an 88% confidence score, and synthesizes a delta-neutral thesis."*
- **Key Visuals:** Live agent timeline, AI reasoning thesis card, confidence gauges, and state machine transitions.

---

### **[01:10 - 01:45] 3. Options Volatility Terminal & Chain Surface**
- **Action:** Navigate to [`/options`](https://frontend-two-kappa-80npppsqjt.vercel.app/options).
- **Spoken Script:**  
  *"In the Options Command Terminal, VOLTRON computes implied volatility from real-time option chain midpoints against 30-day historical realized volatility. When IV/RV exceeds 1.15x, the system flags Expensive Volatility and automatically filters for delta-neutral 45 DTE credit spreads."*
- **Key Visuals:** Interactive options chain with Call/Put Greeks, IV/RV spread bar, and strategy payoff diagram.

---

### **[01:45 - 02:30] 4. Risk & Safety Command Center (7 Pre-Trade Gates)**
- **Action:** Navigate to [`/risk`](https://frontend-two-kappa-80npppsqjt.vercel.app/risk).
- **Spoken Script:**  
  *"Safety is VOLTRON's primary mandate. Before any order is routed to Alpaca, it must pass all 7 institutional gates: Opportunity Hurdle (≥70), Single-Trade Risk (≤1%), Daily Loss Circuit (≤2%), Portfolio Exposure (≤30%), Consecutive Loss Stop (3 losses), Bid-Ask Spread (≤10%), and the Emergency Kill Switch. If any gate fails, or if the risk engine goes offline, execution is 100% fail-closed."*
- **Key Visuals:** 6 live risk gauges, 7 clickable gate detail cards, candidate trade decision card (`✓ RISK APPROVED`), and Emergency Kill Switch safeguard modal.

---

### **[02:30 - 03:15] 5. Paper Operations & Execution Ledger**
- **Action:** Navigate to [`/trades`](https://frontend-two-kappa-80npppsqjt.vercel.app/trades) then [`/portfolio`](https://frontend-two-kappa-80npppsqjt.vercel.app/portfolio).
- **Spoken Script:**  
  *"In the Order Operations Ledger, we observe our multi-leg 4-contract SPY Iron Condor order filled at $1.85 limit price. Over in Portfolio Operations, our position monitor actively tracks our automated 50% Take-Profit ($0.92) and 100% Stop-Loss ($3.70) dynamic exit boundaries."*
- **Key Visuals:** MLeg execution details, nested option legs, fill latency (320ms), and real-time Greek portfolio totals.

---

### **[03:15 - 04:00] 6. Quant Research, Analytics & System Observability**
- **Action:** Navigate to [`/analytics`](https://frontend-two-kappa-80npppsqjt.vercel.app/analytics) then [`/system`](https://frontend-two-kappa-80npppsqjt.vercel.app/system).
- **Spoken Script:**  
  *"In Analytics Intelligence, we benchmark strategy alpha across 6 option structures, verifying a 2.18 Sharpe ratio and 78.4% win rate with 94.2% backtest parity. Finally, in System Observability, every trade lifecycle is assigned a unique trace ID (`VOL-2026-000128`), giving operators a complete, immutable audit trail from scanner signal to final P&L."*
- **Key Visuals:** 6-tab analytics workspace, 11-component service health matrix, and 8-stage trade reconstruction trace.

---

### **[04:00 - 04:30] 7. Closing & Final Pitch**
- **Spoken Script:**  
  *"VOLTRON bridges the gap between modern generative AI and rigid quantitative financial engineering. It is safe, transparent, reproducible, and ready for institutional deployment on Alpaca Paper. Thank you."*
