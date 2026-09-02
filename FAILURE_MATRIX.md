# VOLTRON COMPREHENSIVE FAILURE MATRIX

This failure matrix defines how every subsystem responds under adverse conditions, verified by automated tests in `tests/`.

| Component | Failure Condition | Expected Safe State | Actual Measured State | Safe? | Verified Test Case |
|---|---|---|---|:---:|---|
| **AI Analyst (Gemini)** | Network Timeout / Disconnect | Return `NO_TRADE`, confidence `0`, no orders | `{"decision": "NO_TRADE", "confidence": 0}` | **YES** | `test_ai_api_timeout_exception` |
| **AI Analyst (Gemini)** | Missing / Invalid API Key | Return `NO_TRADE`, confidence `0` | `{"decision": "NO_TRADE", "confidence": 0}` | **YES** | `test_ai_missing_gemini_api_key` |
| **AI Analyst (Gemini)** | Malformed JSON returned | Graceful fallback to `NO_TRADE` | `{"decision": "NO_TRADE", "confidence": 0}` | **YES** | `test_ai_malformed_json_response` |
| **AI Analyst (Gemini)** | Incomplete Market Data / Null Greeks | Must not hallucinate, return `NO_TRADE` | `{"decision": "NO_TRADE", "confidence": 0}` | **YES** | `test_ai_incomplete_greeks_and_prices` |
| **Quant Strategy Selector** | Opportunity Score < 70 | Reject candidate, return `NO_TRADE` | Returns `"NO_TRADE"` | **YES** | `test_strategy_boundary_opp_score_69` |
| **Quant Strategy Selector** | AI Confidence < 70% | Reject candidate, return `NO_TRADE` | Returns `"NO_TRADE"` | **YES** | `test_strategy_boundary_confidence_69` |
| **Risk Engine** | Risk Engine Offline / Nil | Fail-Closed: Block all order execution | Returns `(False, "NO_RISK_ENGINE")` | **YES** | `test_risk_fail_closed_zero_equity` |
| **Risk Engine (Gate 1)** | Opportunity Score < 70 | Block trade | Returns `(False, "OPPORTUNITY_SCORE_TOO_LOW")` | **YES** | `test_gate_01_opportunity_score_boundary` |
| **Risk Engine (Gate 2)** | Trade Risk > 1.0% Equity | Block trade | Returns `(False, "TRADE_RISK_TOO_HIGH")` | **YES** | `test_gate_02_max_trade_risk_boundary` |
| **Risk Engine (Gate 3)** | Daily Loss ≥ 2.0% Equity | Block trade | Returns `(False, "DAILY_LOSS_LIMIT_REACHED")` | **YES** | `test_gate_03_max_daily_loss_boundary` |
| **Risk Engine (Gate 4)** | Exposure > 30.0% Equity | Block trade | Returns `(False, "PORTFOLIO_EXPOSURE_TOO_HIGH")` | **YES** | `test_gate_04_max_portfolio_exposure_boundary` |
| **Risk Engine (Gate 5)** | Consecutive Losses ≥ 3 | Block trade | Returns `(False, "CONSECUTIVE_LOSS_LIMIT")` | **YES** | `test_gate_05_consecutive_losses_boundary` |
| **Risk Engine (Gate 6)** | Bid-Ask Spread > 10.0% | Block trade | Returns `(False, "SPREAD_TOO_WIDE")` | **YES** | `test_risk_safety_boundaries` |
| **Risk Engine (Gate 7)** | Emergency Kill Switch Active | Block 100% of incoming trades | Returns `(False, "KILL_SWITCH_ACTIVE")` | **YES** | `test_gate_06_kill_switch_fail_closed` |
| **Execution Engine** | Invalid Multi-Leg Quantity (≤ 0) | Raise validation error before broker send | Raises `ValueError("Invalid quantity")` | **YES** | `test_build_iron_condor_invalid_quantity` |
| **Execution Engine** | Non-Paper Domain Configured | Block connection | Locked to `paper-api.alpaca.markets` | **YES** | `test_paper_only_domain_enforcement` |
| **Position Monitor** | Price Drops Below Stop Loss | Trigger `STOP_LOSS` exit signal | Returns `(True, "STOP_LOSS")` | **YES** | `test_position_monitor_take_profit_and_stop_loss` |
| **Position Monitor** | Price Reaches Take Profit (+50%) | Trigger `TAKE_PROFIT` exit signal | Returns `(True, "TAKE_PROFIT")` | **YES** | `test_position_monitor_take_profit_and_stop_loss` |
| **Autonomous Agent Loop** | Risk Rejection during cycle | Transition safely to `RISK_REJECTED`, 0 orders | Status updated to `"RISK_REJECTED"` | **YES** | `test_state_consistency_on_risk_rejection` |
