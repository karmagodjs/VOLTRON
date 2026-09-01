from datetime import datetime


class PositionMonitor:

    def __init__(self):
        self.positions = {}

    def register_position(
        self,
        symbol,
        strategy,
        entry_price,
        take_profit,
        stop_loss,
    ):
        self.positions[symbol] = {
            "strategy": strategy,
            "entry_price": entry_price,
            "take_profit": take_profit,
            "stop_loss": stop_loss,
            "opened_at": datetime.utcnow(),
            "status": "OPEN",
        }

    def check_exit(self, symbol, current_price):
        position = self.positions.get(symbol)

        if not position:
            return False, "POSITION_NOT_FOUND"

        if position["status"] != "OPEN":
            return False, "POSITION_NOT_OPEN"

        if current_price >= position["take_profit"]:
            return True, "TAKE_PROFIT"

        if current_price <= position["stop_loss"]:
            return True, "STOP_LOSS"

        return False, "HOLD"

    def close_position(self, symbol):
        if symbol in self.positions:
            self.positions[symbol]["status"] = "CLOSED"

    def get_position(self, symbol):
        return self.positions.get(symbol)

    def get_open_positions(self):
        return {
            symbol: position
            for symbol, position in self.positions.items()
            if position["status"] == "OPEN"
        }