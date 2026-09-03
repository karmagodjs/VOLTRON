import os
import pytest
from datetime import datetime, date, timedelta, timezone

from risk.risk_engine import RiskEngine, check_liquidity
from risk.limits import (
    MAX_TRADE_RISK,
    MAX_DAILY_LOSS,
    MAX_PORTFOLIO_EXPOSURE,
    MAX_CONSECUTIVE_LOSSES,
    MIN_OPPORTUNITY_SCORE,
    MAX_SPREAD_PERCENT,
)
from quant.strategy_selector import select_strategy
from quant.trade_validator import (
    validate_trade,
    validate_occ_symbol,
    validate_buying_power,
    validate_strategy_name,
)
from execution.order_builder import (
    build_option_buy_order,
    build_option_sell_order,
    validate_defined_risk_order,
)
from execution.multileg import (
    build_iron_condor,
    build_vertical_spread,
    build_long_straddle,
)
from execution.executor import PaperExecutor, is_trading_enabled
from agent.decision import validate_ai_decision
from agent.monitor import PositionMonitor
from agent.trade_logger import TradeLogger


# ==========================================
# GATE 1: OPPORTUNITY SCORE THRESHOLD
# ==========================================
def test_gate1_opportunity_score_threshold():
    engine = RiskEngine(account_equity=100000.0)

    # Below 70 must be rejected
    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=69, proposed_exposure=500.0)
    assert not approved
    assert reason == "OPPORTUNITY_SCORE_TOO_LOW"

    # Exactly 70 or above must pass
    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=70, proposed_exposure=500.0)
    assert approved
    assert reason == "RISK_APPROVED"


# ==========================================
# GATE 2: CONFIDENCE THRESHOLD
# ==========================================
def test_gate2_confidence_threshold():
    # Below 70 confidence rejected
    valid, reason = validate_ai_decision("TRADE_CANDIDATE", confidence=65, opportunity_score=85)
    assert not valid
    assert "confidence too low" in reason.lower()

    # 70+ confidence approved
    valid, reason = validate_ai_decision("TRADE_CANDIDATE", confidence=75, opportunity_score=85)
    assert valid
    assert reason == "AI decision passed"

    # Strategy selector requires confidence >= 70
    strat = select_strategy({
        "decision": "TRADE_CANDIDATE",
        "confidence": 69,
        "opportunity_score": 85,
        "iv_rv_ratio": 1.6,
    })
    assert strat == "NO_TRADE"


# ==========================================
# GATE 3: MAXIMUM TRADE RISK (1% EQUITY)
# ==========================================
def test_gate3_maximum_trade_risk():
    engine = RiskEngine(account_equity=100000.0)

    # $1,001 risk must be rejected (1% of $100,000 is $1,000)
    approved, reason = engine.evaluate(max_loss=1001.0, opportunity_score=80, proposed_exposure=1001.0)
    assert not approved
    assert reason == "TRADE_RISK_TOO_HIGH"

    # $999 risk must be approved
    approved, reason = engine.evaluate(max_loss=999.0, opportunity_score=80, proposed_exposure=999.0)
    assert approved
    assert reason == "RISK_APPROVED"


# ==========================================
# GATE 4: DAILY LOSS LIMIT (2% EQUITY)
# ==========================================
def test_gate4_daily_loss_limit():
    engine = RiskEngine(account_equity=100000.0)
    # Simulate losses reaching 2% ($2,000)
    engine.record_trade_result(-2000.0)

    # Must be rejected because daily loss limit reached and kill switch activated
    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=80, proposed_exposure=500.0)
    assert not approved
    assert engine.kill_switch is True


# ==========================================
# GATE 5: PORTFOLIO EXPOSURE LIMIT (30% EQUITY)
# ==========================================
def test_gate5_portfolio_exposure_limit():
    engine = RiskEngine(account_equity=100000.0)
    engine.portfolio_exposure = 28000.0  # already at 28%

    # Adding $3,000 would breach 30% ($30,000) -> rejected
    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=80, proposed_exposure=3000.0)
    assert not approved
    assert reason == "PORTFOLIO_EXPOSURE_TOO_HIGH"

    # Adding $1,500 keeps exposure at $29,500 (< $30,000) -> approved
    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=80, proposed_exposure=1500.0)
    assert approved


# ==========================================
# GATE 6: CONSECUTIVE LOSS LIMIT (MAX 3)
# ==========================================
def test_gate6_consecutive_loss_limit():
    engine = RiskEngine(account_equity=100000.0)
    engine.record_trade_result(-100.0)
    engine.record_trade_result(-100.0)
    engine.record_trade_result(-100.0)  # 3 consecutive losses

    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=80, proposed_exposure=500.0)
    assert not approved
    assert reason == "CONSECUTIVE_LOSS_LIMIT"

    # Win resets consecutive losses
    engine.record_trade_result(200.0)
    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=80, proposed_exposure=500.0)
    assert approved


# ==========================================
# GATE 7: LIQUIDITY / SPREAD CHECK
# ==========================================
def test_gate7_liquidity_spread_check():
    engine = RiskEngine(account_equity=100000.0)

    # Spread > 10% must be rejected
    ok, reason = engine.check_liquidity(12.5)
    assert not ok
    assert reason == "SPREAD_TOO_WIDE"

    # None / missing spread data must be rejected
    ok, reason = engine.check_liquidity(None)
    assert not ok
    assert reason == "NO_SPREAD_DATA"

    # Spread <= 10% (e.g. 4%) must be approved
    ok, reason = engine.check_liquidity(4.0)
    assert ok
    assert reason == "LIQUIDITY_APPROVED"


# ==========================================
# GATE 8: CONTRACT VALIDATION (OCC FORMAT)
# ==========================================
def test_gate8_contract_validation():
    # Valid future contract
    ok, reason = validate_occ_symbol("SPY260918C00595000")
    assert ok
    assert reason == "VALID_OCC_SYMBOL"

    # Malformed symbol
    ok, reason = validate_occ_symbol("SPY-INVALID-SYMBOL")
    assert not ok
    assert reason == "MALFORMED_OCC_SYMBOL"

    # Expired contract (past date)
    ok, reason = validate_occ_symbol("SPY200101C00300000")
    assert not ok
    assert reason == "EXPIRED_CONTRACT"

    # Zero strike
    ok, reason = validate_occ_symbol("SPY260918C00000000")
    assert not ok
    assert reason == "INVALID_STRIKE_PRICE"


# ==========================================
# GATE 9: BUYING POWER CHECK
# ==========================================
def test_gate9_buying_power_check():
    # Sufficient buying power
    ok, reason = validate_buying_power(required_capital=945.0, available_buying_power=200000.0)
    assert ok
    assert reason == "BUYING_POWER_SUFFICIENT"

    # Insufficient buying power
    ok, reason = validate_buying_power(required_capital=5000.0, available_buying_power=2500.0)
    assert not ok
    assert "INSUFFICIENT_BUYING_POWER" in reason


# ==========================================
# GATE 10: DEFINED-RISK VALIDATION (NO NAKED SHORTS)
# ==========================================
def test_gate10_no_naked_shorts():
    # Single-leg buy is permitted (defined risk: max loss = premium)
    buy_order = build_option_buy_order("SPY260918C00595000", quantity=1, limit_price=2.50)
    ok, reason = validate_defined_risk_order(buy_order)
    assert ok
    assert reason == "DEFINED_RISK_APPROVED"

    # Single-leg sell must be rejected immediately
    with pytest.raises(ValueError, match="Naked short option orders are strictly prohibited"):
        build_option_sell_order("SPY260918C00595000", quantity=1, limit_price=2.50)

    # Vertical spread with 1 BUY and 1 SELL is defined risk
    vert_order = build_vertical_spread(
        long_leg="SPY260918C00600000",
        short_leg="SPY260918C00595000",
        quantity=1,
        limit_price=1.20
    )
    ok, reason = validate_defined_risk_order(vert_order)
    assert ok
    assert reason == "DEFINED_RISK_APPROVED"

    # Iron Condor with 2 BUY and 2 SELL is defined risk
    ic_order = build_iron_condor(
        long_put="SPY260918P00580000",
        short_put="SPY260918P00585000",
        short_call="SPY260918C00605000",
        long_call="SPY260918C00610000",
        quantity=1,
        limit_price=1.50
    )
    ok, reason = validate_defined_risk_order(ic_order)
    assert ok
    assert reason == "DEFINED_RISK_APPROVED"


# ==========================================
# GATE 11: FINAL SAFETY GATE (VOLTRON_TRADING_ENABLED)
# ==========================================
def test_gate11_final_safety_gate():
    engine = RiskEngine(account_equity=100000.0)
    executor = PaperExecutor(engine)

    order = build_option_buy_order("SPY260918C00595000", quantity=1, limit_price=2.50)

    # Ensure trading is disabled
    os.environ["VOLTRON_TRADING_ENABLED"] = "false"

    result = executor.submit_option_order(
        order=order,
        max_loss=250.0,
        opportunity_score=85,
        proposed_exposure=250.0,
        spread_percent=0.04,
        dry_run=False
    )

    assert result["submitted"] is False
    assert result["reason"] == "TRADING_DISABLED"
    assert result["safety_gate"] == "VOLTRON_TRADING_ENABLED=false"


# ==========================================
# GATE 12: DRY-RUN EXECUTION SIMULATION
# ==========================================
def test_gate12_dry_run_execution():
    engine = RiskEngine(account_equity=100000.0)
    executor = PaperExecutor(engine)

    order = build_vertical_spread(
        long_leg="SPY260918C00600000",
        short_leg="SPY260918C00595000",
        quantity=2,
        limit_price=1.20
    )

    result = executor.submit_option_order(
        order=order,
        max_loss=500.0,
        opportunity_score=85,
        proposed_exposure=500.0,
        spread_percent=0.04,
        dry_run=True,
        available_buying_power=200000.0
    )

    assert result["submitted"] is False
    assert result["execution_mode"] == "PAPER_DRY_RUN"
    assert result["reason"] == "DRY_RUN_PASSED"
    assert result["status"] == "APPROVED_PRE_SUBMISSION"
    assert result["safety_gate"] == "ORDER_SUBMISSION_PREVENTED"
    assert result["details"]["defined_risk"] == "APPROVED"
    assert result["details"]["risk_engine"] == "APPROVED"
