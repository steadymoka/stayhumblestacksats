import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    // Fetch Bitcoin data from CoinGecko
    let btcPrice = 0;
    let btcMarketCap = 0;

    try {
      const cgRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,krw&include_market_cap=true"
      );
      if (cgRes.ok) {
        const cgData = await cgRes.json();
        btcPrice = cgData.bitcoin?.usd || 97000;
        btcMarketCap = cgData.bitcoin?.usd_market_cap || 1900000000000;
      }
    } catch {
      btcPrice = 97000;
      btcMarketCap = 1900000000000;
    }

    // Bitcoin supply info
    const totalSupply = 21000000;
    const currentSupply = 19850000;
    const btcInflationRate = 0.83;

    // Currency devaluation data vs BTC (approximate 10-year figures)
    const currencies = [
      {
        currency: "ARS",
        country: "Argentina",
        flag: "🇦🇷",
        devaluationPercent: -99.97,
        m2GrowthPercent: 8500,
      },
      {
        currency: "TRY",
        country: "Turkey",
        flag: "🇹🇷",
        devaluationPercent: -99.5,
        m2GrowthPercent: 3200,
      },
      {
        currency: "NGN",
        country: "Nigeria",
        flag: "🇳🇬",
        devaluationPercent: -99.3,
        m2GrowthPercent: 2100,
      },
      {
        currency: "JPY",
        country: "Japan",
        flag: "🇯🇵",
        devaluationPercent: -97.8,
        m2GrowthPercent: 42,
      },
      {
        currency: "KRW",
        country: "South Korea",
        flag: "🇰🇷",
        devaluationPercent: -97.2,
        m2GrowthPercent: 68,
      },
      {
        currency: "EUR",
        country: "Eurozone",
        flag: "🇪🇺",
        devaluationPercent: -96.5,
        m2GrowthPercent: 55,
      },
      {
        currency: "USD",
        country: "United States",
        flag: "🇺🇸",
        devaluationPercent: -95.8,
        m2GrowthPercent: 72,
      },
      {
        currency: "CHF",
        country: "Switzerland",
        flag: "🇨🇭",
        devaluationPercent: -94.1,
        m2GrowthPercent: 28,
      },
    ];

    // Global M2 money supply estimate
    const globalM2 = 108400000000000; // ~$108.4T
    const m2YoYGrowth = 8.2;

    // Historical purchasing power comparison
    const purchasingPower = {
      year2015: {
        btcPrice: 315,
        items: [
          "중고 자전거 1대",
          "괜찮은 저녁 식사 3회",
          "저가 스마트폰 1대",
        ],
      },
      year2025: {
        btcPrice: btcPrice,
        items: [
          "서울 아파트 전세 보증금",
          "테슬라 Model 3 1대",
          "전 세계 여행 2회",
        ],
      },
    };

    return NextResponse.json({
      btcPrice,
      btcMarketCap,
      totalSupply,
      currentSupply,
      btcInflationRate,
      currencies,
      globalM2,
      m2YoYGrowth,
      purchasingPower,
    });
  } catch {
    return NextResponse.json({
      btcPrice: 97000,
      btcMarketCap: 1900000000000,
      totalSupply: 21000000,
      currentSupply: 19850000,
      btcInflationRate: 0.83,
      currencies: [],
      globalM2: 108400000000000,
      m2YoYGrowth: 8.2,
      purchasingPower: null,
    });
  }
}
