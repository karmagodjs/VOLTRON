import time

from agent.state import AgentState
from agent.monitor import PositionMonitor


class VoltronAgent:

    def __init__(
        self,
        scanner=None,
        analyst=None,
        strategy_selector=None,
        risk_engine=None,
        executor=None
    ):
        self.scanner = scanner
        self.analyst = analyst
        self.strategy_selector = strategy_selector
        self.risk_engine = risk_engine
        self.executor = executor

        self.state = AgentState()
        self.monitor = PositionMonitor()
        self.running = False

    # =========================
    # SCAN
    # =========================

    def scan(self):
        self.state.status = "SCANNING"

        if self.scanner is None:
            return []

        return self.scanner()

    # =========================
    # ANALYZE
    # =========================

    def analyze(self, opportunity):
        self.state.status = "ANALYZING"

        if self.analyst is None:
            return None

        return self.analyst(opportunity)

    # =========================
    # STRATEGY
    # =========================

    def select_strategy(self, analysis):
        self.state.status = "SELECTING_STRATEGY"

        if self.strategy_selector is None:
            return None

        return self.strategy_selector(analysis)

    # =========================
    # RISK
    # =========================

    def evaluate_risk(self, trade):
        self.state.status = "RISK_CHECK"

        if self.risk_engine is None:
            return False, "NO_RISK_ENGINE"

        return self.risk_engine.evaluate(
            max_loss=trade["max_loss"],
            opportunity_score=trade["opportunity_score"],
            proposed_exposure=trade["proposed_exposure"]
        )

    # =========================
    # EXECUTION
    # =========================

    def execute(self, trade, dry_run: bool = False):
        self.state.status = "EXECUTING" if not dry_run else "DRY_RUN_EXECUTION"

        if self.executor is None:
            return {
                "submitted": False,
                "execution_mode": "PAPER_DRY_RUN" if dry_run else "ERROR",
                "reason": "NO_EXECUTOR"
            }

        if hasattr(self.executor, "submit_option_order"):
            return self.executor.submit_option_order(
                order=trade.get("order"),
                max_loss=trade.get("max_loss", 0.0),
                opportunity_score=trade.get("opportunity_score", 0.0),
                proposed_exposure=trade.get("proposed_exposure", 0.0),
                spread_percent=trade.get("spread_percent"),
                dry_run=dry_run,
                available_buying_power=trade.get("buying_power")
            )

        try:
            return self.executor(trade, dry_run=dry_run)
        except TypeError:
            return self.executor(trade)

    # =========================
    # MONITOR POSITION
    # =========================

    def monitor_position(self, symbol, current_price):

        should_exit, reason = self.monitor.check_exit(
            symbol,
            current_price
        )

        if should_exit:

            self.monitor.close_position(
                symbol,
                reason
            )

            self.state.status = "EXIT_TRIGGERED"
            self.state.last_reason = reason

            return {
                "exit": True,
                "reason": reason
            }

        return {
            "exit": False,
            "reason": "HOLD"
        }

    # =========================
    # ONE AGENT CYCLE
    # =========================

    def run_cycle(self, dry_run: bool = False):

        self.state.cycle += 1

        # 1. SCAN
        opportunities = self.scan()

        if not opportunities:

            self.state.status = "NO_OPPORTUNITY"

            return {
                "status": self.state.status,
                "cycle": self.state.cycle,
                "execution_mode": "PAPER_DRY_RUN" if dry_run else "OBSERVATION"
            }

        opportunity = opportunities[0]

        self.state.symbol = opportunity.get("symbol")

        # 2. AI ANALYSIS
        analysis = self.analyze(opportunity)

        if not analysis:

            self.state.status = "NO_ANALYSIS"

            return {
                "status": self.state.status,
                "cycle": self.state.cycle,
                "execution_mode": "PAPER_DRY_RUN" if dry_run else "OBSERVATION"
            }

        # Pass quantitative data to strategy selector
        analysis["iv_rv_ratio"] = opportunity.get(
            "iv_rv_ratio",
            0
        )

        analysis["opportunity_score"] = opportunity.get(
            "opportunity_score",
            0
        )

        # Save AI state
        self.state.decision = analysis.get(
            "decision"
        )

        self.state.confidence = analysis.get(
            "confidence",
            0
        )

        self.state.opportunity_score = analysis.get(
            "opportunity_score",
            0
        )

        # 3. STRATEGY
        strategy = self.select_strategy(
            analysis
        )

        self.state.strategy = strategy

        if not strategy or strategy == "NO_TRADE":

            self.state.status = "NO_STRATEGY"
            self.state.last_reason = "NO_TRADE"

            return {
                "status": self.state.status,
                "reason": "NO_TRADE",
                "cycle": self.state.cycle,
                "execution_mode": "PAPER_DRY_RUN" if dry_run else "OBSERVATION"
            }

        # 4. CREATE TRADE
        trade = {
            **opportunity,
            "strategy": strategy
        }

        # 5. RISK
        approved, reason = self.evaluate_risk(
            trade
        )

        self.state.last_reason = reason

        if not approved:

            self.state.status = "RISK_REJECTED"

            return {
                "status": self.state.status,
                "reason": reason,
                "cycle": self.state.cycle,
                "execution_mode": "PAPER_DRY_RUN" if dry_run else "SAFETY_BLOCKED"
            }

        # 6. EXECUTE
        result = self.execute(trade, dry_run=dry_run)

        # 7. UPDATE STATE
        if result.get("submitted"):
            self.state.status = "ORDER_SUBMITTED"
            self.state.active_order_id = result.get("order_id")
        elif result.get("execution_mode") == "PAPER_DRY_RUN":
            self.state.status = "DRY_RUN_COMPLETE"
            self.state.last_reason = "DRY_RUN_PASSED"
        else:
            self.state.status = "EXECUTION_BLOCKED"
            self.state.last_reason = result.get("reason", "EXECUTION_BLOCKED")

        # 8. RETURN RESULT
        return {
            "status": self.state.status,
            "result": result,
            "cycle": self.state.cycle,
            "execution_mode": result.get("execution_mode", "PAPER_DRY_RUN" if dry_run else "SAFETY_BLOCKED")
        }

    # =========================
    # STOP AGENT
    # =========================

    def stop(self):

        self.running = False
        self.state.status = "STOPPED"

    # =========================
    # AUTONOMOUS LOOP
    # =========================

    def run(
        self,
        cycles=1,
        delay_seconds=5,
        dry_run=False
    ):

        self.running = True

        results = []

        for _ in range(cycles):

            if not self.running:
                break

            result = self.run_cycle(dry_run=dry_run)

            results.append(result)

            if self.running:
                time.sleep(delay_seconds)

        self.running = False

        return results