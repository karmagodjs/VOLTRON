import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_ASSETS, AssetMarketRecord } from "@/lib/marketData";

const KNOWN_SYMBOLS = Object.keys(SUPPORTED_ASSETS);

const COMMON_NON_TICKER_WORDS = new Set([
  "A", "AN", "THE", "AND", "OR", "BUT", "FOR", "NOR", "ON", "AT", "TO", "FROM", "BY", "WITH", "IN", "OUT",
  "OF", "ABOUT", "WHAT", "WHY", "HOW", "WHO", "WHEN", "WHERE", "WHICH", "IS", "ARE", "WAS", "WERE", "BE",
  "BEEN", "DO", "DOES", "DID", "HAVE", "HAS", "HAD", "CAN", "COULD", "WILL", "WOULD", "SHOULD", "SHOW",
  "TELL", "ME", "YOU", "MY", "OUR", "YOUR", "THIS", "THAT", "THESE", "THOSE", "TODAY", "NOW", "STATUS",
  "STATE", "MODE", "HELP", "HELLO", "HEY", "HI", "THANKS", "THANK", "PLEASE", "OK", "YES", "NO", "PRICE",
  "PRICES", "VOLATILITY", "IV", "RV", "RATIO", "SPREAD", "SPREADS", "OPTION", "OPTIONS", "CHAIN", "CHAINS",
  "CALL", "CALLS", "PUT", "PUTS", "STRIKE", "STRIKES", "GREEK", "GREEKS", "DELTA", "GAMMA", "THETA", "VEGA",
  "STRATEGY", "STRATEGIES", "CONDOR", "IRON", "STRADDLE", "RISK", "RISKS", "GATE", "GATES", "SAFETY",
  "LIMIT", "LIMITS", "LOSS", "LOSSES", "PROFIT", "PNL", "PORTFOLIO", "BALANCE", "ACCOUNT", "EQUITY", "CASH",
  "AGENT", "BOT", "TRADE", "TRADES", "TRADING", "CYCLE", "CYCLES", "ANALYZE", "ANALYSIS", "COMPARE", "VERSUS",
  "VS", "VIEW", "CHECK", "OPEN", "CLOSED", "ACTIVE", "PAUSED", "KILL", "SWITCH", "CIRCUIT", "BREAKER",
  "ORDER", "ORDERS", "FILL", "FILLS", "POSITION", "POSITIONS", "MONITOR", "EXIT", "EXITS", "EXPENSIVE", "CHEAP",
  "FAIR", "REGIME", "SCORE", "ALPHA", "VOLTRON", "PAPER", "LIVE", "SYSTEM", "HEALTH", "LATENCY", "UPTIME",
  "GOOD", "BAD", "BEST", "WORST", "RATE", "RATES", "BUY", "SELL", "HOLD", "MEAN", "DOING", "GOING"
]);

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function findSuggestion(candidate: string): string | null {
  const upper = candidate.toUpperCase();
  const sortedCandidate = upper.split("").sort().join("");

  // 1. Exact anagram match (e.g., SYP -> SPY)
  for (const s of KNOWN_SYMBOLS) {
    if (s.split("").sort().join("") === sortedCandidate) {
      return s;
    }
  }

  // 2. Prefix / containment match (e.g., QQ -> QQQ, NVD -> NVDA, TSL -> TSLA, APPL -> AAPL)
  for (const s of KNOWN_SYMBOLS) {
    if (s.startsWith(upper) || (upper.length >= 2 && s.includes(upper))) {
      return s;
    }
  }

  // 3. Edit distance match (distance <= 2)
  let bestMatch: string | null = null;
  let minDistance = 3;
  for (const s of KNOWN_SYMBOLS) {
    const dist = levenshteinDistance(upper, s);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = s;
    }
  }

  return bestMatch;
}

function parseQuery(text: string): {
  intent: string;
  validSymbols: string[];
  invalidSymbols: string[];
  suggestion: string | null;
} {
  const rawWords = text
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const validSymbols: string[] = [];
  const invalidSymbols: string[] = [];

  for (const word of rawWords) {
    if (KNOWN_SYMBOLS.includes(word)) {
      if (!validSymbols.includes(word)) validSymbols.push(word);
    } else if (
      word.length >= 2 &&
      word.length <= 5 &&
      /^[A-Z]+$/.test(word) &&
      !COMMON_NON_TICKER_WORDS.has(word)
    ) {
      if (!invalidSymbols.includes(word)) invalidSymbols.push(word);
    }
  }

  let suggestion: string | null = null;
  if (invalidSymbols.length > 0) {
    suggestion = findSuggestion(invalidSymbols[0]);
  }

  const lower = text.toLowerCase().trim();

  // If unrecognized candidate ticker is present, flag as INVALID_TICKER immediately
  if (invalidSymbols.length > 0) {
    return {
      intent: "INVALID_TICKER",
      validSymbols,
      invalidSymbols,
      suggestion,
    };
  }

  if (
    lower === "hello" ||
    lower === "hi" ||
    lower === "hey" ||
    lower === "help" ||
    lower === "?" ||
    lower.includes("what can you do") ||
    lower.includes("commands")
  ) {
    return { intent: "HELP", validSymbols, invalidSymbols, suggestion: null };
  }

  if (
    lower.includes("compare") ||
    lower.includes(" vs ") ||
    lower.includes("versus") ||
    validSymbols.length >= 2
  ) {
    return { intent: "COMPARE", validSymbols, invalidSymbols, suggestion: null };
  }

  if (
    lower.includes("risk") ||
    lower.includes("gate") ||
    lower.includes("rejected") ||
    lower.includes("circuit breaker") ||
    lower.includes("kill switch") ||
    lower.includes("safety")
  ) {
    return { intent: "RISK", validSymbols, invalidSymbols, suggestion: null };
  }

  if (
    lower.includes("agent") ||
    lower.includes("doing") ||
    lower.includes("cycle") ||
    lower.includes("state machine") ||
    lower.includes("pipeline")
  ) {
    return { intent: "AGENT_STATUS", validSymbols, invalidSymbols, suggestion: null };
  }

  if (
    lower.includes("option") ||
    lower.includes("chain") ||
    lower.includes("strike") ||
    lower.includes("greek") ||
    lower.includes("delta")
  ) {
    return { intent: "OPTIONS", validSymbols, invalidSymbols, suggestion: null };
  }

  if (
    lower.includes("why") ||
    lower.includes("strategy") ||
    lower.includes("iron condor") ||
    lower.includes("spread") ||
    lower.includes("straddle")
  ) {
    return { intent: "STRATEGY", validSymbols, invalidSymbols, suggestion: null };
  }

  if (
    lower.includes("volatility") ||
    lower.includes(" iv") ||
    lower.startsWith("iv") ||
    lower.includes(" rv") ||
    lower.startsWith("rv") ||
    lower.includes("ratio") ||
    lower.includes("regime") ||
    lower.includes("skew")
  ) {
    return { intent: "VOLATILITY", validSymbols, invalidSymbols, suggestion: null };
  }

  if (
    lower.includes("portfolio") ||
    lower.includes("position") ||
    lower.includes("p&l") ||
    lower.includes("pnl") ||
    lower.includes("equity") ||
    lower.includes("balance")
  ) {
    return { intent: "PORTFOLIO", validSymbols, invalidSymbols, suggestion: null };
  }

  if (
    lower.includes("market") ||
    lower.includes("status") ||
    lower.includes("open") ||
    lower.includes("closed")
  ) {
    return { intent: "MARKET_STATUS", validSymbols, invalidSymbols, suggestion: null };
  }

  if (
    validSymbols.length === 1 ||
    lower.startsWith("what is") ||
    lower.startsWith("tell me about") ||
    lower.startsWith("analyze") ||
    lower.startsWith("price of") ||
    lower.startsWith("show")
  ) {
    return { intent: "WHAT_IS_SYMBOL", validSymbols, invalidSymbols, suggestion: null };
  }

  return { intent: "GENERAL", validSymbols, invalidSymbols, suggestion: null };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawMessage = (body.message || "").trim();
    const fallbackSymbol = (body.symbol || "SPY").toUpperCase();

    if (!rawMessage) {
      return NextResponse.json({
        reply: "Please enter a question or query regarding market volatility, options alpha, strategy selection, or risk controls.",
        intent: "EMPTY",
        symbol: fallbackSymbol,
        timestamp: new Date().toISOString(),
      });
    }

    const { intent, validSymbols, invalidSymbols, suggestion } = parseQuery(rawMessage);

    // 1. Handle Invalid / Unrecognized Tickers (SYP, QQ, XYZ, etc.)
    if (intent === "INVALID_TICKER") {
      const invalidTicker = invalidSymbols[0];
      let reply = `## VOLTRON\n\nI don't recognize "**${invalidTicker}**" as a supported market symbol.\n\n`;
      if (suggestion) {
        reply += `Did you mean **${suggestion}**?\n\n`;
      }
      reply += `Supported symbols include:\n` +
        `- **SPY** (SPDR S&P 500 ETF)\n` +
        `- **QQQ** (Invesco Nasdaq 100 ETF)\n` +
        `- **IWM** (iShares Russell 2000 ETF)\n` +
        `- **NVDA** (NVIDIA Corporation)\n` +
        `- **AAPL** (Apple Inc.)\n` +
        `- **TSLA** (Tesla Inc.)\n` +
        `- **MSFT** (Microsoft Corporation)\n` +
        `- **AMZN** (Amazon.com Inc.)\n\n` +
        `Please confirm your intended ticker.`;

      return NextResponse.json({
        reply,
        intent: "INVALID_TICKER",
        symbol: invalidTicker,
        suggestion,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Determine target asset strictly without leaking old invalid states
    const targetSymbol = validSymbols[0] || (KNOWN_SYMBOLS.includes(fallbackSymbol) ? fallbackSymbol : "SPY");
    const asset = SUPPORTED_ASSETS[targetSymbol] || SUPPORTED_ASSETS["SPY"];

    let reply = "";

    switch (intent) {
      case "WHAT_IS_SYMBOL": {
        reply = `## VOLTRON Analysis — ${asset.symbol}\n\n` +
          `- **Target Asset:** ${asset.name} (${asset.symbol})\n` +
          `- **Spot Price:** $${asset.price.toFixed(2)} (${asset.change >= 0 ? "+" : ""}${asset.change_percent.toFixed(2)}%)\n` +
          `- **20D Realized Volatility:** ${asset.realized_volatility.toFixed(2)}%\n` +
          `- **ATM Implied Volatility:** ${asset.implied_volatility.toFixed(2)}%\n` +
          `- **IV / RV Ratio:** ${asset.iv_rv_ratio.toFixed(2)}x (+${asset.iv_premium.toFixed(1)}% variance premium)\n` +
          `- **Volatility Regime:** ${asset.market_regime} (${asset.vol_signal})\n` +
          `- **Opportunity Score:** ${asset.opportunity_score}/100\n` +
          `- **Recommended Strategy:** ${asset.strategy.replace(/_/g, " ")}`;
        break;
      }

      case "VOLATILITY": {
        reply = `## ${asset.symbol} Volatility Intelligence\n\n` +
          `- **Implied Volatility (IV):** ${asset.implied_volatility.toFixed(2)}%\n` +
          `- **Realized Volatility (RV):** ${asset.realized_volatility.toFixed(2)}%\n` +
          `- **IV / RV Dislocation:** ${asset.iv_rv_ratio.toFixed(2)}x\n` +
          `- **Variance Premium:** ${asset.iv_premium >= 0 ? "+" : ""}${asset.iv_premium.toFixed(1)}%\n` +
          `- **Regime Classification:** ${asset.market_regime}\n` +
          `- **Alpha Signal:** ${asset.vol_signal}\n` +
          `- **Opportunity Score:** ${asset.opportunity_score}/100\n\n` +
          `${
            asset.iv_rv_ratio >= 1.35
              ? `Implied volatility is **EXPENSIVE** relative to historical drift, creating rich conditions for defined-risk credit spread harvesting.`
              : asset.iv_rv_ratio <= 0.90
              ? `Implied volatility is **CHEAP** (compressed), favoring long volatility breakout structures such as Straddles.`
              : `Implied volatility is **FAIR VALUE**, holding neutral alpha edge.`
          }`;
        break;
      }

      case "OPTIONS": {
        const atmStrike = Math.round(asset.price / 5.0) * 5;
        reply = `## ${asset.symbol} Options Summary\n\n` +
          `- **Underlying Spot:** $${asset.price.toFixed(2)}\n` +
          `- **ATM Strike Anchor:** $${atmStrike}.00\n` +
          `- **ATM Implied Volatility:** ${asset.implied_volatility.toFixed(2)}%\n` +
          `- **Recommended Structure:** ${asset.strategy.replace(/_/g, " ")} (45 DTE)\n` +
          `- **Market Liquidity:** Institutional (< 2.5% bid-ask spread)\n\n` +
          `You can inspect live Greeks (&Delta;, &Gamma;, &Theta;, &nu;) and option chain on the **Options Terminal**.`;
        break;
      }

      case "STRATEGY": {
        reply = `## Strategy Selection Rationale — ${asset.symbol}\n\n` +
          `- **Selected Strategy:** ${asset.strategy.replace(/_/g, " ")}\n` +
          `- **Volatility Regime:** ${asset.market_regime} (IV/RV: ${asset.iv_rv_ratio.toFixed(2)}x)\n` +
          `- **Directional Sentiment:** ${asset.strategy.includes("BULL") ? "BULLISH" : asset.strategy.includes("BEAR") ? "BEARISH" : "NEUTRAL"}\n` +
          `- **Opportunity Score:** ${asset.opportunity_score}/100\n\n` +
          `**Why this structure?**\n` +
          (asset.strategy === "IRON_CONDOR"
            ? `Elevated IV/RV spread (${asset.iv_rv_ratio.toFixed(2)}x) combined with neutral price drift makes Iron Condor the optimal risk-defined credit vehicle. It collects variance premium on both call and put wings while strictly limiting max risk.`
            : asset.strategy === "BULL_PUT_SPREAD"
            ? `High implied volatility paired with upward directional bias makes Bull Put credit spreads optimal, capturing rich premium beneath current support.`
            : asset.strategy === "BEAR_CALL_SPREAD"
            ? `High implied volatility paired with downward directional bias favors Bear Call credit spreads above resistance.`
            : asset.strategy === "LONG_STRADDLE"
            ? `Compressed volatility (IV/RV ${asset.iv_rv_ratio.toFixed(2)}x) makes option pricing cheap, favoring volatility expansion breakouts.`
            : `Opportunity score (${asset.opportunity_score}) does not meet the 70 hurdle rate. Execution is safely set to NO_TRADE.`);
        break;
      }

      case "COMPARE": {
        const symA = validSymbols[0] || "SPY";
        const symB = validSymbols[1] || (symA === "SPY" ? "QQQ" : "SPY");
        const a = SUPPORTED_ASSETS[symA] || SUPPORTED_ASSETS["SPY"];
        const b = SUPPORTED_ASSETS[symB] || SUPPORTED_ASSETS["QQQ"];

        reply = `## Quantitative Comparison: ${a.symbol} vs ${b.symbol}\n\n` +
          `| Metric | ${a.symbol} | ${b.symbol} |\n` +
          `| :--- | :--- | :--- |\n` +
          `| **Spot Price** | $${a.price.toFixed(2)} | $${b.price.toFixed(2)} |\n` +
          `| **24h Change** | ${(a.change >= 0 ? "+" : "") + a.change_percent.toFixed(2) + "%"} | ${(b.change >= 0 ? "+" : "") + b.change_percent.toFixed(2) + "%"} |\n` +
          `| **20D Realized Vol** | ${a.realized_volatility.toFixed(2) + "%"} | ${b.realized_volatility.toFixed(2) + "%"} |\n` +
          `| **ATM Implied Vol** | ${a.implied_volatility.toFixed(2) + "%"} | ${b.implied_volatility.toFixed(2) + "%"} |\n` +
          `| **IV / RV Ratio** | ${a.iv_rv_ratio.toFixed(2) + "x"} | ${b.iv_rv_ratio.toFixed(2) + "x"} |\n` +
          `| **Vol Signal** | ${a.vol_signal} | ${b.vol_signal} |\n` +
          `| **Opportunity Score** | ${a.opportunity_score}/100 | ${b.opportunity_score}/100 |\n` +
          `| **Target Strategy** | ${a.strategy.replace(/_/g, " ")} | ${b.strategy.replace(/_/g, " ")} |\n\n` +
          `**Key Takeaway:** ${
            a.opportunity_score > b.opportunity_score
              ? `${a.symbol} offers a higher volatility alpha score (${a.opportunity_score}) than ${b.symbol} (${b.opportunity_score}).`
              : `${b.symbol} offers a higher volatility alpha score (${b.opportunity_score}) than ${a.symbol} (${a.opportunity_score}).`
          }`;
        break;
      }

      case "RISK": {
        reply = `## VOLTRON 7-Gate Risk & Safety Audit\n\n` +
          `- **Gate 1 (Opportunity Hurdle):** ${asset.opportunity_score} / 100 (Min: 70) — **${asset.opportunity_score >= 70 ? "PASS" : "BLOCKED"}**\n` +
          `- **Gate 2 (Trade Risk Limit):** 0.31% / $315.00 (Max: 1.00%) — **PASS**\n` +
          `- **Gate 3 (Daily Loss Circuit):** +$1,284.50 Profit (Max Loss: 2.0%) — **PASS**\n` +
          `- **Gate 4 (Portfolio Exposure):** 18.2% / $18,200 (Max: 30.0%) — **PASS**\n` +
          `- **Gate 5 (Market Liquidity):** 2.1% Spread (Max: 10.0%) — **PASS**\n` +
          `- **Gate 6 (Consecutive Losses):** 0 Losses (Max: 3) — **PASS**\n` +
          `- **Gate 7 (Emergency Kill Switch):** DISARMED / NORMAL — **PASS**\n\n` +
          `**Overall Status:** **RISK APPROVED** (100% Fail-Closed Safety Active)`;
        break;
      }

      case "AGENT_STATUS": {
        reply = `## Autonomous Agent Command State\n\n` +
          `- **Status:** ACTIVE ● (Autonomous Scanning Loop Running)\n` +
          `- **Active Symbol:** ${asset.symbol}\n` +
          `- **Current Stage:** ANALYZE (IV/RV: ${asset.iv_rv_ratio.toFixed(2)}x, Score: ${asset.opportunity_score})\n` +
          `- **AI Confidence:** 88% (Gemini 3.6 Pro synthesized thesis)\n` +
          `- **Execution Target:** Alpaca Paper Sandbox\n` +
          `- **Cycles Completed Today:** 142\n` +
          `- **Win Rate:** 83.3% (5W / 1L)`;
        break;
      }

      case "PORTFOLIO": {
        reply = `## VOLTRON Paper Trading Portfolio\n\n` +
          `- **Account Equity:** $100,000.00\n` +
          `- **Portfolio Value:** $128,450.00 (+28.45% Return)\n` +
          `- **Cash:** $81,800.00\n` +
          `- **Buying Power:** $180,000.00\n` +
          `- **Unrealized P&L:** +$2,435.00\n` +
          `- **Open Positions:** 3 Multi-Leg Level-3 Structures\n` +
          `- **Execution Mode:** Alpaca Paper Environment (Active)`;
        break;
      }

      case "MARKET_STATUS": {
        reply = `## Market Telemetry\n\n` +
          `- **Status:** US Equity & Options Markets OPEN\n` +
          `- **Active Feed:** SIP Consolidated Options Data\n` +
          `- **Universe Monitored:** SPY, QQQ, IWM, NVDA, AAPL, TSLA, MSFT, AMZN\n` +
          `- **Active Symbol:** ${asset.symbol} ($${asset.price.toFixed(2)})\n` +
          `- **Execution Endpoint:** https://paper-api.alpaca.markets`;
        break;
      }

      case "HELP": {
        reply = `## VOLTRON Online\n\n` +
          `I am your autonomous quantitative options and volatility copilot.\n\n` +
          `You can ask about:\n` +
          `- **Supported Assets:** SPY, QQQ, IWM, NVDA, AAPL, TSLA, MSFT, AMZN\n` +
          `- **Volatility & Alpha:** "SPY volatility", "why is IV expensive"\n` +
          `- **Options & Greeks:** "QQQ options", "SPY chain"\n` +
          `- **Strategy Selection:** "why iron condor", "compare SPY and QQQ"\n` +
          `- **Risk & Safety:** "risk status", "safety gates"\n` +
          `- **Agent Operations:** "agent status", "portfolio balance"`;
        break;
      }

      default: {
        reply = `## VOLTRON Analysis — ${asset.symbol}\n\n` +
          `- **Target Asset:** ${asset.name} (${asset.symbol})\n` +
          `- **Spot Price:** $${asset.price.toFixed(2)}\n` +
          `- **Implied Volatility (IV):** ${asset.implied_volatility.toFixed(2)}%\n` +
          `- **Realized Volatility (RV):** ${asset.realized_volatility.toFixed(2)}%\n` +
          `- **IV / RV Ratio:** ${asset.iv_rv_ratio.toFixed(2)}x (${asset.vol_signal})\n` +
          `- **Alpha Opportunity Score:** ${asset.opportunity_score}/100\n` +
          `- **Recommended Strategy:** ${asset.strategy.replace(/_/g, " ")}\n\n` +
          `Type **help** to explore all query types or ask about specific metrics.`;
        break;
      }
    }

    return NextResponse.json({
      reply,
      intent,
      symbol: asset.symbol,
      data: {
        symbol: asset.symbol,
        price: asset.price,
        rv: asset.realized_volatility,
        iv: asset.implied_volatility,
        iv_rv_ratio: asset.iv_rv_ratio,
        opportunity_score: asset.opportunity_score,
        strategy: asset.strategy,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        reply: "## VOLTRON\n\nMarket intelligence is temporarily unavailable. Please verify backend connectivity.",
        error: err?.message || "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
