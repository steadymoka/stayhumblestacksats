// Direct client-side API fetchers (no server needed)

export async function fetchNodeData() {
  const fallback = {
    totalNodes: 18472,
    nodesByCountry: [
      { country: "United States", code: "US", count: 3847 },
      { country: "Germany", code: "DE", count: 2651 },
      { country: "France", code: "FR", count: 1203 },
      { country: "Netherlands", code: "NL", count: 987 },
      { country: "Canada", code: "CA", count: 876 },
      { country: "United Kingdom", code: "GB", count: 743 },
      { country: "Japan", code: "JP", count: 612 },
      { country: "Singapore", code: "SG", count: 489 },
      { country: "Australia", code: "AU", count: 367 },
      { country: "South Korea", code: "KR", count: 298 },
    ],
    clientVersions: [
      { name: "Satoshi", count: 16200 },
      { name: "btcd", count: 420 },
      { name: "Bitcoin Knots", count: 380 },
      { name: "Other", count: 272 },
    ],
    miningPools: [
      { name: "Foundry USA", share: 27 },
      { name: "AntPool", share: 21 },
      { name: "F2Pool", share: 13 },
      { name: "ViaBTC", share: 11 },
      { name: "Binance Pool", share: 7 },
      { name: "Others", share: 21 },
    ],
    nakamotoCoefficient: 4,
  };

  try {
    // Mining pools from mempool.space (CORS OK)
    let miningPools = fallback.miningPools;
    try {
      const poolRes = await fetch("https://mempool.space/api/v1/mining/pools/1w");
      if (poolRes.ok) {
        const poolData = await poolRes.json();
        miningPools = (poolData.pools || [])
          .slice(0, 10)
          .map((p: { name: string; blockCount: number }) => ({
            name: p.name,
            share: Math.round((p.blockCount / (poolData.blockCount || 1)) * 100),
          }));
      }
    } catch { /* use fallback */ }

    let nakamotoCoeff = 0;
    let cumulative = 0;
    for (const pool of miningPools) {
      cumulative += pool.share;
      nakamotoCoeff++;
      if (cumulative > 50) break;
    }

    // Bitnodes may have CORS issues, so use fallback for node data
    let totalNodes = fallback.totalNodes;
    let nodesByCountry = fallback.nodesByCountry;
    let clientVersions = fallback.clientVersions;

    try {
      const res = await fetch("https://bitnodes.io/api/v1/snapshots/latest/");
      if (res.ok) {
        const data = await res.json();
        totalNodes = data.total_nodes || fallback.totalNodes;

        const countryMap: Record<string, number> = {};
        const clientMap: Record<string, number> = {};
        for (const [, info] of Object.entries(data.nodes || {})) {
          const n = info as string[];
          const country = n[7] || "Unknown";
          const ua = n[1] || "Unknown";
          countryMap[country] = (countryMap[country] || 0) + 1;
          const match = ua.match(/\/(.*?):/);
          const client = match ? match[1] : "Other";
          clientMap[client] = (clientMap[client] || 0) + 1;
        }
        nodesByCountry = Object.entries(countryMap)
          .map(([country, count]) => ({ country, code: country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);
        clientVersions = Object.entries(clientMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }
    } catch { /* use fallback */ }

    return { totalNodes, nodesByCountry, clientVersions, miningPools, nakamotoCoefficient: nakamotoCoeff || 4 };
  } catch {
    return fallback;
  }
}

const SATOSHI_ADDRESSES = [
  "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX",
  "1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1",
];

export async function fetchSatoshiData() {
  try {
    const results = await Promise.allSettled(
      SATOSHI_ADDRESSES.map(async (address) => {
        const res = await fetch(`https://mempool.space/api/address/${address}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return {
          address,
          balance: (data.chain_stats?.funded_txo_sum - data.chain_stats?.spent_txo_sum) / 1e8,
          txCount: data.chain_stats?.tx_count + (data.mempool_stats?.tx_count || 0),
        };
      })
    );

    const wallets = results.map((r, i) => {
      if (r.status === "fulfilled") {
        return {
          address: SATOSHI_ADDRESSES[i],
          balance: r.value.balance,
          lastActive: i === 0 ? "Active (receives donations)" : "2010",
          txCount: r.value.txCount,
        };
      }
      return { address: SATOSHI_ADDRESSES[i], balance: 50, lastActive: "2010", txCount: 1 };
    });

    const daysSinceLastActive = Math.floor((Date.now() - new Date("2010-12-13").getTime()) / 86400000);

    return {
      estimatedTotalBtc: 1100000,
      daysSinceLastActive,
      lastActiveDate: "2010-12-13",
      knownAddresses: 8,
      totalPatoshiBlocks: 22000,
      wallets,
      percentOfSupply: ((1100000 / 21000000) * 100).toFixed(2),
    };
  } catch {
    return {
      estimatedTotalBtc: 1100000,
      daysSinceLastActive: 5555,
      lastActiveDate: "2010-12-13",
      knownAddresses: 8,
      totalPatoshiBlocks: 22000,
      wallets: SATOSHI_ADDRESSES.map((address) => ({ address, balance: 50, lastActive: "2010", txCount: 1 })),
      percentOfSupply: "5.24",
    };
  }
}

const LABELED_ADDRESSES = [
  { address: "bc1qazcm763858nkj2dz7g20jqv57ynkpgtqmrx9er", label: "Binance", type: "exchange" as const },
  { address: "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h", label: "Binance Cold", type: "exchange" as const },
  { address: "3LYJfcfHPXYJreMsASk2jkn69LWEYKzexb", label: "Bitfinex", type: "exchange" as const },
  { address: "bc1qjasf9z3h7w3jspkhtgatgpyvvzgpa2wwd2lr0eh5tx44reyn2k7sfl6ty6", label: "Bitfinex Cold", type: "exchange" as const },
  { address: "bc1qx9t2l3pyny2spqpqlye8svce70nppwtaxwdrp4", label: "Coinbase", type: "exchange" as const },
  { address: "1FzWLkAahHooV3kzTgyx6qsXoRDrBsrXG2", label: "US Government (Seized)", type: "government" as const },
  { address: "bc1q0kswhvsucau9flyvPC8hvqp9v9tkjmp3r7dzfu", label: "El Salvador", type: "government" as const },
  { address: "1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ", label: "MicroStrategy", type: "institution" as const },
];

export async function fetchWhaleData() {
  const wealthDistribution = [
    { range: "> 10,000 BTC", addresses: 93, totalBtc: 3240000 },
    { range: "1,000 - 10,000 BTC", addresses: 2089, totalBtc: 5120000 },
    { range: "100 - 1,000 BTC", addresses: 15482, totalBtc: 4280000 },
    { range: "10 - 100 BTC", addresses: 152331, totalBtc: 4150000 },
    { range: "1 - 10 BTC", addresses: 841224, totalBtc: 2530000 },
    { range: "0.1 - 1 BTC", addresses: 3820000, totalBtc: 1240000 },
    { range: "< 0.1 BTC", addresses: 45000000, totalBtc: 440000 },
  ];

  try {
    const addressResults = await Promise.allSettled(
      LABELED_ADDRESSES.slice(0, 4).map(async (entry) => {
        const res = await fetch(`https://mempool.space/api/address/${entry.address}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const balance = (data.chain_stats?.funded_txo_sum - data.chain_stats?.spent_txo_sum) / 1e8;
        return { ...entry, balance, lastTx: "recent" };
      })
    );

    const recentMovements = addressResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<typeof LABELED_ADDRESSES[0] & { balance: number; lastTx: string }>).value);

    const totalBtc = wealthDistribution.reduce((s, d) => s + d.totalBtc, 0);

    return {
      wealthDistribution,
      labeledAddresses: LABELED_ADDRESSES,
      recentMovements,
      giniCoefficient: 0.93,
      topHoldersPercentage: (((wealthDistribution[0].totalBtc + wealthDistribution[1].totalBtc) / totalBtc) * 100).toFixed(1),
    };
  } catch {
    return {
      wealthDistribution,
      labeledAddresses: LABELED_ADDRESSES,
      recentMovements: [],
      giniCoefficient: 0.93,
      topHoldersPercentage: "39.8",
    };
  }
}

export async function fetchSoundMoneyData() {
  let btcPrice = 97000;

  try {
    const cgRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true");
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      btcPrice = cgData.bitcoin?.usd || 97000;
    }
  } catch { /* use fallback */ }

  const currencies = [
    { currency: "ARS", country: "Argentina", flag: "\u{1F1E6}\u{1F1F7}", devaluationPercent: -99.97, m2GrowthPercent: 8500 },
    { currency: "TRY", country: "Turkey", flag: "\u{1F1F9}\u{1F1F7}", devaluationPercent: -99.5, m2GrowthPercent: 3200 },
    { currency: "NGN", country: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}", devaluationPercent: -99.3, m2GrowthPercent: 2100 },
    { currency: "JPY", country: "Japan", flag: "\u{1F1EF}\u{1F1F5}", devaluationPercent: -97.8, m2GrowthPercent: 42 },
    { currency: "KRW", country: "South Korea", flag: "\u{1F1F0}\u{1F1F7}", devaluationPercent: -97.2, m2GrowthPercent: 68 },
    { currency: "EUR", country: "Eurozone", flag: "\u{1F1EA}\u{1F1FA}", devaluationPercent: -96.5, m2GrowthPercent: 55 },
    { currency: "USD", country: "United States", flag: "\u{1F1FA}\u{1F1F8}", devaluationPercent: -95.8, m2GrowthPercent: 72 },
    { currency: "CHF", country: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}", devaluationPercent: -94.1, m2GrowthPercent: 28 },
  ];

  return {
    btcPrice,
    btcMarketCap: btcPrice * 19850000,
    totalSupply: 21000000,
    currentSupply: 19850000,
    btcInflationRate: 0.83,
    currencies,
    globalM2: 108400000000000,
    m2YoYGrowth: 8.2,
    purchasingPower: {
      year2015: { btcPrice: 315, items: ["\uc911\uace0 \uc790\uc804\uac70 1\ub300", "\uad1c\ucc2e\uc740 \uc800\ub141 \uc2dd\uc0ac 3\ud68c", "\uc800\uac00 \uc2a4\ub9c8\ud2b8\ud3f0 1\ub300"] },
      year2025: { btcPrice, items: ["\uc11c\uc6b8 \uc544\ud30c\ud2b8 \uc804\uc138 \ubcf4\uc99d\uae08", "\ud14c\uc2ac\ub77c Model 3 1\ub300", "\uc804 \uc138\uacc4 \uc5ec\ud589 2\ud68c"] },
    },
  };
}

export async function fetchNationsData() {
  let btcPrice = 97000;
  let btcMarketCap = 1900000000000;
  let hashrate = 750;

  try {
    const [cgRes, hrRes] = await Promise.allSettled([
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true"),
      fetch("https://mempool.space/api/v1/mining/hashrate/1m"),
    ]);

    if (cgRes.status === "fulfilled" && cgRes.value.ok) {
      const data = await cgRes.value.json();
      btcPrice = data.bitcoin?.usd || 97000;
      btcMarketCap = data.bitcoin?.usd_market_cap || btcPrice * 19850000;
    }

    if (hrRes.status === "fulfilled" && hrRes.value.ok) {
      const data = await hrRes.value.json();
      const latest = data.hashrates?.[data.hashrates.length - 1];
      hashrate = latest?.avgHashrate ? latest.avgHashrate / 1e18 : 750;
    }
  } catch { /* use fallback */ }

  const assetRankings = [
    { name: "Gold", type: "commodity" as const, value: 18.5, flag: "\u{1F947}" },
    { name: "Apple", type: "company" as const, value: 3.8, flag: "\u{1F34E}" },
    { name: "NVIDIA", type: "company" as const, value: 3.4, flag: "\u{1F4BB}" },
    { name: "Microsoft", type: "company" as const, value: 3.1, flag: "\u{1FA9F}" },
    { name: "Bitcoin", type: "bitcoin" as const, value: btcMarketCap / 1e12, flag: "\u{1F7E0}" },
    { name: "Amazon", type: "company" as const, value: 2.3, flag: "\u{1F4E6}" },
    { name: "Saudi Aramco", type: "company" as const, value: 1.8, flag: "\u{1F6E2}\u{FE0F}" },
    { name: "Silver", type: "commodity" as const, value: 1.7, flag: "\u{1F948}" },
  ].sort((a, b) => b.value - a.value);

  const gdpRankings = [
    { name: "United States", type: "country" as const, value: 28.78, flag: "\u{1F1FA}\u{1F1F8}" },
    { name: "China", type: "country" as const, value: 18.53, flag: "\u{1F1E8}\u{1F1F3}" },
    { name: "Germany", type: "country" as const, value: 4.59, flag: "\u{1F1E9}\u{1F1EA}" },
    { name: "Japan", type: "country" as const, value: 4.11, flag: "\u{1F1EF}\u{1F1F5}" },
    { name: "India", type: "country" as const, value: 3.94, flag: "\u{1F1EE}\u{1F1F3}" },
    { name: "United Kingdom", type: "country" as const, value: 3.50, flag: "\u{1F1EC}\u{1F1E7}" },
    { name: "France", type: "country" as const, value: 3.13, flag: "\u{1F1EB}\u{1F1F7}" },
    { name: "Bitcoin", type: "bitcoin" as const, value: btcMarketCap / 1e12, flag: "\u{1F7E0}" },
    { name: "Italy", type: "country" as const, value: 2.33, flag: "\u{1F1EE}\u{1F1F9}" },
    { name: "Brazil", type: "country" as const, value: 2.33, flag: "\u{1F1E7}\u{1F1F7}" },
    { name: "Canada", type: "country" as const, value: 2.24, flag: "\u{1F1E8}\u{1F1E6}" },
    { name: "South Korea", type: "country" as const, value: 1.72, flag: "\u{1F1F0}\u{1F1F7}" },
  ].sort((a, b) => b.value - a.value);

  const btcGdpRank = gdpRankings.findIndex((r) => r.name === "Bitcoin") + 1;

  const adoption = [
    { country: "El Salvador", flag: "\u{1F1F8}\u{1F1FB}", year: 2021, type: "Legal Tender" },
    { country: "Central African Republic", flag: "\u{1F1E8}\u{1F1EB}", year: 2022, type: "Legal Tender" },
    { country: "United States", flag: "\u{1F1FA}\u{1F1F8}", year: 2024, type: "Spot ETF Approved" },
    { country: "United States", flag: "\u{1F1FA}\u{1F1F8}", year: 2025, type: "Strategic Bitcoin Reserve" },
    { country: "Bhutan", flag: "\u{1F1E7}\u{1F1F9}", year: 2023, type: "State Mining Operation" },
    { country: "Hong Kong", flag: "\u{1F1ED}\u{1F1F0}", year: 2024, type: "Spot ETF Approved" },
  ];

  return {
    btcPrice,
    btcMarketCap,
    hashrate: Math.round(hashrate),
    assetRankings,
    gdpRankings,
    btcGdpRank,
    adoption,
    attackCostPerDay: Math.round(hashrate * 0.04 * 1e6 * 24),
    networkSecurityBudget: Math.round((6.25 * 144 * btcPrice) / 1e6) + " M USD/day",
  };
}
