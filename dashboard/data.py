from datetime import datetime


def get_dashboard_state():

    return {
        "symbol": "SPY",

        "market_regime": "NEUTRAL",

        "price": 0.0,

        "realized_volatility": 0.0,

        "implied_volatility": 0.0,

        "iv_rv_ratio": 0.0,

        "opportunity_score": 0,

        "ai_confidence": 0,

        "strategy": "NO_TRADE",

        "risk_status": "WAITING",

        "portfolio_value": 100000,

        "daily_pnl": 0.0,

        "max_drawdown": 0.0,

        "open_positions": 0,

        "agent_status": "IDLE",

        "ai_thesis": (
            "Waiting for the next market scan."
        ),

        "last_update": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),
    }


def get_agent_data(agent=None):

    if agent is None:
        return {
            "status": "IDLE",
            "cycle": 0,
            "symbol": "-",
            "decision": "-",
            "strategy": "NO_TRADE",
            "confidence": 0,
            "opportunity_score": 0,
            "active_order_id": None,
            "last_reason": "Agent not connected",
        }

    state = agent.state

    return {
        "status": state.status,
        "cycle": state.cycle,
        "symbol": state.symbol or "-",
        "decision": state.decision or "-",
        "strategy": state.strategy or "NO_TRADE",
        "confidence": state.confidence,
        "opportunity_score": state.opportunity_score,
        "active_order_id": state.active_order_id,
        "last_reason": state.last_reason or "-",
    }