import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    // Get BTC price and market cap
    let btcMarketCap = 0;
    let btcPrice = 0;

    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true"
      );
      if (res.ok) {
        const data = await res.json();
        btcPrice = data.bitcoin?.usd || 97000;
        btcMarketCap = data.bitcoin?.usd_market_cap || 1900000000000;
      }
    } catch {
      btcPrice = 97000;
      btcMarketCap = 1900000000000;
    }

    // Get hashrate from mempool.space
    let hashrate = 0;
    try {
      const hrRes = await fetch("https://mempool.space/api/v1/mining/hashrate/1m");
      if (hrRes.ok) {
        const hrData = await hrRes.json();
        const latest = hrData.hashrates?.[hrData.hashrates.length - 1];
        hashrate = latest?.avgHashrate
          ? latest.avgHashrate / 1e18
          : 750;
      }
    } catch {
      hashrate = 750;
    }

    // GDP data (World Bank 2024 estimates, in trillions)
    const rankings = [
      { name: "Gold", type: "commodity" as const, value: 18.5, flag: "🥇" },
      { name: "Apple", type: "company" as const, value: 3.8, flag: "🍎" },
      { name: "NVIDIA", type: "company" as const, value: 3.4, flag: "💻" },
      { name: "Microsoft", type: "company" as const, value: 3.1, flag: "🪟" },
      {
        name: "Bitcoin",
        type: "bitcoin" as const,
        value: btcMarketCap / 1e12,
        flag: "🟠",
      },
      {
        name: "Saudi Aramco",
        type: "company" as const,
        value: 1.8,
        flag: "🛢️",
      },
      { name: "Amazon", type: "company" as const, value: 2.3, flag: "📦" },
      { name: "Silver", type: "commodity" as const, value: 1.7, flag: "🥈" },
    ].sort((a, b) => b.value - a.value);

    // GDP rankings
    const gdpRankings = [
      { name: "United States", type: "country" as const, value: 28.78, flag: "🇺🇸" },
      { name: "China", type: "country" as const, value: 18.53, flag: "🇨🇳" },
      { name: "Germany", type: "country" as const, value: 4.59, flag: "🇩🇪" },
      { name: "Japan", type: "country" as const, value: 4.11, flag: "🇯🇵" },
      { name: "India", type: "country" as const, value: 3.94, flag: "🇮🇳" },
      { name: "United Kingdom", type: "country" as const, value: 3.50, flag: "🇬🇧" },
      { name: "France", type: "country" as const, value: 3.13, flag: "🇫🇷" },
      {
        name: "Bitcoin",
        type: "bitcoin" as const,
        value: btcMarketCap / 1e12,
        flag: "🟠",
      },
      { name: "Italy", type: "country" as const, value: 2.33, flag: "🇮🇹" },
      { name: "Brazil", type: "country" as const, value: 2.33, flag: "🇧🇷" },
      { name: "Canada", type: "country" as const, value: 2.24, flag: "🇨🇦" },
      { name: "South Korea", type: "country" as const, value: 1.72, flag: "🇰🇷" },
    ].sort((a, b) => b.value - a.value);

    const btcGdpRank = gdpRankings.findIndex((r) => r.name === "Bitcoin") + 1;

    // Nation-state adoption timeline
    const adoption = [
      {
        country: "El Salvador",
        flag: "🇸🇻",
        year: 2021,
        type: "Legal Tender",
      },
      {
        country: "Central African Republic",
        flag: "🇨🇫",
        year: 2022,
        type: "Legal Tender",
      },
      {
        country: "United States",
        flag: "🇺🇸",
        year: 2024,
        type: "Spot ETF Approved",
      },
      {
        country: "United States",
        flag: "🇺🇸",
        year: 2025,
        type: "Strategic Bitcoin Reserve",
      },
      {
        country: "Bhutan",
        flag: "🇧🇹",
        year: 2023,
        type: "State Mining Operation",
      },
      {
        country: "Hong Kong",
        flag: "🇭🇰",
        year: 2024,
        type: "Spot ETF Approved",
      },
    ];

    // Cost of 51% attack estimate
    const attackCostPerHour = hashrate * 0.04 * 1e6; // rough estimate
    const attackCostPerDay = attackCostPerHour * 24;

    return NextResponse.json({
      btcPrice,
      btcMarketCap,
      hashrate: Math.round(hashrate),
      assetRankings: rankings,
      gdpRankings,
      btcGdpRank,
      adoption,
      attackCostPerDay: Math.round(attackCostPerDay),
      networkSecurityBudget:
        Math.round((6.25 * 144 * btcPrice) / 1e6) + " M USD/day",
    });
  } catch {
    return NextResponse.json({
      btcPrice: 97000,
      btcMarketCap: 1900000000000,
      hashrate: 750,
      assetRankings: [],
      gdpRankings: [],
      btcGdpRank: 8,
      adoption: [],
      attackCostPerDay: 0,
      networkSecurityBudget: "87 M USD/day",
    });
  }
}
