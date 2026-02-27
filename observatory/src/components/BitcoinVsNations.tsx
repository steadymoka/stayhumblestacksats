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
import { fetchNationsData } from "@/lib/api";

type NationsData = Awaited<ReturnType<typeof fetchNationsData>>;

export default function BitcoinVsNations() {
  const [data, setData] = useState<NationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNationsData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">Bitcoin vs Nations</div>
        <div style={{ color: "var(--text-secondary)", padding: "40px 0", textAlign: "center" }}>
          Comparing Bitcoin to nation states...
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div className="card glow-orange">
        <div className="card-header">Section 5 — Bitcoin vs Nation States</div>
        <div className="quote-box">
          &quot;비트코인은 인류 최초의 국경 없는 화폐 네트워크다&quot;
        </div>
      </div>

      {/* Key Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Market Cap</div>
          <div className="stat-big bitcoin-orange">
            ${(data.btcMarketCap / 1e12).toFixed(2)}T
          </div>
          <div className="stat-label">
            세계 경제 #{data.btcGdpRank} 규모
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Network Hashrate</div>
          <div className="stat-big green">{data.hashrate} EH/s</div>
          <div className="stat-label">
            전 세계 슈퍼컴퓨터 합산의 수천 배
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Daily Security Budget</div>
          <div className="stat-big bitcoin-gold">
            {data.networkSecurityBudget}
          </div>
          <div className="stat-label">채굴자에게 지급되는 일일 보상</div>
        </div>
      </div>

      {/* Asset Rankings */}
      <div className="card">
        <div className="card-header">Global Asset Rankings</div>
        <div style={{ width: "100%", height: 340 }}>
          <ResponsiveContainer>
            <BarChart
              data={data.assetRankings}
              layout="vertical"
              margin={{ left: 120 }}
            >
              <XAxis
                type="number"
                stroke="#8888a0"
                fontSize={12}
                tickFormatter={(v) => `$${v}T`}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#8888a0"
                fontSize={12}
                width={110}
                tick={(props: Record<string, unknown>) => {
                  const x = Number(props.x) || 0;
                  const y = Number(props.y) || 0;
                  const payload = props.payload as { value: string } | undefined;
                  const value = payload?.value || "";
                  const item = data.assetRankings.find(
                    (r) => r.name === value
                  );
                  return (
                    <text
                      x={x}
                      y={y}
                      dy={4}
                      textAnchor="end"
                      fill={
                        item?.type === "bitcoin" ? "#f7931a" : "#8888a0"
                      }
                      fontSize={12}
                      fontWeight={item?.type === "bitcoin" ? 700 : 400}
                    >
                      {item?.flag} {value}
                    </text>
                  );
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid #2a2a3e",
                  borderRadius: 8,
                  color: "#e0e0e8",
                  fontSize: 12,
                }}
                formatter={(value) => [
                  `$${Number(value).toFixed(2)}T`,
                  "Market Cap",
                ]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.assetRankings.map((item, i) => (
                  <Cell
                    key={i}
                    fill={
                      item.type === "bitcoin"
                        ? "#f7931a"
                        : item.type === "commodity"
                          ? "#ffd700"
                          : "#4a9eff"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GDP Comparison */}
      <div className="card">
        <div className="card-header">
          Bitcoin Market Cap vs National GDP
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {data.gdpRankings.slice(0, 12).map((item, i) => {
            const maxVal = data.gdpRankings[0]?.value || 1;
            const width = (item.value / maxVal) * 100;
            const isBtc = item.type === "bitcoin";
            return (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: isBtc ? "8px 0" : "4px 0",
                }}
              >
                <span
                  style={{
                    width: 24,
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    textAlign: "right",
                  }}
                >
                  #{i + 1}
                </span>
                <span
                  style={{
                    width: 130,
                    fontSize: "0.8rem",
                    color: isBtc ? "var(--bitcoin-orange)" : "var(--text-primary)",
                    fontWeight: isBtc ? 700 : 400,
                  }}
                >
                  {item.flag} {item.name}
                </span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${width}%`,
                      background: isBtc
                        ? "linear-gradient(90deg, #f7931a, #ffd700)"
                        : "rgba(74, 158, 255, 0.5)",
                    }}
                  />
                </div>
                <span
                  style={{
                    width: 60,
                    fontSize: "0.8rem",
                    textAlign: "right",
                    color: isBtc ? "var(--bitcoin-orange)" : "var(--text-secondary)",
                  }}
                >
                  ${item.value.toFixed(1)}T
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nation State Adoption */}
      <div className="card">
        <div className="card-header">Nation State Adoption Timeline</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.adoption
            .sort((a, b) => a.year - b.year)
            .map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "12px 16px",
                  background: "var(--bg-secondary)",
                  borderRadius: 8,
                  borderLeft: "3px solid var(--bitcoin-orange)",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>{item.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {item.country}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.type}
                  </div>
                </div>
                <span className="bitcoin-orange" style={{ fontWeight: 700 }}>
                  {item.year}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Philosophy */}
      <div className="card">
        <div className="card-header">Beyond Nation States</div>
        <div
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            lineHeight: 1.8,
          }}
        >
          비트코인은 국가가 아닙니다. 군대도, 국경도, 대통령도 없습니다. 하지만
          비트코인은 전 세계 어느 군대보다 강력한 보안 네트워크를 가지고
          있으며, 국경 없이 전 세계 누구에게나 열려 있고, 어떤 지도자도
          이를 통제할 수 없습니다.
        </div>
        <div className="quote-box">
          비트코인은 국가가 아니라 국가보다 더 큰 무언가다. 인류가 합의한 최초의
          글로벌 화폐 프로토콜이다.
        </div>
        <div className="quote-box">
          &quot;비트코인을 끄려면 인터넷을 꺼야 한다. 인터넷을 끄려면 문명을 꺼야
          한다.&quot;
        </div>
      </div>
    </div>
  );
}
