#!/usr/bin/env node
// Fetches external data (server-side, no CORS) and saves to observatory/public/data/
// Runs periodically via GitHub Actions

import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "observatory", "public", "data");
mkdirSync(DATA_DIR, { recursive: true });

function save(filename, data) {
  const path = join(DATA_DIR, filename);
  writeFileSync(path, JSON.stringify({ ...data, lastUpdated: new Date().toISOString() }, null, 2));
  console.log(`Saved ${filename}`);
}

function loadExisting(filename) {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, filename), "utf-8"));
  } catch {
    return null;
  }
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

// ── 1. Bitnodes ─────────────────────────────────────────────
async function fetchNodes() {
  const fallback = loadExisting("nodes.json");
  try {
    const data = await fetchJSON("https://bitnodes.io/api/v1/snapshots/latest/");
    const totalNodes = data.total_nodes || 0;

    const countryMap = {};
    const clientMap = {};
    for (const info of Object.values(data.nodes || {})) {
      const n = /** @type {string[]} */ (info);
      const country = n[7] || "Unknown";
      countryMap[country] = (countryMap[country] || 0) + 1;
      const match = (n[1] || "").match(/\/(.*?):/);
      const client = match ? match[1] : "Other";
      clientMap[client] = (clientMap[client] || 0) + 1;
    }

    save("nodes.json", {
      totalNodes,
      nodesByCountry: Object.entries(countryMap)
        .map(([country, count]) => ({ country, code: country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      clientVersions: Object.entries(clientMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    });
    console.log(`  Nodes: ${totalNodes}`);
  } catch (e) {
    console.error("Failed to fetch nodes:", e.message);
    if (!fallback) throw e;
  }
}

// ── 2. Mining (mempool.space) ───────────────────────────────
async function fetchMining() {
  const fallback = loadExisting("mining.json");
  try {
    const [poolData, hrData] = await Promise.all([
      fetchJSON("https://mempool.space/api/v1/mining/pools/1w"),
      fetchJSON("https://mempool.space/api/v1/mining/hashrate/1m"),
    ]);

    const miningPools = (poolData.pools || []).slice(0, 10).map((p) => ({
      name: p.name,
      share: Math.round((p.blockCount / (poolData.blockCount || 1)) * 100),
    }));

    const latest = hrData.hashrates?.[hrData.hashrates.length - 1];
    const hashrate = latest?.avgHashrate ? Math.round(latest.avgHashrate / 1e18) : 0;

    save("mining.json", { miningPools, hashrate });
    console.log(`  Hashrate: ${hashrate} EH/s, Pools: ${miningPools.length}`);
  } catch (e) {
    console.error("Failed to fetch mining:", e.message);
    if (!fallback) throw e;
  }
}

// ── 3. Market / Fiat prices (CoinGecko) ─────────────────────
// Historical BTC prices (Jan 2015) for devaluation calculation
const BTC_PRICE_2015 = {
  USD: 315, ARS: 2677, TRY: 734, NGN: 58275,
  JPY: 37800, KRW: 344925, EUR: 261, CHF: 312,
};

async function fetchMarket() {
  const fallback = loadExisting("market.json");
  try {
    const data = await fetchJSON(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,ars,try,ngn,jpy,krw,eur,chf&include_market_cap=true"
    );
    const btc = data.bitcoin;

    const btcPrices = {
      USD: btc.usd, ARS: btc.ars, TRY: btc.try, NGN: btc.ngn,
      JPY: btc.jpy, KRW: btc.krw, EUR: btc.eur, CHF: btc.chf,
    };

    // Calculate devaluation: how much fiat lost value vs BTC since 2015
    const fiatDevaluation = {};
    for (const [code, currentPrice] of Object.entries(btcPrices)) {
      const historicalPrice = BTC_PRICE_2015[code];
      if (historicalPrice && currentPrice) {
        fiatDevaluation[code] = -((1 - historicalPrice / currentPrice) * 100);
      }
    }

    save("market.json", {
      btcPriceUsd: btc.usd,
      btcMarketCap: btc.usd_market_cap,
      btcPrices,
      fiatDevaluation,
    });
    console.log(`  BTC: $${btc.usd}`);
  } catch (e) {
    console.error("Failed to fetch market:", e.message);
    if (!fallback) throw e;
  }
}

// ── 4. Assets, GDP, Wealth distribution ─────────────────────
async function fetchAssets() {
  const existing = loadExisting("assets.json");

  // Try to get gold price for market cap calculation
  let goldMarketCapT = existing?.assetRankings?.find((a) => a.name === "Gold")?.value || 18.5;
  try {
    const goldData = await fetchJSON("https://data-asg.goldprice.org/dbXRates/USD");
    if (goldData?.items?.[0]?.xauPrice) {
      const goldPricePerOz = goldData.items[0].xauPrice;
      goldMarketCapT = Math.round((goldPricePerOz * 215000 * 32150.75) / 1e12 * 10) / 10;
      console.log(`  Gold: $${goldPricePerOz}/oz → ${goldMarketCapT}T market cap`);
    }
  } catch (e) {
    console.warn("  Gold price fetch failed, using existing:", e.message);
  }

  save("assets.json", {
    assetRankings: [
      { name: "Gold", type: "commodity", value: goldMarketCapT, flag: "\u{1F947}" },
      { name: "Apple", type: "company", value: existing?.assetRankings?.find((a) => a.name === "Apple")?.value || 3.8, flag: "\u{1F34E}" },
      { name: "NVIDIA", type: "company", value: existing?.assetRankings?.find((a) => a.name === "NVIDIA")?.value || 3.4, flag: "\u{1F4BB}" },
      { name: "Microsoft", type: "company", value: existing?.assetRankings?.find((a) => a.name === "Microsoft")?.value || 3.1, flag: "\u{1FA9F}" },
      { name: "Amazon", type: "company", value: existing?.assetRankings?.find((a) => a.name === "Amazon")?.value || 2.3, flag: "\u{1F4E6}" },
      { name: "Saudi Aramco", type: "company", value: existing?.assetRankings?.find((a) => a.name === "Saudi Aramco")?.value || 1.8, flag: "\u{1F6E2}\u{FE0F}" },
      { name: "Silver", type: "commodity", value: existing?.assetRankings?.find((a) => a.name === "Silver")?.value || 1.7, flag: "\u{1F948}" },
    ],
    gdpRankings: [
      { name: "United States", type: "country", value: 28.78, flag: "\u{1F1FA}\u{1F1F8}" },
      { name: "China", type: "country", value: 18.53, flag: "\u{1F1E8}\u{1F1F3}" },
      { name: "Germany", type: "country", value: 4.59, flag: "\u{1F1E9}\u{1F1EA}" },
      { name: "Japan", type: "country", value: 4.11, flag: "\u{1F1EF}\u{1F1F5}" },
      { name: "India", type: "country", value: 3.94, flag: "\u{1F1EE}\u{1F1F3}" },
      { name: "United Kingdom", type: "country", value: 3.50, flag: "\u{1F1EC}\u{1F1E7}" },
      { name: "France", type: "country", value: 3.13, flag: "\u{1F1EB}\u{1F1F7}" },
      { name: "Italy", type: "country", value: 2.33, flag: "\u{1F1EE}\u{1F1F9}" },
      { name: "Brazil", type: "country", value: 2.33, flag: "\u{1F1E7}\u{1F1F7}" },
      { name: "Canada", type: "country", value: 2.24, flag: "\u{1F1E8}\u{1F1E6}" },
      { name: "South Korea", type: "country", value: 1.72, flag: "\u{1F1F0}\u{1F1F7}" },
    ],
    wealthDistribution: [
      { range: "> 10,000 BTC", addresses: 93, totalBtc: 3240000 },
      { range: "1,000 - 10,000 BTC", addresses: 2089, totalBtc: 5120000 },
      { range: "100 - 1,000 BTC", addresses: 15482, totalBtc: 4280000 },
      { range: "10 - 100 BTC", addresses: 152331, totalBtc: 4150000 },
      { range: "1 - 10 BTC", addresses: 841224, totalBtc: 2530000 },
      { range: "0.1 - 1 BTC", addresses: 3820000, totalBtc: 1240000 },
      { range: "< 0.1 BTC", addresses: 45000000, totalBtc: 440000 },
    ],
    adoption: [
      { country: "El Salvador", flag: "\u{1F1F8}\u{1F1FB}", year: 2021, type: "Legal Tender" },
      { country: "Central African Republic", flag: "\u{1F1E8}\u{1F1EB}", year: 2022, type: "Legal Tender" },
      { country: "United States", flag: "\u{1F1FA}\u{1F1F8}", year: 2024, type: "Spot ETF Approved" },
      { country: "United States", flag: "\u{1F1FA}\u{1F1F8}", year: 2025, type: "Strategic Bitcoin Reserve" },
      { country: "Bhutan", flag: "\u{1F1E7}\u{1F1F9}", year: 2023, type: "State Mining Operation" },
      { country: "Hong Kong", flag: "\u{1F1ED}\u{1F1F0}", year: 2024, type: "Spot ETF Approved" },
    ],
    currencies: [
      { currency: "ARS", country: "Argentina", flag: "\u{1F1E6}\u{1F1F7}", m2GrowthPercent: 8500 },
      { currency: "TRY", country: "Turkey", flag: "\u{1F1F9}\u{1F1F7}", m2GrowthPercent: 3200 },
      { currency: "NGN", country: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}", m2GrowthPercent: 2100 },
      { currency: "JPY", country: "Japan", flag: "\u{1F1EF}\u{1F1F5}", m2GrowthPercent: 42 },
      { currency: "KRW", country: "South Korea", flag: "\u{1F1F0}\u{1F1F7}", m2GrowthPercent: 68 },
      { currency: "EUR", country: "Eurozone", flag: "\u{1F1EA}\u{1F1FA}", m2GrowthPercent: 55 },
      { currency: "USD", country: "United States", flag: "\u{1F1FA}\u{1F1F8}", m2GrowthPercent: 72 },
      { currency: "CHF", country: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}", m2GrowthPercent: 28 },
    ],
  });
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  console.log("Fetching data...\n");

  const results = await Promise.allSettled([
    fetchNodes(),
    fetchMining(),
    fetchMarket(),
    fetchAssets(),
  ]);

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(`\n${failed.length} fetch(es) failed`);
    for (const f of failed) console.error(" ", f.reason?.message);
  }

  console.log("\nDone!");
}

main();
