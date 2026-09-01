import streamlit as st


def metric_card(
    label,
    value,
    description=""
):

    st.metric(
        label=label,
        value=value,
        help=description
    )


def status_badge(
    label,
    value
):

    st.write(
        f"**{label}:** `{value}`"
    )

def pipeline():

    steps = [
        "SCAN",
        "ANALYZE",
        "STRATEGY",
        "RISK",
        "EXECUTE",
        "MONITOR"
    ]

    cols = st.columns(
        len(steps)
    )

    for col, step in zip(cols, steps):

        with col:

            st.info(step)