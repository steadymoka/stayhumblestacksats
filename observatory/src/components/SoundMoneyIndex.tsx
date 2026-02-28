"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { fetchSoundMoneyData } from "@/lib/api";
import { useIsMobile } from "@/lib/useIsMobile";

type SoundMoneyData = Awaited<ReturnType<typeof fetchSoundMoneyData>>;

export default function SoundMoneyIndex() {
  const [data, setData] = useState<SoundMoneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchSoundMoneyData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">Sound Money Index</div>
        <div style={{ color: "var(--text-secondary)", padding: "40px 0", textAlign: "center" }}>
          Calculating monetary debasement...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const supplyPercent = ((data.currentSupply / data.totalSupply) * 100).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div className="card glow-orange">
        <div className="card-header">
          Section 4 — Sound Money Index
        </div>
        <div className="quote-box">
          &quot;건전화폐란 정부가 마음대로 찍어낼 수 없는 화폐를 말한다&quot; — Ludwig von
          Mises
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid-4">
        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Global M2 Supply</div>
          <div className="stat-big red">
            ${(data.globalM2 / 1e12).toFixed(1)}T
          </div>
          <div className="stat-label">+{data.m2YoYGrowth}% YoY</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Bitcoin Supply</div>
          <div className="stat-big bitcoin-orange">
            {(data.currentSupply / 1e6).toFixed(2)}M
          </div>
          <div className="stat-label">/ {data.totalSupply / 1e6}M ({supplyPercent}%)</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">BTC Inflation Rate</div>
          <div className="stat-big green">{data.btcInflationRate}%</div>
          <div className="stat-label">연간 (다음 반감기 후 ~0.4%)</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">BTC Price</div>
          <div className="stat-big bitcoin-gold">
            ${data.btcPrice.toLocaleString()}
          </div>
          <div className="stat-label">USD</div>
        </div>
      </div>

      {/* Supply Progress Bar */}
      <div className="card">
        <div className="card-header">Bitcoin Supply Issuance</div>
        <div style={{ marginBottom: 8 }}>
          <div className="progress-bar" style={{ height: 24, borderRadius: 8 }}>
            <div
              className="progress-fill"
              style={{
                width: `${supplyPercent}%`,
                background: "linear-gradient(90deg, #f7931a, #ffd700)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "#0a0a0f",
              }}
            >
              {supplyPercent}% mined
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.7rem",
            color: "var(--text-secondary)",
          }}
        >
          <span>Genesis Block (2009)</span>
          <span>Last Bitcoin (~2140)</span>
        </div>
      </div>

      {/* Currency Devaluation vs BTC */}
      <div className="card">
        <div className="card-header">
          Currency Devaluation vs BTC (10 Years)
        </div>
        <div style={{ width: "100%", height: isMobile ? 300 : 360 }}>
          <ResponsiveContainer>
            <BarChart
              data={data.currencies.map((c) => ({
                ...c,
                label: `${c.flag} ${c.currency}`,
                absDevaluation: Math.abs(c.devaluationPercent),
              }))}
              layout="vertical"
              margin={{ left: isMobile ? 10 : 80, right: 10 }}
            >
              <XAxis
                type="number"
                stroke="#8888a0"
                fontSize={11}
                domain={[0, 100]}
                tickFormatter={(v) => `-${v}%`}
              />
              <YAxis
                dataKey="label"
                type="category"
                stroke="#8888a0"
                fontSize={isMobile ? 11 : 13}
                width={isMobile ? 60 : 75}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid #2a2a3e",
                  borderRadius: 8,
                  color: "#e0e0e8",
                  fontSize: 12,
                }}
                formatter={(value) => [`-${Number(value).toFixed(1)}%`, "Devaluation vs BTC"]}
              />
              <Bar
                dataKey="absDevaluation"
                name="Devaluation"
                radius={[0, 4, 4, 0]}
              >
                {data.currencies.map((c, i) => (
                  <Cell
                    key={i}
                    fill={
                      Math.abs(c.devaluationPercent) > 99
                        ? "#ff4757"
                        : Math.abs(c.devaluationPercent) > 97
                          ? "#ff8c42"
                          : "#f7931a"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            marginTop: 8,
          }}
        >
          모든 법정화폐는 비트코인 대비 가치를 잃고 있습니다. 차이는 속도뿐입니다.
        </div>
      </div>

      {/* Purchasing Power Comparison */}
      {data.purchasingPower && (
        <div className="card">
          <div className="card-header">1 BTC의 구매력 변화</div>
          <div className="grid-2">
            <div
              style={{
                background: "var(--bg-secondary)",
                padding: isMobile ? "12px" : "16px",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  marginBottom: 8,
                }}
              >
                2015 — 1 BTC = ${data.purchasingPower.year2015.btcPrice}
              </div>
              {data.purchasingPower.year2015.items.map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "4px 0",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  · {item}
                </div>
              ))}
            </div>
            <div
              style={{
                background: "var(--bg-secondary)",
                padding: isMobile ? "12px" : "16px",
                borderRadius: 8,
                border: "1px solid var(--bitcoin-orange)",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--bitcoin-orange)",
                  marginBottom: 8,
                }}
              >
                2025 — 1 BTC = $
                {data.purchasingPower.year2025.btcPrice.toLocaleString()}
              </div>
              {data.purchasingPower.year2025.items.map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "4px 0",
                    fontSize: "0.8rem",
                    color: "var(--text-primary)",
                  }}
                >
                  · {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Austrian Economics */}
      <div className="card">
        <div className="card-header">Austrian Economics & Bitcoin</div>
        <div className="quote-box">
          &quot;정부에게 화폐를 맡기면 그들은 반드시 남용할 것이다&quot; — Friedrich
          Hayek, 『화폐의 탈국유화』 (1976)
        </div>
        <div
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            lineHeight: 1.8,
            marginTop: 12,
          }}
        >
          오스트리아 학파 경제학자들은 100년 전부터 예언했습니다 — 중앙은행의
          화폐 발행 독점은 필연적으로 인플레이션과 경기 사이클의 왜곡을
          초래한다고. 비트코인은 그 대안입니다. 누구도 통제할 수 없는, 수학으로
          보장된, 2,100만 개 고정 공급의 화폐.
        </div>
        <div className="quote-box">
          &quot;인류 역사상 모든 법정화폐는 결국 0으로 수렴했다&quot;
        </div>
      </div>
    </div>
  );
}
