from agent.monitor import PositionMonitor


monitor = PositionMonitor()

monitor.register_position(
    symbol="TEST_OPTION",
    strategy="IRON_CONDOR",
    entry_price=5.00,
    take_profit=7.00,
    stop_loss=3.00,
)

print("\n==============================")
print("    VOLTRON MONITOR TEST")
print("==============================")

print(monitor.check_exit("TEST_OPTION", 6.00))
print(monitor.check_exit("TEST_OPTION", 7.00))
print(monitor.check_exit("TEST_OPTION", 2.50))

print("==============================\n")