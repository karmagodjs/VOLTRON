from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone


VALID_STATES = {
    "IDLE",
    "SCANNING",
    "ANALYZING",
    "SELECTING_STRATEGY",
    "RISK_CHECK",
    "TRADE_ACTIVE",
    "EXECUTING",
    "DRY_RUN_EXECUTION",
    "MONITORING",
    "EXIT_PENDING",
    "EXIT_TRIGGERED",
    "CLOSED",
    "NO_OPPORTUNITY",
    "NO_ANALYSIS",
    "NO_TRADE",
    "ERROR",
}


@dataclass
class AgentState:
    cycle: int = 0
    status: str = "IDLE"
    symbol: Optional[str] = None
    decision: Optional[str] = None
    strategy: Optional[str] = None
    confidence: float = 0.0
    opportunity_score: float = 0.0
    active_order_id: Optional[str] = None
    active_position: Optional[str] = None
    last_reason: Optional[str] = None
    final_pnl: Optional[float] = None
    errors: list = field(default_factory=list)
    state_history: list = field(default_factory=list)

    def transition_to(self, new_status: str, reason: Optional[str] = None) -> bool:
        """
        Record and validate state transitions.
        """
        old_status = self.status
        self.status = new_status
        if reason:
            self.last_reason = reason
        self.state_history.append({
            "from": old_status,
            "to": new_status,
            "reason": reason,
            "cycle": self.cycle,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        return True

    def record_error(self, error_message: str):
        self.errors.append({
            "error": str(error_message),
            "status": self.status,
            "cycle": self.cycle,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })