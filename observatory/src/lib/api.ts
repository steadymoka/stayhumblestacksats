// Hybrid data layer: periodic JSON (from GitHub Actions) + live API overlay

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

// ── Helpers ─────────────────────────────────────────────────

async function loadJSON<T>(filename: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_PATH}/data/${filename}`);
    if (res.ok) return res.json();
  } catch { /* JSON unavailable */ }
  return null;
}

async function tryFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (res.ok) return res.json();
  } catch { /* live API unavailable */ }
  return null;
}

// ── 1. Decentralization / Nodes ─────────────────────────────

interface NodesJSON {
  totalNodes: number;
  nodesByCountry: { country: string; code: string; count: number }[];
  clientVersions: { name: string; count: number }[];
}

interface MiningJSON {
  miningPools: { name: string; share: number }[];
  hashrate: number;
}

export async function fetchNodeData() {
  // Load periodic JSON data (updated by GitHub Actions)
  const [nodesJson, miningJson] = await Promise.all([
    loadJSON<NodesJSON>("nodes.json"),
    loadJSON<MiningJSON>("mining.json"),
  ]);

  // Live overlay: mining pools (mempool.space CORS OK)
  let miningPools = miningJson?.miningPools || [];
  try {
    const poolData = await tryFetch<{ pools: { name: string; blockCount: number }[]; blockCount: number }>(
      "https://mempool.space/api/v1/mining/pools/1w"
    );
    if (poolData?.pools) {
      miningPools = poolData.pools.slice(0, 10).map((p) => ({
        name: p.name,
        share: Math.round((p.blockCount / (poolData.blockCount || 1)) * 100),
      }));
    }
  } catch { /* use JSON data */ }

  let nakamotoCoeff = 0;
  let cumulative = 0;
  for (const pool of miningPools) {
    cumulative += pool.share;
    nakamotoCoeff++;
    if (cumulative > 50) break;
  }

  return {
    totalNodes: nodesJson?.totalNodes || 18472,
    nodesByCountry: nodesJson?.nodesByCountry || [],
    clientVersions: nodesJson?.clientVersions || [],
    miningPools,
    nakamotoCoefficient: nakamotoCoeff || 4,
  };
}

// ── 2. Satoshi Wallets (all live) ───────────────────────────

const SATOSHI_ADDRESSES = [
  "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX",
  "1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1",
];

export async function fetchSatoshiData() {
  const results = await Promise.allSettled(
    SATOSHI_ADDRESSES.map(async (address) => {
      const data = await tryFetch<{
        chain_stats: { funded_txo_sum: number; spent_txo_sum: number; tx_count: number };
        mempool_stats: { tx_count: number };
      }>(`https://mempool.space/api/address/${address}`);
      if (!data) throw new Error("fetch failed");
      return {
        address,
        balance: (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 1e8,
        txCount: data.chain_stats.tx_count + (data.mempool_stats?.tx_count || 0),
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

  return {
    estimatedTotalBtc: 1100000,
    daysSinceLastActive: Math.floor((Date.now() - new Date("2010-12-13").getTime()) / 86400000),
    lastActiveDate: "2010-12-13",
    knownAddresses: 8,
    totalPatoshiBlocks: 22000,
    wallets,
    percentOfSupply: ((1100000 / 21000000) * 100).toFixed(2),
  };
}

// ── 3. Whale Observatory ────────────────────────────────────

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

interface AssetsJSON {
  wealthDistribution: { range: string; addresses: number; totalBtc: number }[];
  [key: string]: unknown;
}

export async function fetchWhaleData() {
  // Wealth distribution from periodic JSON
  const assetsJson = await loadJSON<AssetsJSON>("assets.json");
  const wealthDistribution = assetsJson?.wealthDistribution || [
    { range: "> 10,000 BTC", addresses: 93, totalBtc: 3240000 },
    { range: "1,000 - 10,000 BTC", addresses: 2089, totalBtc: 5120000 },
    { range: "100 - 1,000 BTC", addresses: 15482, totalBtc: 4280000 },
    { range: "10 - 100 BTC", addresses: 152331, totalBtc: 4150000 },
    { range: "1 - 10 BTC", addresses: 841224, totalBtc: 2530000 },
    { range: "0.1 - 1 BTC", addresses: 3820000, totalBtc: 1240000 },
    { range: "< 0.1 BTC", addresses: 45000000, totalBtc: 440000 },
  ];

  // Live: whale address balances (mempool.space)
  const addressResults = await Promise.allSettled(
    LABELED_ADDRESSES.map(async (entry) => {
      const data = await tryFetch<{
        chain_stats: { funded_txo_sum: number; spent_txo_sum: number };
      }>(`https://mempool.space/api/address/${entry.address}`);
      if (!data) throw new Error("fetch failed");
      const balance = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 1e8;
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
}

// ── 4. Sound Money Index ────────────────────────────────────

interface MarketJSON {
  btcPriceUsd: number;
  btcMarketCap: number;
  btcPrices: Record<string, number>;
  fiatDevaluation: Record<string, number>;
}

interface CurrencyInfo {
  currency: string;
  country: string;
  flag: string;
  m2GrowthPercent: number;
}

export async function fetchSoundMoneyData() {
  // Load periodic JSON
  const [marketJson, assetsJson] = await Promise.all([
    loadJSON<MarketJSON>("market.json"),
    loadJSON<{ currencies: CurrencyInfo[] }>("assets.json"),
  ]);

  // Live overlay: BTC price (CoinGecko)
  let btcPrice = marketJson?.btcPriceUsd || 97000;
  let btcPrices = marketJson?.btcPrices || {};
  let fiatDevaluation = marketJson?.fiatDevaluation || {};

  const liveData = await tryFetch<{
    bitcoin: Record<string, number>;
  }>("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,ars,try,ngn,jpy,krw,eur,chf&include_market_cap=true");

  if (liveData?.bitcoin) {
    const btc = liveData.bitcoin;
    btcPrice = btc.usd || btcPrice;
    btcPrices = {
      USD: btc.usd, ARS: btc.ars, TRY: btc.try, NGN: btc.ngn,
      JPY: btc.jpy, KRW: btc.krw, EUR: btc.eur, CHF: btc.chf,
    };

    // Recalculate devaluation with live prices
    const BTC_PRICE_2015: Record<string, number> = {
      USD: 315, ARS: 2677, TRY: 734, NGN: 58275,
      JPY: 37800, KRW: 344925, EUR: 261, CHF: 312,
    };
    fiatDevaluation = {};
    for (const [code, currentPrice] of Object.entries(btcPrices)) {
      const historical = BTC_PRICE_2015[code];
      if (historical && currentPrice) {
        fiatDevaluation[code] = -((1 - historical / currentPrice) * 100);
      }
    }
  }

  // Build currencies array with live devaluation data
  const currencyMeta = assetsJson?.currencies || [
    { currency: "ARS", country: "Argentina", flag: "\u{1F1E6}\u{1F1F7}", m2GrowthPercent: 8500 },
    { currency: "TRY", country: "Turkey", flag: "\u{1F1F9}\u{1F1F7}", m2GrowthPercent: 3200 },
    { currency: "NGN", country: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}", m2GrowthPercent: 2100 },
    { currency: "JPY", country: "Japan", flag: "\u{1F1EF}\u{1F1F5}", m2GrowthPercent: 42 },
    { currency: "KRW", country: "South Korea", flag: "\u{1F1F0}\u{1F1F7}", m2GrowthPercent: 68 },
    { currency: "EUR", country: "Eurozone", flag: "\u{1F1EA}\u{1F1FA}", m2GrowthPercent: 55 },
    { currency: "USD", country: "United States", flag: "\u{1F1FA}\u{1F1F8}", m2GrowthPercent: 72 },
    { currency: "CHF", country: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}", m2GrowthPercent: 28 },
  ];

  const currencies = currencyMeta.map((c) => ({
    ...c,
    devaluationPercent: fiatDevaluation[c.currency] ?? -95,
  }));

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

// ── 5. Bitcoin vs Nations ───────────────────────────────────

interface AssetRanking {
  name: string;
  type: string;
  value: number;
  flag: string;
}

interface FullAssetsJSON {
  assetRankings: AssetRanking[];
  gdpRankings: AssetRanking[];
  adoption: { country: string; flag: string; year: number; type: string }[];
}

export async function fetchNationsData() {
  // Load periodic JSON
  const [marketJson, miningJson, assetsJson] = await Promise.all([
    loadJSON<MarketJSON>("market.json"),
    loadJSON<MiningJSON>("mining.json"),
    loadJSON<FullAssetsJSON>("assets.json"),
  ]);

  // Live overlay: BTC price + market cap
  let btcPrice = marketJson?.btcPriceUsd || 97000;
  let btcMarketCap = marketJson?.btcMarketCap || btcPrice * 19850000;

  const liveData = await tryFetch<{
    bitcoin: { usd: number; usd_market_cap: number };
  }>("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true");

  if (liveData?.bitcoin) {
    btcPrice = liveData.bitcoin.usd || btcPrice;
    btcMarketCap = liveData.bitcoin.usd_market_cap || btcPrice * 19850000;
  }

  // Live overlay: hashrate
  let hashrate = miningJson?.hashrate || 750;
  const hrData = await tryFetch<{ hashrates: { avgHashrate: number }[] }>(
    "https://mempool.space/api/v1/mining/hashrate/1m"
  );
  if (hrData?.hashrates?.length) {
    const latest = hrData.hashrates[hrData.hashrates.length - 1];
    hashrate = latest?.avgHashrate ? Math.round(latest.avgHashrate / 1e18) : hashrate;
  }

  // Asset rankings from JSON + live BTC
  const storedAssets = assetsJson?.assetRankings || [];
  const assetRankings = [
    ...storedAssets,
    { name: "Bitcoin", type: "bitcoin", value: btcMarketCap / 1e12, flag: "\u{1F7E0}" },
  ].sort((a, b) => b.value - a.value);

  // GDP rankings from JSON + live BTC
  const storedGdp = assetsJson?.gdpRankings || [];
  const gdpRankings = [
    ...storedGdp,
    { name: "Bitcoin", type: "bitcoin", value: btcMarketCap / 1e12, flag: "\u{1F7E0}" },
  ].sort((a, b) => b.value - a.value);

  const btcGdpRank = gdpRankings.findIndex((r) => r.name === "Bitcoin") + 1;

  const adoption = assetsJson?.adoption || [
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
    hashrate,
    assetRankings,
    gdpRankings,
    btcGdpRank,
    adoption,
    attackCostPerDay: Math.round(hashrate * 0.04 * 1e6 * 24),
    networkSecurityBudget: Math.round((6.25 * 144 * btcPrice) / 1e6) + " M USD/day",
  };
}
