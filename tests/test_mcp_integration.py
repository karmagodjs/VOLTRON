from tools.alpaca_mcp import AlpacaMCPTools


class MockMCPClient:

    def call(self, tool_name, **kwargs):

        print(f"MCP TOOL → {tool_name}")

        if tool_name == "get_account":
            return {
                "status": "ACTIVE",
                "paper": True
            }

        if tool_name == "get_option_chain":
            return {
                "symbol": kwargs["symbol"],
                "contracts": []
            }

        if tool_name == "get_option_snapshot":
            return {
                "symbol": kwargs["symbol"],
                "iv": None,
                "greeks": {}
            }

        if tool_name == "get_news":
            return {
                "symbol": kwargs["symbol"],
                "articles": []
            }

        return None


mcp = AlpacaMCPTools(
    mcp_client=MockMCPClient()
)


print("=" * 60)
print("       VOLTRON MCP INTEGRATION TEST")
print("=" * 60)

print()

account = mcp.get_account()

print("ACCOUNT:")
print(account)

print()

options = mcp.get_option_chain("SPY")

print("OPTIONS:")
print(options)

print()

news = mcp.get_news("SPY")

print("NEWS:")
print(news)

print()

print("=" * 60)
print("MCP ADAPTER TEST: PASS")
print("=" * 60)