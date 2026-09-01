from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class MCPMarketContext:
    symbol: str
    account: Optional[Any] = None
    option_chain: Optional[Any] = None
    option_snapshots: Optional[Any] = None
    news: Optional[Any] = None


class AlpacaMCPTools:

    def __init__(self, mcp_client=None):
        self.mcp_client = mcp_client

    def get_account(self):
        if self.mcp_client is None:
            raise RuntimeError("MCP client not connected")

        return self.mcp_client.call(
            "get_account"
        )

    def get_option_chain(self, symbol):
        if self.mcp_client is None:
            raise RuntimeError("MCP client not connected")

        return self.mcp_client.call(
            "get_option_chain",
            symbol=symbol
        )

    def get_option_snapshot(self, symbol):
        if self.mcp_client is None:
            raise RuntimeError("MCP client not connected")

        return self.mcp_client.call(
            "get_option_snapshot",
            symbol=symbol
        )

    def get_news(self, symbol):
        if self.mcp_client is None:
            raise RuntimeError("MCP client not connected")

        return self.mcp_client.call(
            "get_news",
            symbol=symbol
        )