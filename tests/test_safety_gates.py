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


def test_gate1_opportunity_score_threshold():
    engine = RiskEngine(account_equity=100000.0)

    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=69, proposed_exposure=500.0)
    assert not approved
    assert reason == "OPPORTUNITY_SCORE_TOO_LOW"

    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=70, proposed_exposure=500.0)
    assert approved
    assert reason == "RISK_APPROVED"


def test_gate2_confidence_threshold():
    valid, reason = validate_ai_decision("TRADE_CANDIDATE", confidence=65, opportunity_score=85)
    assert not valid
    assert "confidence too low" in reason.lower()

    valid, reason = validate_ai_decision("TRADE_CANDIDATE", confidence=75, opportunity_score=85)
    assert valid
    assert reason == "AI decision passed"

    strat = select_strategy({
        "decision": "TRADE_CANDIDATE",
        "confidence": 69,
        "opportunity_score": 85,
        "iv_rv_ratio": 1.6,
    })
    assert strat == "NO_TRADE"


def test_gate3_maximum_trade_risk():
    engine = RiskEngine(account_equity=100000.0)

    approved, reason = engine.evaluate(max_loss=1001.0, opportunity_score=80, proposed_exposure=1001.0)
    assert not approved
    assert reason == "TRADE_RISK_TOO_HIGH"

    approved, reason = engine.evaluate(max_loss=999.0, opportunity_score=80, proposed_exposure=999.0)
    assert approved
    assert reason == "RISK_APPROVED"


def test_gate4_daily_loss_limit():
    engine = RiskEngine(account_equity=100000.0)
    engine.record_trade_result(-2000.0)

    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=80, proposed_exposure=500.0)
    assert not approved
    assert engine.kill_switch is True


def test_gate5_portfolio_exposure_limit():
    engine = RiskEngine(account_equity=100000.0)
    engine.portfolio_exposure = 28000.0

    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=80, proposed_exposure=3000.0)
    assert not approved
    assert reason == "PORTFOLIO_EXPOSURE_TOO_HIGH"

    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=80, proposed_exposure=1500.0)
    assert approved


def test_gate6_consecutive_loss_limit():
    engine = RiskEngine(account_equity=100000.0)
    engine.record_trade_result(-100.0)
    engine.record_trade_result(-100.0)
    engine.record_trade_result(-100.0)

    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=80, proposed_exposure=500.0)
    assert not approved
    assert reason == "CONSECUTIVE_LOSS_LIMIT"

    engine.record_trade_result(200.0)
    approved, reason = engine.evaluate(max_loss=500.0, opportunity_score=80, proposed_exposure=500.0)
    assert approved


def test_gate7_liquidity_spread_check():
    engine = RiskEngine(account_equity=100000.0)

    ok, reason = engine.check_liquidity(12.5)
    assert not ok
    assert reason == "SPREAD_TOO_WIDE"

    ok, reason = engine.check_liquidity(None)
    assert not ok
    assert reason == "NO_SPREAD_DATA"

    ok, reason = engine.check_liquidity(4.0)
    assert ok
    assert reason == "LIQUIDITY_APPROVED"


def test_gate8_contract_validation():
    ok, reason = validate_occ_symbol("SPY260918C00595000")
    assert ok
    assert reason == "VALID_OCC_SYMBOL"

    ok, reason = validate_occ_symbol("SPY-INVALID-SYMBOL")
    assert not ok
    assert reason == "MALFORMED_OCC_SYMBOL"

    ok, reason = validate_occ_symbol("SPY200101C00300000")
    assert not ok
    assert reason == "EXPIRED_CONTRACT"

    ok, reason = validate_occ_symbol("SPY260918C00000000")
    assert not ok
    assert reason == "INVALID_STRIKE_PRICE"


def test_gate9_buying_power_check():
    ok, reason = validate_buying_power(required_capital=945.0, available_buying_power=200000.0)
    assert ok
    assert reason == "BUYING_POWER_SUFFICIENT"

    ok, reason = validate_buying_power(required_capital=5000.0, available_buying_power=2500.0)
    assert not ok
    assert "INSUFFICIENT_BUYING_POWER" in reason


def test_gate10_no_naked_shorts():
    buy_order = build_option_buy_order("SPY260918C00595000", quantity=1, limit_price=2.50)
    ok, reason = validate_defined_risk_order(buy_order)
    assert ok
    assert reason == "DEFINED_RISK_APPROVED"

    with pytest.raises(ValueError, match="Naked short option orders are strictly prohibited"):
        build_option_sell_order("SPY260918C00595000", quantity=1, limit_price=2.50)

    vert_order = build_vertical_spread(
        long_leg="SPY260918C00600000",
        short_leg="SPY260918C00595000",
        quantity=1,
        limit_price=1.20
    )
    ok, reason = validate_defined_risk_order(vert_order)
    assert ok
    assert reason == "DEFINED_RISK_APPROVED"

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


def test_gate11_final_safety_gate():
    engine = RiskEngine(account_equity=100000.0)
    executor = PaperExecutor(engine)

    order = build_option_buy_order("SPY260918C00595000", quantity=1, limit_price=2.50)

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


def test_no_trade_cannot_select_executable_strategy():
    from unittest.mock import patch
    from backend.service import voltron_service

    with patch.object(
        voltron_service,
        "get_ai_analysis",
        return_value={"decision": "NO_TRADE", "confidence": 0.0, "direction": "NEUTRAL"}
    ):
        result = voltron_service.run_dry_run("SPY", simulate_candidate=False)

        assert result["selected_strategy"] == "NO_TRADE"
        assert result["selected_contracts"] == []
        assert result["position_size"] == 0
        assert result["entry_price"] == 0.0
        assert result["maximum_loss"] == 0.0
        assert result["execution_status"] == "NO_TRADE_DECISION"
        assert result["execution_mode"] == "PAPER_DRY_RUN"
        assert result["alpaca_order_submitted"] is False
        assert result["hypothetical_strategy"]["executable"] is False


def test_iv_rv_mathematical_consistency():
    from quant.alpha import calculate_iv_rv_ratio

    ratio1 = calculate_iv_rv_ratio(11.10, 7.40)
    assert round(ratio1, 2) == 1.50

    ratio2 = calculate_iv_rv_ratio(11.24, 7.39)
    assert round(ratio2, 2) == 1.52

    assert round(ratio1, 2) != 1.00


def test_live_vs_fixture_data_detection():
    from backend.service import voltron_service

    result = voltron_service.run_dry_run("SPY", simulate_candidate=False)

    assert result["underlying_price"] != 595.0 or result["data_source"] == "ALPACA_IEX"
    assert "market_data_timestamp" in result
    assert "option_data_timestamp" in result
    assert "rv_data_window" in result
    assert "iv_source" in result
    assert result["rv_data_window"] == "20_DAY_HISTORICAL_BARS"


def test_contract_underlying_consistency():
    from backend.service import voltron_service

    result = voltron_service.run_dry_run("SPY", simulate_candidate=True)
    contracts = result.get("selected_contracts", [])
    spot = result.get("underlying_price", 0.0)

    if contracts and spot > 0:
        for c in contracts:
            valid, reason = validate_occ_symbol(c["symbol"])
            assert valid, f"Contract {c['symbol']} failed OCC validation: {reason}"

            assert abs(c["strike"] - spot) <= (spot * 0.10), (
                f"Strike {c['strike']} is not appropriate for underlying price {spot}"
            )


def test_250_contract_candidate_rejected():
    from risk.limits import MAX_CONTRACT_QUANTITY
    engine = RiskEngine(account_equity=100000.0)
    executor = PaperExecutor(engine)

    ok, reason = engine.check_order_size(250)
    assert not ok
    assert reason == "ORDER_SIZE_TOO_LARGE"

    mock_order = {"qty": 250, "side": "buy"}
    result = executor.submit_option_order(
        order=mock_order,
        max_loss=1000.0,
        opportunity_score=85,
        proposed_exposure=1000.0,
        spread_percent=0.04,
        dry_run=True,
    )
    assert result["submitted"] is False
    assert result["reason"] == "ORDER_SIZE_TOO_LARGE"
    assert result["gate"] == "ORDER_SIZE_GATE"


def test_10_contract_candidate_accepted():
    from risk.limits import MAX_CONTRACT_QUANTITY
    engine = RiskEngine(account_equity=100000.0)

    ok, reason = engine.check_order_size(MAX_CONTRACT_QUANTITY)
    assert ok
    assert reason == "ORDER_SIZE_APPROVED"

    approved, reason = engine.evaluate(
        max_loss=500.0,
        opportunity_score=85,
        proposed_exposure=500.0,
        quantity=MAX_CONTRACT_QUANTITY,
    )
    assert approved
    assert reason == "RISK_APPROVED"


def test_quantity_cap_cannot_be_bypassed():
    from risk.position_sizing import calculate_position_size
    from risk.limits import MAX_CONTRACT_QUANTITY

    qty = calculate_position_size(account_equity=100000.0, max_loss_per_contract=4.0)
    assert qty == MAX_CONTRACT_QUANTITY
    assert qty <= 10

    huge_qty = calculate_position_size(account_equity=1000000.0, max_loss_per_contract=1.0)
    assert huge_qty == MAX_CONTRACT_QUANTITY

    with pytest.raises(ValueError, match="exceeds maximum contract limit"):
        build_option_buy_order("SPY260918C00765000", quantity=250, limit_price=2.50)

    with pytest.raises(ValueError, match="exceeds maximum contract limit"):
        build_iron_condor(
            long_put="SPY260918P00760000",
            short_put="SPY260918P00762000",
            short_call="SPY260918C00768000",
            long_call="SPY260918C00770000",
            quantity=250,
            limit_price=1.50
        )


def test_multileg_quantity_consistency():
    from backend.service import voltron_service

    result = voltron_service.run_dry_run("SPY", simulate_candidate=True)
    contracts = result.get("selected_contracts", [])
    pos_size = result.get("position_size", 0)

    assert 1 <= pos_size <= 10
    assert len(contracts) == 4
    for leg in contracts:
        assert leg["quantity"] == pos_size, (
            f"Leg {leg['symbol']} quantity {leg['quantity']} != position_size {pos_size}"
        )


def test_liquidity_depth_failure():
    engine = RiskEngine(account_equity=100000.0)

    ok, reason = engine.check_liquidity(spread_percent=0.04, quantity=15, available_size=10)
    assert not ok
    assert reason == "ORDER_SIZE_TOO_LARGE"

    ok, reason = engine.check_liquidity(spread_percent=0.04, quantity=8, available_size=5)
    assert not ok
    assert reason == "INSUFFICIENT_LIQUIDITY_FOR_SIZE"


def test_maximum_loss_remains_within_risk_budget():
    from backend.service import voltron_service

    result = voltron_service.run_dry_run("SPY", simulate_candidate=True)
    max_loss = result.get("maximum_loss", 0.0)
    equity = result.get("risk_approval", {}).get("account_equity", 100000.0)
    max_allowed = equity * 0.01

    assert max_loss <= max_allowed, f"Maximum loss {max_loss} exceeds allowed risk budget {max_allowed}"
    assert max_loss > 0.0


def test_options_buying_power_enforced_and_general_bp_cannot_bypass():
    from quant.trade_validator import validate_options_buying_power

    valid, reason = validate_options_buying_power(
        required_capital=150000.0,
        options_buying_power=100000.0,
        general_buying_power=400000.0
    )
    assert not valid
    assert "BUYING_POWER_INSUFFICIENT" in reason
    assert "cannot be used for options" in reason

    engine = RiskEngine(account_equity=100000.0)
    executor = PaperExecutor(engine)
    mock_order = {"qty": 5, "side": "buy"}
    res = executor.submit_option_order(
        order=mock_order,
        max_loss=500.0,
        opportunity_score=85,
        proposed_exposure=500.0,
        spread_percent=0.04,
        options_buying_power=200.0,
        general_buying_power=400000.0,
    )
    assert res["submitted"] is False
    assert res["gate"] == "BUYING_POWER_GATE"
    assert "BUYING_POWER_INSUFFICIENT" in res["reason"]


def test_liquidity_depth_source_truthful():
    from backend.service import voltron_service

    result = voltron_service.run_dry_run("SPY", simulate_candidate=True)
    liq = result["liquidity_approval"]
    assert "depth_source" in liq
    assert liq["depth_source"] in ("UNAVAILABLE_CONSERVATIVE_CAP", "ALPACA_MARKET_DATA")
    if liq["depth_source"] == "UNAVAILABLE_CONSERVATIVE_CAP":
        assert liq["available_depth"] == 10


def test_multileg_independent_liquidity_validation():
    from quant.trade_validator import validate_multileg_liquidity

    legs_missing = [
        {"symbol": "LEG_1", "bid": 7.0, "ask": 7.1},
        {"symbol": "LEG_2", "bid": None, "ask": 7.0},
    ]
    ok, reason, _ = validate_multileg_liquidity(legs_missing)
    assert not ok
    assert "LEG_MISSING_QUOTE_DATA" in reason

    legs_wide = [
        {"symbol": "LEG_1", "bid": 7.0, "ask": 7.05},
        {"symbol": "LEG_2", "bid": 6.9, "ask": 7.0},
        {"symbol": "LEG_3", "bid": 1.0, "ask": 1.5},
    ]
    ok, reason, _ = validate_multileg_liquidity(legs_wide, max_spread_percent=10.0)
    assert not ok
    assert "LEG_SPREAD_TOO_WIDE" in reason

    legs_valid = [
        {"symbol": "LEG_1", "bid": 7.39, "ask": 7.42},
        {"symbol": "LEG_2", "bid": 6.92, "ask": 7.04},
        {"symbol": "LEG_3", "bid": 7.57, "ask": 7.63},
        {"symbol": "LEG_4", "bid": 7.03, "ask": 7.09},
    ]
    ok, reason, reports = validate_multileg_liquidity(legs_valid, max_spread_percent=10.0)
    assert ok
    assert reason == "ALL_LEGS_LIQUIDITY_APPROVED"
    assert len(reports) == 4
    assert all(r["liquid"] for r in reports)


def test_conservative_execution_pricing():
    from backend.service import voltron_service

    result = voltron_service.run_dry_run("SPY", simulate_candidate=True)
    pricing = result.get("execution_pricing", {})

    assert "bid_based_credit" in pricing
    assert "ask_based_debit" in pricing
    assert "conservative_executable_credit" in pricing
    assert "estimated_net_credit" in pricing
    assert pricing["pricing_assumption"] == "CONSERVATIVE_BID_ASK_CROSS"

    assert pricing["conservative_executable_credit"] <= pricing["estimated_net_credit"]
    assert result["entry_price"] == pricing["conservative_executable_credit"]


def test_worst_case_spread_width_and_economics():
    from backend.service import voltron_service

    result = voltron_service.run_dry_run("SPY", simulate_candidate=True)
    widths = result.get("spread_widths", {})
    assert "worst_case_spread_width" in widths
    assert widths["worst_case_spread_width"] == max(widths["put_spread_width"], widths["call_spread_width"])

    pos = result["position_size"]
    credit = result["entry_price"]
    w = widths["worst_case_spread_width"]

    expected_loss = round(pos * 100 * (w - credit), 2)
    expected_profit = round(pos * 100 * credit, 2)
    assert result["maximum_loss"] == expected_loss
    assert result["maximum_profit"] == expected_profit
    assert result["maximum_loss"] <= 1000.0


def test_disabled_trading_strictly_prevents_submit_order_call(monkeypatch):
    from unittest.mock import MagicMock
    from execution.executor import PaperExecutor

    monkeypatch.setenv("VOLTRON_TRADING_ENABLED", "false")

    engine = RiskEngine(account_equity=100000.0)
    executor = PaperExecutor(engine)

    mock_client = MagicMock()
    monkeypatch.setattr("execution.executor.get_trading_client", lambda: mock_client)

    mock_order = {"qty": 5, "side": "buy"}
    res = executor.submit_option_order(
        order=mock_order,
        max_loss=500.0,
        opportunity_score=85,
        proposed_exposure=500.0,
        spread_percent=0.04,
        dry_run=False,
    )

    assert res["submitted"] is False
    assert res["safety_gate"] == "VOLTRON_TRADING_ENABLED=false"
    assert res["reason"] == "TRADING_DISABLED"

    assert not mock_client.submit_order.called


def test_normal_dry_run_uses_genuine_ai_path_and_never_injects_candidate():
    from backend.service import voltron_service

    result = voltron_service.run_dry_run("SPY", simulate_candidate=False)

    assert "gemini_cache_status" in result
    assert result["gemini_cache_status"] in ("LIVE", "CACHED", "RATE_LIMITED", "ERROR")

    assert "gemini_input_data" in result
    input_data = result["gemini_input_data"]
    for k in ["symbol", "price", "rv", "iv", "iv_rv_ratio", "opportunity_score"]:
        assert k in input_data

    assert result.get("ai_status") != "SIMULATED_CANDIDATE"

    assert result["alpaca_order_submitted"] is False


def test_simulate_candidate_is_the_only_synthetic_candidate_path():
    from backend.service import voltron_service

    res_sim = voltron_service.run_dry_run("SPY", simulate_candidate=True)
    assert res_sim["ai_status"] == "SIMULATED_CANDIDATE"
    assert res_sim["alpaca_order_submitted"] is False

    res_normal = voltron_service.run_dry_run("SPY", simulate_candidate=False)
    assert res_normal["ai_status"] != "SIMULATED_CANDIDATE"
    assert res_normal["alpaca_order_submitted"] is False


def test_zero_alpaca_orders_submitted_across_multiple_runs():
    from backend.service import voltron_service

    for i in range(3):
        res = voltron_service.run_dry_run("SPY", simulate_candidate=False)
        assert res["alpaca_order_submitted"] is False
        assert "BLOCKED (VOLTRON_TRADING_ENABLED=false)" in res["final_safety_gate"]


def test_rate_limited_is_distinct_from_live_no_trade(monkeypatch):
    from backend.service import voltron_service

    monkeypatch.setattr(
        voltron_service,
        "get_ai_analysis",
        lambda sym: {
            "decision": "NO_TRADE",
            "confidence": 0,
            "status": "RATE_LIMITED",
            "ai_status": "RATE_LIMITED",
            "direction": "NEUTRAL",
            "thesis": "Gemini rate-limited (HTTP 429 quota reached); analysis deferred during cooldown.",
        }
    )
    res_rate_limited = voltron_service.run_dry_run("SPY", simulate_candidate=False)
    assert res_rate_limited["ai_status"] == "RATE_LIMITED"
    assert res_rate_limited["execution_status"] == "RATE_LIMITED_DEFERRED"
    assert res_rate_limited["risk_approval"]["reason"] == "GEMINI_RATE_LIMITED"

    monkeypatch.setattr(
        voltron_service,
        "get_ai_analysis",
        lambda sym: {
            "decision": "NO_TRADE",
            "confidence": 45,
            "status": "COMPLETE",
            "ai_status": "LIVE",
            "direction": "NEUTRAL",
            "thesis": "Implied volatility is fully priced; no edge detected.",
        }
    )
    res_live = voltron_service.run_dry_run("SPY", simulate_candidate=False)
    assert res_live["ai_status"] == "LIVE"
    assert res_live["execution_status"] == "NO_TRADE_DECISION"
    assert res_live["risk_approval"]["reason"] == "NO_TRADE_DECISION"

    assert res_rate_limited["ai_status"] != res_live["ai_status"]
    assert res_rate_limited["execution_status"] != res_live["execution_status"]
    assert res_rate_limited["risk_approval"]["reason"] != res_live["risk_approval"]["reason"]


def test_cached_successful_analysis_remains_usable():
    from backend.service import voltron_service
    import time

    now = time.time()
    cache_key = "SPY_TEST_CACHE_KEY"
    mock_cached = {
        "symbol": "SPY",
        "status": "COMPLETE",
        "ai_status": "LIVE",
        "decision": "TRADE_CANDIDATE",
        "confidence": 85,
        "direction": "NEUTRAL",
        "volatility_view": "EXPENSIVE",
        "strategy_recommendation": "IRON CONDOR",
        "thesis": "High IV/RV ratio justifies credit strategy.",
        "key_reasons": ["High IV premium"],
        "risks": ["Earnings vol"],
        "opportunity_score": 90,
        "timestamp": "2026-09-03T12:00:00Z",
    }
    voltron_service._ai_cache[cache_key] = {
        "analysis": dict(mock_cached),
        "_cached_at": now - 30,
        "iso_cached_at": "2026-09-03T12:00:00Z",
        "symbol": "SPY",
    }
    original_make_key = voltron_service._make_ai_cache_key
    voltron_service._make_ai_cache_key = lambda *args, **kwargs: cache_key

    try:
        res = voltron_service.get_ai_analysis("SPY")
        assert res["ai_status"] == "CACHED"
        assert res["is_cached"] is True
        assert res["confidence"] == 85
        assert res["decision"] == "TRADE_CANDIDATE"
    finally:
        voltron_service._make_ai_cache_key = original_make_key


def test_cache_expiry_triggers_fresh_request(monkeypatch):
    from backend.service import voltron_service
    import time

    now = time.time()
    cache_key = "SPY_EXPIRED_CACHE_KEY"
    voltron_service._ai_cache[cache_key] = {
        "analysis": {"decision": "NO_TRADE"},
        "_cached_at": now - 300,
        "iso_cached_at": "2026-09-03T11:00:00Z",
        "symbol": "SPY",
    }
    original_make_key = voltron_service._make_ai_cache_key
    voltron_service._make_ai_cache_key = lambda *args, **kwargs: cache_key

    called = []
    def mock_create(data):
        called.append(True)
        return {
            "decision": "NO_TRADE",
            "confidence": 50,
            "status": "COMPLETE",
            "ai_status": "LIVE",
            "direction": "NEUTRAL",
            "volatility_view": "FAIR",
            "thesis": "Fresh analysis after cache expiry",
        }

    monkeypatch.setattr("backend.service.create_analysis", mock_create)
    monkeypatch.setattr("agent.analyst.is_rate_limited", lambda: False)
    voltron_service._ai_last_call_time["SPY"] = 0.0

    try:
        res = voltron_service.get_ai_analysis("SPY")
        assert len(called) == 1
        assert res["ai_status"] == "LIVE"
        assert res["is_cached"] is False
    finally:
        voltron_service._make_ai_cache_key = original_make_key


def test_rate_limit_cooldown_prevents_request_storms():
    import time
    from unittest.mock import patch
    from agent.analyst import reset_rate_limit, reset_ai_cache, is_rate_limited, create_analysis
    import agent.analyst as analyst_mod

    reset_rate_limit()
    reset_ai_cache()
    assert not is_rate_limited()

    analyst_mod._rate_limit_until = time.time() + 60.0
    assert is_rate_limited()

    with patch("agent.analyst.get_openrouter_api_key", return_value=None), \
         patch("agent.analyst.genai") as mock_genai:
        for _ in range(10):
            res = create_analysis({"symbol": "SPY", "iv": 12.0, "rv": 8.0})
            assert res["status"] == "RATE_LIMITED"
            assert res["ai_status"] == "RATE_LIMITED"
            assert res["decision"] == "NO_TRADE"
            assert res["confidence"] == 0
        mock_genai.Client.assert_not_called()

    reset_ai_cache()
    mock_fallback_resp = {
        "decision": "TRADE_CANDIDATE",
        "confidence": 75,
        "volatility_view": "EXPENSIVE",
        "direction": "NEUTRAL",
        "thesis": "Fallback analysis",
        "key_reasons": ["High IV"],
        "risks": ["Tail risk"],
        "status": "COMPLETE",
        "ai_status": "LIVE",
        "ai_provider": "OPENROUTER",
    }
    with patch("agent.analyst.get_openrouter_api_key", return_value="dummy-key"), \
         patch("agent.analyst.call_openrouter_fallback", return_value=mock_fallback_resp) as mock_fb, \
         patch("agent.analyst.genai") as mock_genai:
        res = create_analysis({"symbol": "QQQ", "iv": 18.0, "rv": 10.0})
        assert res["status"] == "COMPLETE"
        assert res["ai_provider"] == "OPENROUTER"
        mock_fb.assert_called_once()
        mock_genai.Client.assert_not_called()

    reset_rate_limit()
    reset_ai_cache()


def test_rate_limit_fallback_cannot_become_trade_candidate():
    from quant.strategy_selector import select_strategy

    rate_limited_input = {
        "decision": "NO_TRADE",
        "confidence": 0,
        "opportunity_score": 95,
        "direction": "NEUTRAL",
        "iv_rv_ratio": 1.55,
    }

    strat = select_strategy(rate_limited_input)
    assert strat == "NO_TRADE"
