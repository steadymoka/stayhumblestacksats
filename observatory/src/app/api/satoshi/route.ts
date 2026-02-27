import { NextResponse } from "next/server";

export const revalidate = 600;

// Known Satoshi-era coinbase addresses (Patoshi pattern)
// These are a small subset of the ~20,000 blocks attributed to Satoshi
const SATOSHI_ADDRESSES = [
  "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", // Genesis block
  "12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX", // Block 1
  "1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1", // Block 2
  "1FvzCLoTPGANNjWoUo6jUGuAG3wg1w4YjR", // Block 3
  "15ubicBBWFnvoZLT7GiU2qxjRaKJPdkDMG", // Block 4
  "1JfbZRwdDHKZmuiZgYArJZhcuuzuw2HuMu", // Block 5
  "1GkQmKAmHtNfnD3LHhTkewJxKHVSta4m2a", // Block 9
  "1PSSGeFHDnKNxiEyFrD1wcEaHr9hrQDDWc", // Block 10
];

export async function GET() {
  try {
    // Fetch balance for the genesis address
    const results = await Promise.allSettled(
      SATOSHI_ADDRESSES.slice(0, 3).map(async (address) => {
        const res = await fetch(
          `https://mempool.space/api/address/${address}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return {
          address,
          balance:
            (data.chain_stats?.funded_txo_sum -
              data.chain_stats?.spent_txo_sum) /
            1e8,
          txCount:
            data.chain_stats?.tx_count + (data.mempool_stats?.tx_count || 0),
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
      return {
        address: SATOSHI_ADDRESSES[i],
        balance: 50,
        lastActive: "2010",
        txCount: 1,
      };
    });

    // Known estimates
    const estimatedTotal = 1100000; // ~1.1M BTC
    const daysSinceLastActive = Math.floor(
      (Date.now() - new Date("2010-12-13").getTime()) / 86400000
    );

    return NextResponse.json({
      estimatedTotalBtc: estimatedTotal,
      daysSinceLastActive,
      lastActiveDate: "2010-12-13",
      knownAddresses: SATOSHI_ADDRESSES.length,
      totalPatoshiBlocks: 22000,
      wallets,
      percentOfSupply: ((estimatedTotal / 21000000) * 100).toFixed(2),
    });
  } catch {
    return NextResponse.json({
      estimatedTotalBtc: 1100000,
      daysSinceLastActive: 5555,
      lastActiveDate: "2010-12-13",
      knownAddresses: 8,
      totalPatoshiBlocks: 22000,
      wallets: SATOSHI_ADDRESSES.slice(0, 3).map((address) => ({
        address,
        balance: 50,
        lastActive: "2010",
        txCount: 1,
      })),
      percentOfSupply: "5.24",
    });
  }
}
