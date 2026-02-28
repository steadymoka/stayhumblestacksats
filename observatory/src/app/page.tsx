"use client";

import { useState } from "react";
import DecentralizationIndex from "@/components/DecentralizationIndex";
import SatoshiWallets from "@/components/SatoshiWallets";
import WhaleObservatory from "@/components/WhaleObservatory";
import SoundMoneyIndex from "@/components/SoundMoneyIndex";
import BitcoinVsNations from "@/components/BitcoinVsNations";

const SECTIONS = [
  { id: "decentralization", label: "Decentralization", icon: "01" },
  { id: "satoshi", label: "Satoshi's Wallets", icon: "02" },
  { id: "whales", label: "Whale Observatory", icon: "03" },
  { id: "soundmoney", label: "Sound Money", icon: "04" },
  { id: "nations", label: "BTC vs Nations", icon: "05" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionId>("decentralization");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <header
        style={{
          padding: "12px clamp(12px, 3vw, 24px)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--bg-secondary)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <span
            style={{
              fontSize: "clamp(1rem, 4vw, 1.4rem)",
              fontWeight: 800,
              color: "var(--bitcoin-orange)",
              flexShrink: 0,
            }}
          >
            {"{"}*{"}"}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "clamp(0.75rem, 2.5vw, 0.95rem)" }}>
              The Bitcoin Observatory
            </div>
            <div
              style={{
                fontSize: "0.6rem",
                color: "var(--text-secondary)",
                letterSpacing: "0.1em",
              }}
            >
              DON&apos;T TRUST, VERIFY
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: "0.65rem",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span
            className="pulse-dot"
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--green)",
            }}
          />
          LIVE
        </div>
      </header>

      {/* Navigation — scrollable on mobile */}
      <nav
        style={{
          padding: "8px clamp(8px, 2vw, 24px)",
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          background: "var(--bg-primary)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 49,
          zIndex: 99,
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`nav-item ${activeSection === section.id ? "active" : ""}`}
            style={{
              border: activeSection === section.id ? undefined : "1px solid transparent",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <span style={{ opacity: 0.5, marginRight: 4 }}>
              {section.icon}
            </span>
            {section.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main
        style={{
          flex: 1,
          padding: "clamp(10px, 3vw, 24px)",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {activeSection === "decentralization" && <DecentralizationIndex />}
        {activeSection === "satoshi" && <SatoshiWallets />}
        {activeSection === "whales" && <WhaleObservatory />}
        {activeSection === "soundmoney" && <SoundMoneyIndex />}
        {activeSection === "nations" && <BitcoinVsNations />}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "16px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          fontSize: "0.7rem",
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ marginBottom: 6 }}>
          <span className="bitcoin-orange">Stay Humble, Stack Sats</span>
        </div>
        <div>Open Source · Bitnodes, mempool.space, CoinGecko</div>
        <div style={{ marginTop: 4 }}>
          &quot;Don&apos;t trust, verify&quot; — Run your own node.
        </div>
      </footer>
    </div>
  );
}
