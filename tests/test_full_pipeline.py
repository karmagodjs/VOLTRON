from quant.scanner import scan
from agent.analyst import create_analysis
from quant.strategy_selector import select_strategy


print("\n========================================")
print("       VOLTRON FULL PIPELINE TEST")
print("========================================")

print("\n[1] MARKET SCAN")

opportunities = scan()

if not opportunities:
    print("NO OPPORTUNITY")
    raise SystemExit

opportunity = opportunities[0]

print("Symbol:", opportunity.get("symbol"))
print("Price:", opportunity.get("price"))
print("IV:", opportunity.get("iv"))
print("RV:", opportunity.get("rv"))
print("IV/RV:", opportunity.get("iv_rv_ratio"))
print("Score:", opportunity.get("opportunity_score"))


print("\n[2] GEMINI ANALYSIS")

analysis = create_analysis(opportunity)

print("Decision:", analysis.get("decision"))
print("Direction:", analysis.get("direction"))
print("Confidence:", analysis.get("confidence"))
print("Volatility:", analysis.get("volatility_view"))


print("\n[3] STRATEGY")

analysis["iv_rv_ratio"] = opportunity.get(
    "iv_rv_ratio", 0
)

analysis["opportunity_score"] = opportunity.get(
    "opportunity_score", 0
)

strategy = select_strategy(analysis)

print("Selected Strategy:", strategy)


print("\n========================================")
print("       PIPELINE TEST COMPLETE")
print("========================================\n")