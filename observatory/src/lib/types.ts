export interface NodeStats {
  totalNodes: number;
  nodesByCountry: { country: string; code: string; count: number }[];
  clientVersions: { name: string; count: number }[];
}

export interface MiningPool {
  name: string;
  hashrate: number;
  share: number;
}

export interface SatoshiWallet {
  address: string;
  balance: number;
  lastActive: string;
  txCount: number;
}

export interface WhaleEntry {
  address: string;
  balance: number;
  label: string;
  type: "exchange" | "government" | "institution" | "unknown";
  lastTx: string;
}

export interface WealthDistribution {
  range: string;
  addresses: number;
  totalBtc: number;
}

export interface CurrencyDevaluation {
  currency: string;
  country: string;
  flag: string;
  devaluationPercent: number;
  m2GrowthPercent: number;
}

export interface NationComparison {
  name: string;
  type: "country" | "company" | "bitcoin" | "commodity";
  value: number;
  flag?: string;
}

export interface BitcoinPrice {
  usd: number;
  krw: number;
  marketCap: number;
  totalSupply: number;
  blockHeight: number;
}
