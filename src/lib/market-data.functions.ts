import { createServerFn } from "@tanstack/react-start";

export type AssetType = "Stock" | "ETF";

export type AssetPerformance = {
  rank: number;
  symbol: string;
  name: string;
  type: AssetType;
  sector: string;
  currency: string;
  priceNow: number;
  priceStart: number;
  performance: number;
  sparkline: number[];
  marketCap: number | null;
  volume: number | null;
};

export type MarketDataResponse = {
  status: "ok" | "error";
  source: string;
  error?: string;
  generatedAt: string;
  monthStart: string;
  monthStartLabel: string;
  rangeLabel: string;
  trackedCount: number;
  assets: AssetPerformance[];
  stats: {
    best: number | null;
    worst: number | null;
    average: number | null;
  };
};

type SeedAsset = {
  symbol: string;
  name: string;
  type: AssetType;
  sector: string;
};

type CandidateAsset = SeedAsset & {
  marketCap?: number | null;
  volume?: number | null;
};

type YahooSparkItem = {
  symbol?: string;
  currency?: string;
  close?: Array<number | null>;
  timestamp?: number[];
  fulldayPrice?: number;
};

type YahooScreenerQuote = {
  symbol?: string;
  shortName?: string;
  longName?: string;
  quoteType?: string;
  typeDisp?: string;
  marketCap?: number;
  regularMarketVolume?: number;
  averageDailyVolume3Month?: number;
};

type CacheRecord = {
  storedAt: number;
  payload: MarketDataResponse;
};

const CACHE_TTL_MS = 1000 * 60 * 5;
let cache: CacheRecord | undefined;

const SEED_ASSETS: SeedAsset[] = [
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", type: "Stock", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "Stock", sector: "Technology" },
  { symbol: "AVGO", name: "Broadcom Inc.", type: "Stock", sector: "Technology" },
  { symbol: "ORCL", name: "Oracle Corporation", type: "Stock", sector: "Technology" },
  { symbol: "AMD", name: "Advanced Micro Devices, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "INTC", name: "Intel Corporation", type: "Stock", sector: "Technology" },
  { symbol: "QCOM", name: "QUALCOMM Incorporated", type: "Stock", sector: "Technology" },
  { symbol: "CRM", name: "Salesforce, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "ADBE", name: "Adobe Inc.", type: "Stock", sector: "Technology" },
  { symbol: "NOW", name: "ServiceNow, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "SHOP", name: "Shopify Inc.", type: "Stock", sector: "Technology" },
  { symbol: "SNOW", name: "Snowflake Inc.", type: "Stock", sector: "Technology" },
  { symbol: "PANW", name: "Palo Alto Networks, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "CRWD", name: "CrowdStrike Holdings, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "NET", name: "Cloudflare, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "PLTR", name: "Palantir Technologies Inc.", type: "Stock", sector: "Technology" },
  { symbol: "DDOG", name: "Datadog, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "MDB", name: "MongoDB, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "TEAM", name: "Atlassian Corporation", type: "Stock", sector: "Technology" },
  { symbol: "ANET", name: "Arista Networks, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "MU", name: "Micron Technology, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "ARM", name: "Arm Holdings plc", type: "Stock", sector: "Technology" },
  { symbol: "SMCI", name: "Super Micro Computer, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "DELL", name: "Dell Technologies Inc.", type: "Stock", sector: "Technology" },
  { symbol: "HPQ", name: "HP Inc.", type: "Stock", sector: "Technology" },
  { symbol: "TXN", name: "Texas Instruments Incorporated", type: "Stock", sector: "Technology" },
  { symbol: "LRCX", name: "Lam Research Corporation", type: "Stock", sector: "Technology" },
  { symbol: "AMAT", name: "Applied Materials, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "KLAC", name: "KLA Corporation", type: "Stock", sector: "Technology" },
  { symbol: "ASML", name: "ASML Holding N.V.", type: "Stock", sector: "Technology" },
  { symbol: "TSM", name: "Taiwan Semiconductor Manufacturing Company", type: "Stock", sector: "Technology" },
  { symbol: "SAP", name: "SAP SE", type: "Stock", sector: "Technology" },
  { symbol: "INTU", name: "Intuit Inc.", type: "Stock", sector: "Technology" },
  { symbol: "ADP", name: "Automatic Data Processing, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "UBER", name: "Uber Technologies, Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "ABNB", name: "Airbnb, Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "TSLA", name: "Tesla, Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "Stock", sector: "Communications" },
  { symbol: "META", name: "Meta Platforms, Inc.", type: "Stock", sector: "Communications" },
  { symbol: "NFLX", name: "Netflix, Inc.", type: "Stock", sector: "Communications" },
  { symbol: "DIS", name: "The Walt Disney Company", type: "Stock", sector: "Communications" },
  { symbol: "IBM", name: "International Business Machines Corporation", type: "Stock", sector: "Technology" },
  { symbol: "CSCO", name: "Cisco Systems, Inc.", type: "Stock", sector: "Technology" },
  { symbol: "LLY", name: "Eli Lilly and Company", type: "Stock", sector: "Healthcare" },
  { symbol: "NVO", name: "Novo Nordisk A/S", type: "Stock", sector: "Healthcare" },
  { symbol: "UNH", name: "UnitedHealth Group Incorporated", type: "Stock", sector: "Healthcare" },
  { symbol: "JNJ", name: "Johnson & Johnson", type: "Stock", sector: "Healthcare" },
  { symbol: "ABBV", name: "AbbVie Inc.", type: "Stock", sector: "Healthcare" },
  { symbol: "MRK", name: "Merck & Co., Inc.", type: "Stock", sector: "Healthcare" },
  { symbol: "TMO", name: "Thermo Fisher Scientific Inc.", type: "Stock", sector: "Healthcare" },
  { symbol: "ABT", name: "Abbott Laboratories", type: "Stock", sector: "Healthcare" },
  { symbol: "ISRG", name: "Intuitive Surgical, Inc.", type: "Stock", sector: "Healthcare" },
  { symbol: "BSX", name: "Boston Scientific Corporation", type: "Stock", sector: "Healthcare" },
  { symbol: "SYK", name: "Stryker Corporation", type: "Stock", sector: "Healthcare" },
  { symbol: "GILD", name: "Gilead Sciences, Inc.", type: "Stock", sector: "Healthcare" },
  { symbol: "REGN", name: "Regeneron Pharmaceuticals, Inc.", type: "Stock", sector: "Healthcare" },
  { symbol: "VRTX", name: "Vertex Pharmaceuticals Incorporated", type: "Stock", sector: "Healthcare" },
  { symbol: "MRNA", name: "Moderna, Inc.", type: "Stock", sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", type: "Stock", sector: "Healthcare" },
  { symbol: "XOM", name: "Exxon Mobil Corporation", type: "Stock", sector: "Energy" },
  { symbol: "CVX", name: "Chevron Corporation", type: "Stock", sector: "Energy" },
  { symbol: "COP", name: "ConocoPhillips", type: "Stock", sector: "Energy" },
  { symbol: "SLB", name: "Schlumberger Limited", type: "Stock", sector: "Energy" },
  { symbol: "EOG", name: "EOG Resources, Inc.", type: "Stock", sector: "Energy" },
  { symbol: "OXY", name: "Occidental Petroleum Corporation", type: "Stock", sector: "Energy" },
  { symbol: "MPC", name: "Marathon Petroleum Corporation", type: "Stock", sector: "Energy" },
  { symbol: "VLO", name: "Valero Energy Corporation", type: "Stock", sector: "Energy" },
  { symbol: "LNG", name: "Cheniere Energy, Inc.", type: "Stock", sector: "Energy" },
  { symbol: "HAL", name: "Halliburton Company", type: "Stock", sector: "Energy" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", type: "Stock", sector: "Financials" },
  { symbol: "BAC", name: "Bank of America Corporation", type: "Stock", sector: "Financials" },
  { symbol: "WFC", name: "Wells Fargo & Company", type: "Stock", sector: "Financials" },
  { symbol: "GS", name: "The Goldman Sachs Group, Inc.", type: "Stock", sector: "Financials" },
  { symbol: "MS", name: "Morgan Stanley", type: "Stock", sector: "Financials" },
  { symbol: "C", name: "Citigroup Inc.", type: "Stock", sector: "Financials" },
  { symbol: "SCHW", name: "The Charles Schwab Corporation", type: "Stock", sector: "Financials" },
  { symbol: "BLK", name: "BlackRock, Inc.", type: "Stock", sector: "Financials" },
  { symbol: "V", name: "Visa Inc.", type: "Stock", sector: "Financials" },
  { symbol: "MA", name: "Mastercard Incorporated", type: "Stock", sector: "Financials" },
  { symbol: "AXP", name: "American Express Company", type: "Stock", sector: "Financials" },
  { symbol: "COF", name: "Capital One Financial Corporation", type: "Stock", sector: "Financials" },
  { symbol: "PYPL", name: "PayPal Holdings, Inc.", type: "Stock", sector: "Financials" },
  { symbol: "SQ", name: "Block, Inc.", type: "Stock", sector: "Financials" },
  { symbol: "SOFI", name: "SoFi Technologies, Inc.", type: "Stock", sector: "Financials" },
  { symbol: "HOOD", name: "Robinhood Markets, Inc.", type: "Stock", sector: "Financials" },
  { symbol: "COST", name: "Costco Wholesale Corporation", type: "Stock", sector: "Consumer" },
  { symbol: "WMT", name: "Walmart Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "HD", name: "The Home Depot, Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "LOW", name: "Lowe's Companies, Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "MCD", name: "McDonald's Corporation", type: "Stock", sector: "Consumer" },
  { symbol: "SBUX", name: "Starbucks Corporation", type: "Stock", sector: "Consumer" },
  { symbol: "NKE", name: "NIKE, Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "LULU", name: "Lululemon Athletica Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "TGT", name: "Target Corporation", type: "Stock", sector: "Consumer" },
  { symbol: "TJX", name: "The TJX Companies, Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "PG", name: "The Procter & Gamble Company", type: "Stock", sector: "Consumer" },
  { symbol: "KO", name: "The Coca-Cola Company", type: "Stock", sector: "Consumer" },
  { symbol: "PEP", name: "PepsiCo, Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "PM", name: "Philip Morris International Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "MO", name: "Altria Group, Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "CMG", name: "Chipotle Mexican Grill, Inc.", type: "Stock", sector: "Consumer" },
  { symbol: "GE", name: "GE Aerospace", type: "Stock", sector: "Industrials" },
  { symbol: "RTX", name: "RTX Corporation", type: "Stock", sector: "Industrials" },
  { symbol: "LMT", name: "Lockheed Martin Corporation", type: "Stock", sector: "Industrials" },
  { symbol: "BA", name: "The Boeing Company", type: "Stock", sector: "Industrials" },
  { symbol: "CAT", name: "Caterpillar Inc.", type: "Stock", sector: "Industrials" },
  { symbol: "DE", name: "Deere & Company", type: "Stock", sector: "Industrials" },
  { symbol: "HON", name: "Honeywell International Inc.", type: "Stock", sector: "Industrials" },
  { symbol: "ETN", name: "Eaton Corporation plc", type: "Stock", sector: "Industrials" },
  { symbol: "URI", name: "United Rentals, Inc.", type: "Stock", sector: "Industrials" },
  { symbol: "FCX", name: "Freeport-McMoRan Inc.", type: "Stock", sector: "Materials" },
  { symbol: "NEM", name: "Newmont Corporation", type: "Stock", sector: "Materials" },
  { symbol: "LIN", name: "Linde plc", type: "Stock", sector: "Materials" },
  { symbol: "SHW", name: "The Sherwin-Williams Company", type: "Stock", sector: "Materials" },
  { symbol: "APD", name: "Air Products and Chemicals, Inc.", type: "Stock", sector: "Materials" },
  { symbol: "NUE", name: "Nucor Corporation", type: "Stock", sector: "Materials" },
  { symbol: "NEE", name: "NextEra Energy, Inc.", type: "Stock", sector: "Utilities" },
  { symbol: "SO", name: "The Southern Company", type: "Stock", sector: "Utilities" },
  { symbol: "DUK", name: "Duke Energy Corporation", type: "Stock", sector: "Utilities" },
  { symbol: "CEG", name: "Constellation Energy Corporation", type: "Stock", sector: "Utilities" },
  { symbol: "VZ", name: "Verizon Communications Inc.", type: "Stock", sector: "Communications" },
  { symbol: "T", name: "AT&T Inc.", type: "Stock", sector: "Communications" },
  { symbol: "TMUS", name: "T-Mobile US, Inc.", type: "Stock", sector: "Communications" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", type: "ETF", sector: "ETF Broad" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", type: "ETF", sector: "ETF Technology" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", type: "ETF", sector: "ETF Broad" },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial Average ETF Trust", type: "ETF", sector: "ETF Broad" },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", type: "ETF", sector: "ETF Broad" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", type: "ETF", sector: "ETF Broad" },
  { symbol: "IVV", name: "iShares Core S&P 500 ETF", type: "ETF", sector: "ETF Broad" },
  { symbol: "SCHD", name: "Schwab U.S. Dividend Equity ETF", type: "ETF", sector: "ETF Broad" },
  { symbol: "XLK", name: "Technology Select Sector SPDR Fund", type: "ETF", sector: "ETF Technology" },
  { symbol: "XLF", name: "Financial Select Sector SPDR Fund", type: "ETF", sector: "ETF Financials" },
  { symbol: "XLE", name: "Energy Select Sector SPDR Fund", type: "ETF", sector: "ETF Energy" },
  { symbol: "XLI", name: "Industrial Select Sector SPDR Fund", type: "ETF", sector: "ETF Industrials" },
  { symbol: "XLV", name: "Health Care Select Sector SPDR Fund", type: "ETF", sector: "ETF Healthcare" },
  { symbol: "XLY", name: "Consumer Discretionary Select Sector SPDR Fund", type: "ETF", sector: "ETF Consumer" },
  { symbol: "XLP", name: "Consumer Staples Select Sector SPDR Fund", type: "ETF", sector: "ETF Consumer" },
  { symbol: "XLU", name: "Utilities Select Sector SPDR Fund", type: "ETF", sector: "ETF Utilities" },
  { symbol: "XLB", name: "Materials Select Sector SPDR Fund", type: "ETF", sector: "ETF Materials" },
  { symbol: "XLRE", name: "Real Estate Select Sector SPDR Fund", type: "ETF", sector: "ETF Real Estate" },
  { symbol: "XLC", name: "Communication Services Select Sector SPDR Fund", type: "ETF", sector: "ETF Communications" },
  { symbol: "SMH", name: "VanEck Semiconductor ETF", type: "ETF", sector: "ETF Technology" },
  { symbol: "SOXX", name: "iShares Semiconductor ETF", type: "ETF", sector: "ETF Technology" },
  { symbol: "ARKK", name: "ARK Innovation ETF", type: "ETF", sector: "ETF Thematic" },
  { symbol: "ICLN", name: "iShares Global Clean Energy ETF", type: "ETF", sector: "ETF Thematic" },
  { symbol: "TAN", name: "Invesco Solar ETF", type: "ETF", sector: "ETF Thematic" },
  { symbol: "XBI", name: "SPDR S&P Biotech ETF", type: "ETF", sector: "ETF Healthcare" },
  { symbol: "KRE", name: "SPDR S&P Regional Banking ETF", type: "ETF", sector: "ETF Financials" },
  { symbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF", type: "ETF", sector: "ETF Fixed Income" },
  { symbol: "HYG", name: "iShares iBoxx High Yield Corporate Bond ETF", type: "ETF", sector: "ETF Fixed Income" },
  { symbol: "LQD", name: "iShares iBoxx Investment Grade Corporate Bond ETF", type: "ETF", sector: "ETF Fixed Income" },
  { symbol: "GLD", name: "SPDR Gold Shares", type: "ETF", sector: "ETF Commodities" },
  { symbol: "SLV", name: "iShares Silver Trust", type: "ETF", sector: "ETF Commodities" },
  { symbol: "USO", name: "United States Oil Fund", type: "ETF", sector: "ETF Commodities" },
  { symbol: "UNG", name: "United States Natural Gas Fund", type: "ETF", sector: "ETF Commodities" },
  { symbol: "EEM", name: "iShares MSCI Emerging Markets ETF", type: "ETF", sector: "ETF International" },
  { symbol: "EFA", name: "iShares MSCI EAFE ETF", type: "ETF", sector: "ETF International" },
  { symbol: "FXI", name: "iShares China Large-Cap ETF", type: "ETF", sector: "ETF International" },
  { symbol: "EWJ", name: "iShares MSCI Japan ETF", type: "ETF", sector: "ETF International" },
  { symbol: "EWZ", name: "iShares MSCI Brazil ETF", type: "ETF", sector: "ETF International" },
  { symbol: "TQQQ", name: "ProShares UltraPro QQQ", type: "ETF", sector: "ETF Technology" },
  { symbol: "SOXL", name: "Direxion Daily Semiconductor Bull 3X Shares", type: "ETF", sector: "ETF Technology" },
];

const SCREENER_IDS = [
  "day_gainers",
  "most_actives",
  "portfolio_anchors",
  "aggressive_small_caps",
  "growth_technology_stocks",
  "undervalued_growth_stocks",
];

function monthStartUtc(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function formatMonthStartLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", timeZone: "UTC" });
}

function formatRangeLabel(start: Date, end: Date) {
  const startLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  });
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${startLabel} — ${endLabel}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function inferAssetType(quote: YahooScreenerQuote): AssetType {
  const quoteType = `${quote.quoteType ?? ""} ${quote.typeDisp ?? ""}`.toUpperCase();
  return quoteType.includes("ETF") ? "ETF" : "Stock";
}

function seededCandidateMap() {
  const map = new Map<string, CandidateAsset>();
  for (const asset of SEED_ASSETS) {
    map.set(asset.symbol, asset);
  }
  return map;
}

async function fetchScreenerCandidates() {
  const results = await Promise.allSettled(
    SCREENER_IDS.map(async (id) => {
      const url = `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&scrIds=${id}&count=250`;
      const response = await fetch(url, { headers: { accept: "application/json" } });
      if (!response.ok) return [] as YahooScreenerQuote[];
      const payload = (await response.json()) as {
        finance?: { result?: Array<{ quotes?: YahooScreenerQuote[] }> };
      };
      return payload.finance?.result?.[0]?.quotes ?? [];
    }),
  );

  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

async function getCandidates() {
  const map = seededCandidateMap();
  const screenerQuotes = await fetchScreenerCandidates();

  for (const quote of screenerQuotes) {
    const symbol = quote.symbol?.trim().toUpperCase();
    if (!symbol) continue;

    const existing = map.get(symbol);
    map.set(symbol, {
      symbol,
      name: quote.longName ?? quote.shortName ?? existing?.name ?? symbol,
      type: existing?.type ?? inferAssetType(quote),
      sector: existing?.sector ?? "Other",
      marketCap: isFiniteNumber(quote.marketCap) ? quote.marketCap : existing?.marketCap ?? null,
      volume: isFiniteNumber(quote.regularMarketVolume)
        ? quote.regularMarketVolume
        : isFiniteNumber(quote.averageDailyVolume3Month)
          ? quote.averageDailyVolume3Month
          : existing?.volume ?? null,
    });
  }

  return Array.from(map.values()).slice(0, 260);
}

async function fetchYahooSpark(symbols: string[]) {
  const payloads = await Promise.all(
    chunk(symbols, 20).map(async (symbolChunk) => {
      const params = new URLSearchParams({
        symbols: symbolChunk.join(","),
        range: "1mo",
        interval: "1d",
      });
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/spark?${params}`, {
        headers: { accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error("Yahoo Finance did not return market data.");
      }
      return (await response.json()) as Record<string, YahooSparkItem>;
    }),
  );

  return Object.assign({}, ...payloads) as Record<string, YahooSparkItem>;
}

function buildAssetsFromSpark(
  candidates: CandidateAsset[],
  sparkPayload: Record<string, YahooSparkItem>,
  startDate: Date,
) {
  const startTimestamp = startDate.getTime() / 1000;

  return candidates
    .map((candidate) => {
      const spark = sparkPayload[candidate.symbol];
      const timestamps = spark?.timestamp ?? [];
      const closes = spark?.close ?? [];
      const series = timestamps
        .map((timestamp, index) => ({ timestamp, close: closes[index] }))
        .filter((point): point is { timestamp: number; close: number } =>
          isFiniteNumber(point.close),
        );
      const monthSeries = series.filter((point) => point.timestamp >= startTimestamp);
      const sourceSeries = monthSeries.length >= 2 ? monthSeries : series.slice(-22);
      const first = sourceSeries[0];
      const last = sourceSeries[sourceSeries.length - 1];
      if (!first || !last || first.close <= 0) return null;

      const priceNow = isFiniteNumber(spark?.fulldayPrice) ? spark.fulldayPrice : last.close;
      const priceStart = first.close;
      const performance = ((priceNow - priceStart) / priceStart) * 100;

      return {
        rank: 0,
        symbol: candidate.symbol,
        name: candidate.name,
        type: candidate.type,
        sector: candidate.sector,
        currency: spark?.currency ?? "USD",
        priceNow,
        priceStart,
        performance,
        sparkline: sourceSeries.map((point) => Number(point.close.toFixed(4))),
        marketCap: candidate.marketCap ?? null,
        volume: candidate.volume ?? null,
      } satisfies AssetPerformance;
    })
    .filter((asset): asset is AssetPerformance => asset !== null)
    .sort((a, b) => b.performance - a.performance)
    .slice(0, TOP_LIMIT)
    .map((asset, index) => ({ ...asset, rank: index + 1 }));
}

async function loadMarketData(): Promise<MarketDataResponse> {
  const now = new Date();
  const startDate = monthStartUtc(now);
  const generatedAt = now.toISOString();

  try {
    const candidates = await getCandidates();
    const sparkPayload = await fetchYahooSpark(candidates.map((candidate) => candidate.symbol));
    const assets = buildAssetsFromSpark(candidates, sparkPayload, startDate);
    const averageTop100 = assets.length
      ? assets.reduce((total, asset) => total + asset.performance, 0) / assets.length
      : null;

    return {
      status: "ok",
      source: "Yahoo Finance public chart API",
      generatedAt,
      monthStart: startDate.toISOString(),
      monthStartLabel: formatMonthStartLabel(startDate),
      rangeLabel: formatRangeLabel(startDate, now),
      trackedCount: assets.length,
      assets,
      stats: {
        best: assets[0]?.performance ?? null,
        worstTop100: assets[assets.length - 1]?.performance ?? null,
        averageTop100,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Market data is temporarily unavailable.";
    return {
      status: "error",
      source: "Yahoo Finance public chart API",
      error: message,
      generatedAt,
      monthStart: startDate.toISOString(),
      monthStartLabel: formatMonthStartLabel(startDate),
      rangeLabel: formatRangeLabel(startDate, now),
      trackedCount: 0,
      assets: [],
      stats: { best: null, worstTop100: null, averageTop100: null },
    };
  }
}

export const getTopPerformers = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (cache && now - cache.storedAt < CACHE_TTL_MS) {
    return cache.payload;
  }

  const payload = await loadMarketData();
  if (payload.status === "ok" && payload.assets.length > 0) {
    cache = { storedAt: now, payload };
  }
  return payload;
});