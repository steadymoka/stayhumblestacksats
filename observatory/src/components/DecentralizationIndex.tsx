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
import { fetchNodeData } from "@/lib/api";
import { useIsMobile } from "@/lib/useIsMobile";

type NodeData = Awaited<ReturnType<typeof fetchNodeData>>;

export default function DecentralizationIndex() {
  const [data, setData] = useState<NodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchNodeData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card glow-orange">
        <div className="card-header">Decentralization Health</div>
        <div style={{ color: "var(--text-secondary)", padding: "40px 0", textAlign: "center" }}>
          Loading network data...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const poolColors = ["#f7931a", "#ffd700", "#4a9eff", "#00d4aa", "#ff4757", "#8888a0", "#e066ff", "#ff8c42", "#42f5aa", "#4242f5"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div className="card glow-orange">
        <div className="card-header">Section 1 — Decentralization Health</div>
        <div className="quote-box">
          &quot;탈중앙화는 상태가 아니라 끊임없는 노력이다&quot;
        </div>
      </div>

      {/* Node Count + Nakamoto Coefficient */}
      <div className="grid-3">
        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Reachable Full Nodes</div>
          <div className="stat-big bitcoin-orange">
            {data.totalNodes.toLocaleString()}
          </div>
          <div className="stat-label">전 세계에서 비트코인을 검증하는 노드</div>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Nakamoto Coefficient</div>
          <div className="stat-big" style={{ color: data.nakamotoCoefficient <= 3 ? "var(--red)" : data.nakamotoCoefficient <= 5 ? "var(--bitcoin-gold)" : "var(--green)" }}>
            {data.nakamotoCoefficient}
          </div>
          <div className="stat-label">네트워크 장악에 필요한 최소 엔티티 수</div>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Node Countries</div>
          <div className="stat-big green">
            {data.nodesByCountry.length}+
          </div>
          <div className="stat-label">노드가 운영되는 국가 수</div>
        </div>
      </div>

      {/* Node Distribution by Country */}
      <div className="card">
        <div className="card-header">Node Distribution by Country</div>
        <div style={{ width: "100%", height: isMobile ? 250 : 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={data.nodesByCountry.slice(0, 10)}
              layout="vertical"
              margin={{ left: isMobile ? 10 : 100, right: 10 }}
            >
              <XAxis type="number" stroke="#8888a0" fontSize={11} />
              <YAxis
                dataKey="country"
                type="category"
                stroke="#8888a0"
                fontSize={isMobile ? 10 : 12}
                width={isMobile ? 70 : 90}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid #2a2a3e",
                  borderRadius: 8,
                  color: "#e0e0e8",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.nodesByCountry.slice(0, 10).map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === 0 ? "#f7931a" : `rgba(247, 147, 26, ${0.8 - i * 0.07})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mining Pool Distribution */}
      <div className="card">
        <div className="card-header">Mining Pool Hashrate Distribution</div>
        {data.nakamotoCoefficient <= 4 && (
          <div
            style={{
              background: "rgba(255, 71, 87, 0.1)",
              border: "1px solid rgba(255, 71, 87, 0.3)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: "0.75rem",
              marginBottom: 16,
              color: "var(--red)",
            }}
          >
            Warning: 상위 {data.nakamotoCoefficient}개 마이닝 풀이 50% 이상의
            해시파워를 보유하고 있습니다
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {data.miningPools.map((pool, i) => (
            <div key={pool.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: isMobile ? 80 : 120,
                  fontSize: isMobile ? "0.7rem" : "0.8rem",
                  color: "var(--text-secondary)",
                  textAlign: "right",
                  flexShrink: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {pool.name}
              </span>
              <div className="progress-bar" style={{ flex: 1 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${pool.share}%`,
                    background: poolColors[i % poolColors.length],
                  }}
                />
              </div>
              <span
                style={{
                  width: 36,
                  fontSize: "0.75rem",
                  color: "var(--text-primary)",
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {pool.share}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Client Diversity */}
      <div className="card">
        <div className="card-header">Client Implementation Diversity</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {data.clientVersions.map((client) => (
            <div
              key={client.name}
              style={{
                background: "var(--bg-secondary)",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: "0.75rem",
              }}
            >
              <span style={{ color: "var(--bitcoin-orange)" }}>
                {client.name}
              </span>
              <span style={{ color: "var(--text-secondary)", marginLeft: 6 }}>
                {client.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="quote-box" style={{ marginTop: 16 }}>
          모든 풀노드는 동등하다. 각 노드는 독립적으로 모든 트랜잭션과 블록을
          검증한다. 이것이 &quot;Don&apos;t trust, verify&quot;의 의미다.
        </div>
      </div>
    </div>
  );
}
