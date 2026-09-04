import streamlit as st

from dashboard.data import (
    get_dashboard_state,
    get_agent_data,
)


st.set_page_config(
    page_title="VOLTRON — Volatility Alpha",
    page_icon="⚡",
    layout="wide",
)


st.title("⚡ VOLTRON")

st.caption(
    "Volatility Alpha — Autonomous AI Options Trading Agent"
)

st.divider()


agent = None

data = get_dashboard_state()
agent_data = get_agent_data(agent)


st.subheader("Market Intelligence")

col1, col2, col3, col4 = st.columns(4)


with col1:
    st.metric(
        "Symbol",
        data["symbol"],
    )


with col2:
    st.metric(
        "Price",
        f"${data['price']:.2f}",
    )


with col3:
    st.metric(
        "Realized Volatility",
        f"{data['realized_volatility']:.2f}%",
    )


with col4:
    st.metric(
        "Implied Volatility",
        f"{data['implied_volatility']:.2f}%",
    )


st.subheader("Volatility Alpha")

col1, col2, col3 = st.columns(3)


with col1:
    st.metric(
        "IV / RV Ratio",
        f"{data['iv_rv_ratio']:.2f}",
    )


with col2:
    st.metric(
        "Opportunity Score",
        data["opportunity_score"],
    )


with col3:
    st.metric(
        "Market Regime",
        data["market_regime"],
    )


st.subheader("AI Analyst")

col1, col2 = st.columns(2)


with col1:

    st.metric(
        "AI Confidence",
        f"{data['ai_confidence']}%",
    )

    st.write(
        "**Strategy:**",
        data["strategy"],
    )

    st.write(
        "**Risk Status:**",
        data["risk_status"],
    )


with col2:

    st.write("### AI Thesis")

    st.info(
        data["ai_thesis"]
    )


st.divider()

st.subheader("VOLTRON Agent")


col1, col2, col3, col4 = st.columns(4)


with col1:

    st.metric(
        "Status",
        agent_data["status"],
    )


with col2:

    st.metric(
        "Cycle",
        agent_data["cycle"],
    )


with col3:

    st.metric(
        "Confidence",
        f"{agent_data['confidence']}%",
    )


with col4:

    st.metric(
        "Opportunity",
        agent_data["opportunity_score"],
    )


col1, col2 = st.columns(2)


with col1:

    st.write(
        "**Symbol:**",
        agent_data["symbol"],
    )

    st.write(
        "**Decision:**",
        agent_data["decision"],
    )

    st.write(
        "**Strategy:**",
        agent_data["strategy"],
    )


with col2:

    st.write(
        "**Active Order:**",
        agent_data["active_order_id"] or "None",
    )

    st.write(
        "**Last Reason:**",
        agent_data["last_reason"],
    )


st.divider()

st.subheader("Portfolio")


col1, col2, col3, col4 = st.columns(4)


with col1:

    st.metric(
        "Portfolio Value",
        f"${data['portfolio_value']:,.2f}",
    )


with col2:

    st.metric(
        "Daily P&L",
        f"${data['daily_pnl']:,.2f}",
    )


with col3:

    st.metric(
        "Max Drawdown",
        f"${data['max_drawdown']:,.2f}",
    )


with col4:

    st.metric(
        "Open Positions",
        data["open_positions"],
    )


st.divider()

st.subheader("System Status")

status_col1, status_col2 = st.columns(2)


with status_col1:

    st.write(
        "🟢 **Risk Engine:** Active"
    )

    st.write(
        "🟢 **Safety Gate:** Active"
    )

    st.write(
        "🟢 **Paper Trading:** Enabled"
    )


with status_col2:

    st.write(
        "🟢 **AI Analyst:** Gemini"
    )

    st.write(
        "🟢 **Options Engine:** Active"
    )

    st.write(
        "🛑 **Live Trading:** Disabled"
    )


st.divider()

st.caption(
    f"Last update: {data['last_update']}"
)

st.caption(
    "VOLTRON operates in paper-trading mode. "
    "Live trading is disabled."
)