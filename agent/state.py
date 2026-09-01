from dataclasses import dataclass, field
from typing import Optional


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

    errors: list = field(default_factory=list)