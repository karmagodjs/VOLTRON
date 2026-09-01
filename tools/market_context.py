from tools.alpaca_mcp import MCPMarketContext


def build_market_context(
    mcp_tools,
    symbol
):

    account = mcp_tools.get_account()

    option_chain = (
        mcp_tools.get_option_chain(symbol)
    )

    news = (
        mcp_tools.get_news(symbol)
    )

    return MCPMarketContext(
        symbol=symbol,
        account=account,
        option_chain=option_chain,
        news=news
    )