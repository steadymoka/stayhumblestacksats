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
import { fetchWhaleData } from "@/lib/api";
import { useIsMobile } from "@/lib/useIsMobile";

type WhaleData = Awaited<ReturnType<typeof fetchWhaleData>>;

const TYPE_BADGE: Record<string, { className: string; label: string }> = {
  exchange: { className: "badge badge-exchange", label: "Exchange" },
  government: { className: "badge badge-gov", label: "Government" },
  institution: { className: "badge badge-institution", label: "Institution" },
  unknown: { className: "badge badge-unknown", label: "Unknown" },
};

export default function WhaleObservatory() {
  const [data, setData] = useState<WhaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchWhaleData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">Whale Observatory</div>
        <div style={{ color: "var(--text-secondary)", padding: "40px 0", textAlign: "center" }}>
          Scanning whale wallets...
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div className="card glow-orange">
        <div className="card-header">Section 3 — Whale Observatory</div>
        <div className="quote-box">
          &quot;투명한 원장 위에서 부의 흐름은 숨길 수 없다&quot;
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid-2">
        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Gini Coefficient</div>
          <div className="stat-big red">{data.giniCoefficient.toFixed(2)}</div>
          <div className="stat-label">
            1.0에 가까울수록 부가 집중됨 (전 세계 ~0.89)
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Top Holders (&gt; 1,000 BTC)</div>
          <div className="stat-big bitcoin-gold">
            {data.topHoldersPercentage}%
          </div>
          <div className="stat-label">전체 공급량 중 상위 보유자 비중</div>
        </div>
      </div>

      {/* Wealth Distribution Chart */}
      <div className="card">
        <div className="card-header">Bitcoin Wealth Distribution</div>
        <div style={{ width: "100%", height: isMobile ? 280 : 320 }}>
          <ResponsiveContainer>
            <BarChart
              data={data.wealthDistribution}
              layout="vertical"
              margin={{ left: isMobile ? 10 : 130, right: 10 }}
            >
              <XAxis
                type="number"
                stroke="#8888a0"
                fontSize={11}
                tickFormatter={(v) =>
                  v >= 1000000
                    ? `${(v / 1000000).toFixed(1)}M`
                    : v >= 1000
                      ? `${(v / 1000).toFixed(0)}K`
                      : v.toString()
                }
              />
              <YAxis
                dataKey="range"
                type="category"
                stroke="#8888a0"
                fontSize={isMobile ? 9 : 11}
                width={isMobile ? 90 : 120}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid #2a2a3e",
                  borderRadius: 8,
                  color: "#e0e0e8",
                  fontSize: 12,
                }}
                formatter={(value, name) => [
                  name === "addresses"
                    ? Number(value).toLocaleString() + " addresses"
                    : Number(value).toLocaleString() + " BTC",
                  name === "addresses" ? "Addresses" : "Total BTC",
                ]}
              />
              <Bar dataKey="totalBtc" name="Total BTC" radius={[0, 4, 4, 0]}>
                {data.wealthDistribution.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === 0
                        ? "#ff4757"
                        : i === 1
                          ? "#ff8c42"
                          : `rgba(247, 147, 26, ${0.7 - i * 0.08})`
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Labeled Addresses */}
      <div className="card">
        <div className="card-header">Labeled Whale Addresses</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.labeledAddresses.map((addr) => {
            const badge = TYPE_BADGE[addr.type] || TYPE_BADGE.unknown;
            const movement = data.recentMovements.find(
              (m) => m.address === addr.address
            );
            return (
              <div className="whale-row" key={addr.address}>
                <span className={badge.className}>{badge.label}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                    {addr.label}
                  </div>
                  <code
                    style={{
                      fontSize: isMobile ? "0.6rem" : "0.7rem",
                      color: "var(--text-secondary)",
                      wordBreak: "break-all",
                    }}
                  >
                    {isMobile
                      ? `${addr.address.slice(0, 14)}...${addr.address.slice(-6)}`
                      : `${addr.address.slice(0, 20)}...${addr.address.slice(-8)}`}
                  </code>
                </div>
                {movement && (
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="bitcoin-orange" style={{ fontSize: isMobile ? "0.75rem" : "0.85rem" }}>
                      {movement.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} BTC
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Philosophy */}
      <div className="card">
        <div className="card-header">Open Label Initiative</div>
        <div
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
          }}
        >
          비트코인의 블록체인은 완전히 투명하지만, 주소 뒤에 누가 있는지는
          알 수 없습니다. <span className="bitcoin-orange">오픈 라벨 이니셔티브</span>는
          커뮤니티가 함께 주요 지갑을 식별하고 라벨링하여,
          부의 흐름을 더 투명하게 만드는 것을 목표로 합니다.
        </div>
        <div className="quote-box">
          전통 금융에서는 부의 흐름이 숨겨져 있다. 비트코인에서는 모두가 볼 수
          있다. 이것이 투명성의 힘이다.
        </div>
      </div>
    </div>
  );
}
