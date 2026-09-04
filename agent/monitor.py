from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple, List


DEFAULT_PROFIT_TARGET_PCT = 0.50
DEFAULT_MAX_LOSS_PCT = 1.00
DEFAULT_EXPIRY_DTE_THRESHOLD = 21


class PositionMonitor:

    def __init__(
        self,
        profit_target_pct: float = DEFAULT_PROFIT_TARGET_PCT,
        max_loss_pct: float = DEFAULT_MAX_LOSS_PCT,
        expiry_dte_threshold: int = DEFAULT_EXPIRY_DTE_THRESHOLD,
    ):
        self.positions: Dict[str, Dict[str, Any]] = {}
        self.profit_target_pct = profit_target_pct
        self.max_loss_pct = max_loss_pct
        self.expiry_dte_threshold = expiry_dte_threshold

    def register_position(
        self,
        symbol: str,
        strategy: str,
        entry_price: float,
        take_profit: Optional[float] = None,
        stop_loss: Optional[float] = None,
        quantity: int = 1,
        legs: Optional[List[Dict[str, Any]]] = None,
        dte: Optional[int] = None,
        expiration: Optional[str] = None,
        max_loss: Optional[float] = None,
        max_profit: Optional[float] = None,
        is_credit: bool = False,
    ):
        ep = float(entry_price)

        if take_profit is None:
            if is_credit:
                take_profit = round(ep * (1.0 - self.profit_target_pct), 2)
            else:
                take_profit = round(ep * (1.0 + self.profit_target_pct), 2)

        if stop_loss is None:
            if is_credit:
                stop_loss = round(ep * (1.0 + self.max_loss_pct), 2)
            else:
                stop_loss = round(ep * max(0.0, (1.0 - self.max_loss_pct)), 2)

        self.positions[symbol] = {
            "symbol": symbol,
            "strategy": strategy,
            "entry_price": ep,
            "take_profit": float(take_profit),
            "stop_loss": float(stop_loss),
            "quantity": int(quantity),
            "legs": list(legs) if legs else [],
            "dte": int(dte) if dte is not None else None,
            "expiration": expiration,
            "max_loss": float(max_loss) if max_loss is not None else round(ep * 100.0 * quantity, 2),
            "max_profit": float(max_profit) if max_profit is not None else round(ep * 100.0 * quantity, 2),
            "is_credit": is_credit,
            "opened_at": datetime.now(timezone.utc).isoformat(),
            "status": "OPEN",
            "lifecycle": "MONITORING",
            "exit_reason": None,
            "unrealized_pnl": 0.0,
            "realized_pnl": None,
            "exit_price": None,
            "closed_at": None,
        }

    def check_exit(
        self,
        symbol: str,
        current_price: Optional[float] = None,
        dte: Optional[int] = None,
        leg_prices: Optional[Dict[str, float]] = None,
        mark_pending: bool = False,
    ) -> Tuple[bool, str]:
        position = self.positions.get(symbol)
        if not position:
            return False, "POSITION_NOT_FOUND"

        status = position.get("status", "OPEN")
        if status == "EXIT_PENDING":
            return False, "ALREADY_EXITING"
        if status == "CLOSED":
            return False, "ALREADY_CLOSED"
        if status not in ("OPEN", "MONITORING"):
            return False, "POSITION_NOT_OPEN"

        active_dte = dte if dte is not None else position.get("dte")
        if active_dte is not None and active_dte <= self.expiry_dte_threshold:
            if mark_pending:
                position["status"] = "EXIT_PENDING"
            position["exit_reason"] = "EXPIRY"
            return True, "EXPIRY"

        if current_price is None:
            return False, "MISSING_PRICE"

        is_credit = position.get("is_credit", False)
        tp = position.get("take_profit")
        sl = position.get("stop_loss")

        if is_credit:
            if tp is not None and current_price <= tp:
                if mark_pending:
                    position["status"] = "EXIT_PENDING"
                position["exit_reason"] = "PROFIT_TARGET"
                return True, "PROFIT_TARGET"

            if sl is not None and current_price >= sl:
                if mark_pending:
                    position["status"] = "EXIT_PENDING"
                position["exit_reason"] = "STOP_LOSS"
                return True, "STOP_LOSS"
        else:
            if tp is not None and current_price >= tp:
                if mark_pending:
                    position["status"] = "EXIT_PENDING"
                position["exit_reason"] = "TAKE_PROFIT"
                return True, "TAKE_PROFIT"

            if sl is not None and current_price <= sl:
                if mark_pending:
                    position["status"] = "EXIT_PENDING"
                position["exit_reason"] = "STOP_LOSS"
                return True, "STOP_LOSS"

        return False, "HOLD"

    def close_position(
        self,
        symbol: str,
        reason: str = "MANUAL_EXIT",
        exit_price: Optional[float] = None,
    ) -> Optional[Dict[str, Any]]:
        position = self.positions.get(symbol)
        if not position:
            return None

        position["status"] = "CLOSED"
        position["lifecycle"] = "CLOSED"
        position["closed_at"] = datetime.now(timezone.utc).isoformat()
        position["exit_reason"] = reason

        if exit_price is not None:
            position["exit_price"] = float(exit_price)
            pnl_data = self.calculate_pnl(symbol, current_price=exit_price)
            position["realized_pnl"] = pnl_data.get("unrealized_pnl", 0.0)
            position["realized_return_pct"] = pnl_data.get("return_pct", 0.0)

        return position

    def calculate_pnl(
        self,
        symbol: str,
        current_price: Optional[float] = None,
        leg_prices: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        position = self.positions.get(symbol)
        if not position:
            return {"error": "POSITION_NOT_FOUND"}

        entry_price = float(position.get("entry_price", 0.0))
        quantity = int(position.get("quantity", 1))
        is_credit = bool(position.get("is_credit", False))
        legs = position.get("legs") or []

        if legs and leg_prices:
            total_pnl = 0.0
            updated_legs = []
            for leg in legs:
                leg_sym = leg.get("symbol")
                leg_side = str(leg.get("side", "BUY")).upper()
                leg_qty = int(leg.get("quantity", quantity))
                leg_entry = float(leg.get("entry_price", 0.0))
                leg_curr = float(leg_prices.get(leg_sym, leg.get("current_price", leg_entry)))

                if leg_side == "BUY":
                    leg_pnl = (leg_curr - leg_entry) * leg_qty * 100.0
                else:
                    leg_pnl = (leg_entry - leg_curr) * leg_qty * 100.0

                total_pnl += leg_pnl
                updated_legs.append({
                    **leg,
                    "current_price": leg_curr,
                    "unrealized_pnl": round(leg_pnl, 2),
                })

            base_cost = abs(entry_price) * quantity * 100.0
            ret_pct = (total_pnl / base_cost * 100.0) if base_cost > 0 else 0.0
            position["unrealized_pnl"] = round(total_pnl, 2)
            return {
                "symbol": symbol,
                "strategy": position.get("strategy"),
                "entry_price": entry_price,
                "current_price": current_price,
                "quantity": quantity,
                "unrealized_pnl": round(total_pnl, 2),
                "return_pct": round(ret_pct, 2),
                "max_loss": position.get("max_loss"),
                "max_profit": position.get("max_profit"),
                "legs": updated_legs,
            }

        if current_price is None:
            return {
                "symbol": symbol,
                "entry_price": entry_price,
                "current_price": None,
                "quantity": quantity,
                "unrealized_pnl": 0.0,
                "return_pct": 0.0,
                "status": "PRICE_UNAVAILABLE",
            }

        if is_credit:
            unrealized_pnl = (entry_price - current_price) * quantity * 100.0
            ret_pct = ((entry_price - current_price) / entry_price * 100.0) if entry_price > 0 else 0.0
        else:
            unrealized_pnl = (current_price - entry_price) * quantity * 100.0
            ret_pct = ((current_price - entry_price) / entry_price * 100.0) if entry_price > 0 else 0.0

        position["unrealized_pnl"] = round(unrealized_pnl, 2)
        return {
            "symbol": symbol,
            "strategy": position.get("strategy"),
            "entry_price": entry_price,
            "current_price": current_price,
            "quantity": quantity,
            "unrealized_pnl": round(unrealized_pnl, 2),
            "return_pct": round(ret_pct, 2),
            "max_loss": position.get("max_loss"),
            "max_profit": position.get("max_profit"),
        }

    def validate_multileg_integrity(self, symbol: str) -> Tuple[bool, str]:
        position = self.positions.get(symbol)
        if not position:
            return False, "POSITION_NOT_FOUND"

        strategy = position.get("strategy")
        legs = position.get("legs") or []
        quantity = position.get("quantity", 1)

        expected_legs_count = {
            "IRON_CONDOR": 4,
            "BULL_PUT_SPREAD": 2,
            "BEAR_CALL_SPREAD": 2,
            "BULL_CALL_SPREAD": 2,
            "BEAR_PUT_SPREAD": 2,
            "LONG_STRADDLE": 2,
        }

        if strategy in expected_legs_count:
            if len(legs) != expected_legs_count[strategy]:
                return False, f"INCOMPLETE_LEGS_EXPECTED_{expected_legs_count[strategy]}_GOT_{len(legs)}"

        for leg in legs:
            if leg.get("quantity") != quantity:
                return False, "INCONSISTENT_LEG_QUANTITIES"

        return True, "MULTILEG_INTEGRITY_APPROVED"

    def reconcile_broker_positions(self, broker_positions: List[Dict[str, Any]]) -> Dict[str, Any]:
        broker_symbols = set()
        for bp in (broker_positions or []):
            sym = bp.get("symbol") if isinstance(bp, dict) else getattr(bp, "symbol", "")
            if sym:
                broker_symbols.add(str(sym))

        reconciled = []
        for symbol, position in self.positions.items():
            if position.get("status") in ("OPEN", "MONITORING"):
                legs = position.get("legs") or []
                leg_symbols = {str(leg.get("symbol")) for leg in legs if leg.get("symbol")}

                exists_at_broker = (symbol in broker_symbols) or bool(leg_symbols and leg_symbols.intersection(broker_symbols))
                if not exists_at_broker:
                    position["status"] = "CLOSED"
                    position["closed_at"] = datetime.now(timezone.utc).isoformat()
                    position["exit_reason"] = "RECONCILED_CLOSED_AT_BROKER"
                    reconciled.append(symbol)

        return {
            "reconciled_closed": reconciled,
            "active_positions_count": len(self.get_open_positions()),
        }

    def get_position(self, symbol: str) -> Optional[Dict[str, Any]]:
        return self.positions.get(symbol)

    def get_open_positions(self) -> Dict[str, Dict[str, Any]]:
        return {
            symbol: position
            for symbol, position in self.positions.items()
            if position.get("status") in ("OPEN", "MONITORING", "EXIT_PENDING")
        }
