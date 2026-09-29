import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type IndexQuote = { symbol: string; label: string; price: number; change: number };
export type Candle = { t: number; o: number; h: number; l: number; c: number; v: number };

const INDICES = [
  { symbol: "^FCHI", label: "CAC 40" },
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^IXIC", label: "NASDAQ" },
  { symbol: "BTC-USD", label: "BTC" },
];

const RANGES = {
  "1D": { range: "1d", interval: "5m" },
  "1W": { range: "5d", interval: "30m" },
  "1M": { range: "1mo", interval: "1d" },
} as const;

type ChartJson = {
  chart?: {
    result?: Array<{
      meta?: { regularMarketPrice?: number; chartPreviousClose?: number; previousClose?: number };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
    }>;
  };
};

async function fetchChart(symbol: string, range: string, interval: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Yahoo ${res.status}`);
  const json = (await res.json()) as ChartJson;
  const r = json.chart?.result?.[0];
  if (!r) throw new Error("No chart data");
  return r;
}

export const getIndices = createServerFn({ method: "GET" }).handler(async () => {
  const results = await Promise.all(
    INDICES.map(async (idx): Promise<IndexQuote | null> => {
      try {
        const r = await fetchChart(idx.symbol, "1d", "15m");
        const price = r.meta?.regularMarketPrice ?? 0;
        const prev = r.meta?.chartPreviousClose ?? r.meta?.previousClose ?? price;
        return { symbol: idx.symbol, label: idx.label, price, change: prev ? ((price - prev) / prev) * 100 : 0 };
      } catch {
        return null;
      }
    }),
  );
  return results.filter((x): x is IndexQuote => x !== null);
});

export const getCandles = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ symbol: z.string().min(1).max(20), tf: z.enum(["1D", "1W", "1M"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { range, interval } = RANGES[data.tf];
    const r = await fetchChart(data.symbol, range, interval);
    const q = r.indicators?.quote?.[0] ?? {};
    const ts = r.timestamp ?? [];
    const candles: Candle[] = [];
    ts.forEach((t, i) => {
      const o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i];
      if (o == null || h == null || l == null || c == null) return;
      candles.push({ t, o, h, l, c, v: q.volume?.[i] ?? 0 });
    });
    return candles.slice(-80);
  });
