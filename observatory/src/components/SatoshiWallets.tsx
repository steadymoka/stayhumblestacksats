"use client";

import { useEffect, useState } from "react";
import { fetchSatoshiData } from "@/lib/api";

type SatoshiData = Awaited<ReturnType<typeof fetchSatoshiData>>;

export default function SatoshiWallets() {
  const [data, setData] = useState<SatoshiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSatoshiData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">Satoshi&apos;s Wallets</div>
        <div style={{ color: "var(--text-secondary)", padding: "40px 0", textAlign: "center" }}>
          Scanning the blockchain...
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div className="card glow-orange">
        <div className="card-header">Section 2 — Satoshi&apos;s Wallets</div>
        <div className="quote-box">
          &quot;창시자가 떠난 프로토콜만이 진정으로 탈중앙화된 것이다&quot;
        </div>
      </div>

      {/* Main Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Estimated Holdings</div>
          <div className="stat-big bitcoin-gold">
            ~{(data.estimatedTotalBtc / 1000000).toFixed(1)}M BTC
          </div>
          <div className="stat-label">
            전체 공급량의 {data.percentOfSupply}%
          </div>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Days Since Last Activity</div>
          <div className="stat-big green">
            {data.daysSinceLastActive.toLocaleString()}+
          </div>
          <div className="stat-label">
            마지막 활동: {data.lastActiveDate}
          </div>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <div className="stat-label">Status</div>
          <div style={{ marginTop: 8 }}>
            <span
              className="pulse-dot"
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--green)",
                marginRight: 8,
              }}
            />
            <span className="stat-big green" style={{ fontSize: "1.4rem" }}>
              DORMANT
            </span>
          </div>
          <div className="stat-label">사토시는 여전히 침묵하고 있다</div>
        </div>
      </div>

      {/* Patoshi Pattern Info */}
      <div className="card">
        <div className="card-header">Patoshi Pattern</div>
        <div style={{ fontSize: "0.85rem", lineHeight: 1.8 }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>
            2013년 Sergio Demian Lerner가 발견한 &quot;Patoshi Pattern&quot;에 의하면, 비트코인 초기
            블록(1~약 22,000)에서 특정 채굴 패턴이 관찰됩니다. 이 패턴의 주인으로
            추정되는 사토시 나카모토는 약 <span className="bitcoin-orange">110만 BTC</span>를 채굴한 것으로 추정됩니다.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "var(--bg-secondary)",
                padding: "12px 16px",
                borderRadius: 8,
              }}
            >
              <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                Patoshi Blocks
              </div>
              <div style={{ fontSize: "1.2rem", color: "var(--bitcoin-orange)" }}>
                ~{data.totalPatoshiBlocks.toLocaleString()}
              </div>
            </div>
            <div
              style={{
                background: "var(--bg-secondary)",
                padding: "12px 16px",
                borderRadius: 8,
              }}
            >
              <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                Known Coinbase Addresses
              </div>
              <div style={{ fontSize: "1.2rem", color: "var(--bitcoin-orange)" }}>
                {data.knownAddresses}+
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address List */}
      <div className="card">
        <div className="card-header">Known Satoshi Addresses (Sample)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {data.wallets.map((wallet) => (
            <div
              key={wallet.address}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                background: "var(--bg-secondary)",
                borderRadius: 8,
                fontSize: "0.8rem",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <code style={{ color: "var(--text-primary)", fontSize: "0.75rem" }}>
                  {wallet.address.slice(0, 16)}...{wallet.address.slice(-8)}
                </code>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.7rem" }}>
                  Last active: {wallet.lastActive} · Tx: {wallet.txCount}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="bitcoin-orange">{wallet.balance.toFixed(2)} BTC</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Philosophy */}
      <div className="card">
        <div className="card-header">Why This Matters</div>
        <div className="quote-box">
          사토시 나카모토는 110만 BTC를 보유하고 있음에도 단 한 번도 움직이지
          않았다. 이것은 단순한 행위가 아니라 하나의 선언이다 — 비트코인은
          누군가의 이익을 위해 만들어진 것이 아니라, 인류의 화폐 주권을 위해
          만들어졌다는 것.
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            marginTop: 12,
            lineHeight: 1.7,
          }}
        >
          만약 사토시의 코인이 움직인다면, 그것은 비트코인 역사상 가장 큰
          이벤트가 될 것입니다. 이 섹션은 그 순간을 실시간으로 감지합니다.
        </div>
      </div>
    </div>
  );
}
