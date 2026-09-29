import { useState } from "react";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, RefreshCw, Search } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BottomNav, CursorGlow, HeroWallpaper, MarketOverview, Navbar } from "@/components/terminal/Terminal";
import { getTopPerformers, type AssetPerformance } from "@/lib/market-data.functions";

type SearchState = {
  q: string;
  type: "all" | "stocks" | "etfs";
  sector: string;
};

const typeFilters: Array<{ label: string; value: SearchState["type"] }> = [
  { label: "All", value: "all" },
  { label: "Stocks only", value: "stocks" },
  { label: "ETFs only", value: "etfs" },
];

const performersQueryOptions = queryOptions({
  queryKey: ["top-performers-mtd"],
  queryFn: () => getTopPerformers(),
  staleTime: 1000 * 60,
});

export const Route = createFileRoute("/")({
  validateSearch: (search): SearchState => {
    const rawType = search["type"];
    const rawQuery = search["q"];
    const rawSector = search["sector"];
    const type = rawType === "stocks" || rawType === "etfs" ? rawType : "all";
    return {
      q: typeof rawQuery === "string" ? rawQuery : "",
      type,
      sector: typeof rawSector === "string" ? rawSector : "all",
    };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(performersQueryOptions),
  head: () => ({
    meta: [
      { title: "TOP 20 PERFORMERS - MTD | Live Stocks & ETFs" },
      {
        name: "description",
        content:
          "Classement live des 20 actions et ETFs les plus performants depuis le début du mois.",
      },
      { property: "og:title", content: "TOP 20 PERFORMERS - MTD" },
      {
        property: "og:description",
        content:
          "Classement live des 20 actions et ETFs les plus performants depuis le début du mois.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  pendingComponent: LoadingMarketState,
  errorComponent: ({ error }) => <FailureState message={error.message} />,
  notFoundComponent: EmptyMarketState,
  component: Index,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "always",
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function Index() {
  const { data, isFetching } = useSuspenseQuery(performersQueryOptions);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const sectors = ["all", ...Array.from(new Set(data.assets.map((asset) => asset.sector))).sort()];
  const filteredAssets = data.assets.filter((asset) => {
    const term = search.q.trim().toLowerCase();
    const matchesTerm =
      term.length === 0 ||
      asset.symbol.toLowerCase().includes(term) ||
      asset.name.toLowerCase().includes(term);
    const matchesType =
      search.type === "all" ||
      (search.type === "stocks" && asset.type === "Stock") ||
      (search.type === "etfs" && asset.type === "ETF");
    const matchesSector = search.sector === "all" || asset.sector === search.sector;
    return matchesTerm && matchesType && matchesSector;
  });

  // Bypasses the server-side 5 min cache and fetches fresh Yahoo Finance data.
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await getTopPerformers({ data: { force: true } });
      queryClient.setQueryData(performersQueryOptions.queryKey, fresh);
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateSearch = (updates: Partial<SearchState>) => {
    navigate({
      search: (previous) => ({ ...previous, ...updates }),
      replace: true,
    });
  };

  const marqueeItems = [
    `TOP MOVER ${formatPercent(data.stats.best)}`,
    `AVG TOP 20 ${formatPercent(data.stats.average)}`,
    `${data.trackedCount} ASSETS TRACKED`,
    `SINCE ${data.monthStartLabel.toUpperCase()}`,
    data.source.toUpperCase(),
  ];

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 market-grid" />
      <div className="pointer-events-none fixed inset-0 -z-10 dot-world" />
      <CursorGlow />
      <Navbar />
      <HeroWallpaper />
      <MarketOverview assets={data.assets} />
      <MarketMarquee items={marqueeItems} />
      <section id="board" className="relative scroll-mt-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-6 flex items-center gap-3 text-xs font-black uppercase text-primary">
                <span className="h-2 w-2 rounded-full bg-primary neon-glow badge-pulse" />
                TOP 20 PERFORMERS - MTD
              </div>
              <h2 className="max-w-6xl text-balance text-gradient font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl md:text-8xl xl:text-9xl">
                The 20 assets that closed the gap this month.
              </h2>
            </div>
            <div className="glass p-6">
              <p className="text-xl font-semibold leading-tight text-foreground md:text-2xl">
                Actions & ETFs. Performance pure depuis le 1er du mois. Pas d'opinion, que du
                signal.
              </p>
              <p className="mt-6 text-sm leading-6 text-muted-foreground">
                Most investors see the same gap - between what moved and why it moved.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Kpi label="Best performer" value={formatPercent(data.stats.best)} />
            <Kpi label="Worst of top 20" value={formatPercent(data.stats.worst)} />
            <Kpi label="Date range" value={data.rangeLabel} />
          </div>
        </div>
      </section>

      <section id="positions" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        {data.status === "error" ? (
          <FailureState message={data.error ?? "Market data is temporarily unavailable."} />
        ) : (
          <>
            <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Search by ticker or name"
                  value={search.q}
                  onChange={(event) => updateSearch({ q: event.currentTarget.value })}
                  placeholder="Search ticker / name"
                  className="h-11 rounded-full border-border bg-surface pl-10 font-mono text-sm uppercase shadow-none placeholder:normal-case focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 overflow-hidden rounded-full border border-border">
                {typeFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    variant={search.type === filter.value ? "signal" : "terminal"}
                    className="h-11 rounded-full border-y-0 border-l-0 px-3 text-xs font-black uppercase last:border-r-0"
                    onClick={() => updateSearch({ type: filter.value })}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>

              <Select value={search.sector} onValueChange={(sector) => updateSearch({ sector })}>
                <SelectTrigger className="h-11 rounded-full border-border bg-surface font-mono text-xs uppercase shadow-none focus:ring-primary lg:w-56">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover">
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector} className="rounded-md font-mono text-xs">
                      {sector === "all" ? "All sectors" : sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-3 lg:flex">
                <Button
                  type="button"
                  variant="terminal"
                  className="h-11 rounded-full px-3 text-xs font-black uppercase"
                  onClick={() => exportCsv(filteredAssets)}
                  disabled={filteredAssets.length === 0}
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button
                  type="button"
                  variant="signal"
                  className="btn-glow h-11 rounded-full px-4 text-xs font-bold uppercase"
                  onClick={() => void handleRefresh()}
                  disabled={isRefreshing || isFetching}
                >
                  <RefreshCw
                    className={isRefreshing || isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold uppercase text-muted-foreground">
              <span>{filteredAssets.length} rows visible</span>
              <span>Updated {new Date(data.generatedAt).toLocaleString()}</span>
            </div>

            {filteredAssets.length === 0 ? (
              <EmptyMarketState />
            ) : (
              <>
                <DesktopMarketTable assets={filteredAssets} />
                <MobileAssetCards assets={filteredAssets} />
              </>
            )}
          </>
        )}
      </section>

      <footer className="border-t border-border/50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs font-bold uppercase text-muted-foreground md:flex-row">
          <span>Not financial advice. Data for information only.</span>
          <span className="text-foreground">The right data at the right moment changes everything.</span>
        </div>
      </footer>
      <BottomNav />
    </main>
  );
}

function MarketMarquee({ items }: { items: string[] }) {
  const loop = [...items, ...items, ...items];
  return (
    <div className="mx-3 overflow-hidden rounded-full glass py-3 text-foreground">
      <motion.div
        className="flex w-max gap-5 whitespace-nowrap font-mono text-xs font-black uppercase"
        animate={{ x: [0, -520] }}
        transition={{ duration: 16, ease: "linear", repeat: Infinity }}
      >
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-5">
            <span className="text-emerald">▲</span>
            <span>{item}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass min-h-36 p-6">
      <p className="font-mono text-xs font-black uppercase text-muted-foreground">{label}</p>
      <p className="mt-8 break-words font-mono text-3xl font-bold leading-none text-primary neon-glow md:text-4xl">
        {value}
      </p>
    </div>
  );
}

function DesktopMarketTable({ assets }: { assets: AssetPerformance[] }) {
  return (
    <div className="glass hidden overflow-hidden lg:block">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-white/[0.04] backdrop-blur-xl">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="h-12 px-4 font-mono text-xs font-black uppercase">Rank</TableHead>
            <TableHead className="h-12 px-4 font-mono text-xs font-black uppercase">Ticker</TableHead>
            <TableHead className="h-12 px-4 font-mono text-xs font-black uppercase">Name</TableHead>
            <TableHead className="h-12 px-4 font-mono text-xs font-black uppercase">Type</TableHead>
            <TableHead className="h-12 px-4 text-right font-mono text-xs font-black uppercase">
              Price now
            </TableHead>
            <TableHead className="h-12 px-4 text-right font-mono text-xs font-black uppercase">
              Price Sep 1st
            </TableHead>
            <TableHead className="h-12 px-4 text-right font-mono text-xs font-black uppercase">
              Performance % MTD
            </TableHead>
            <TableHead className="h-12 px-4 font-mono text-xs font-black uppercase">
              Sparkline 1 mois
            </TableHead>
            <TableHead className="h-12 px-4 text-right font-mono text-xs font-black uppercase">
              Market Cap
            </TableHead>
            <TableHead className="h-12 px-4 text-right font-mono text-xs font-black uppercase">
              Volume
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.symbol} className="border-0 transition-colors hover:bg-white/[0.03]">
              <TableCell className="px-4 font-mono text-muted-foreground">
                {String(asset.rank).padStart(2, "0")}
              </TableCell>
              <TableCell className="px-4 font-mono text-lg font-black text-foreground">
                {asset.symbol}
              </TableCell>
              <TableCell className="max-w-72 truncate px-4 font-medium text-foreground">
                {asset.name}
                <div className="mt-1 font-mono text-xs text-muted-foreground">{asset.sector}</div>
              </TableCell>
              <TableCell className="px-4">
                <Badge className="rounded-full border-border bg-secondary font-mono text-xs uppercase text-foreground hover:bg-secondary">
                  {asset.type}
                </Badge>
              </TableCell>
              <TableCell className="px-4 text-right font-mono">
                {formatPrice(asset.priceNow, asset.currency)}
              </TableCell>
              <TableCell className="px-4 text-right font-mono text-muted-foreground">
                {formatPrice(asset.priceStart, asset.currency)}
              </TableCell>
              <TableCell className="px-4 text-right">
                <span className="badge-pulse inline-flex min-w-24 justify-center rounded-full bg-positive px-2 py-1 font-mono text-sm font-black text-positive-foreground">
                  {formatPercent(asset.performance)}
                </span>
              </TableCell>
              <TableCell className="px-4">
                <Sparkline values={asset.sparkline} />
              </TableCell>
              <TableCell className="px-4 text-right font-mono text-muted-foreground">
                {formatCompact(asset.marketCap, asset.currency)}
              </TableCell>
              <TableCell className="px-4 text-right font-mono text-muted-foreground">
                {formatCompact(asset.volume)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MobileAssetCards({ assets }: { assets: AssetPerformance[] }) {
  return (
    <div className="grid gap-3 lg:hidden">
      {assets.map((asset) => (
        <article key={asset.symbol} className="glass p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-muted-foreground">
                #{String(asset.rank).padStart(2, "0")} / {asset.type}
              </p>
              <h2 className="mt-1 font-mono text-2xl font-black text-foreground">{asset.symbol}</h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{asset.name}</p>
            </div>
            <span className="badge-pulse rounded-full bg-positive px-2 py-1 font-mono text-sm font-black text-positive-foreground">
              {formatPercent(asset.performance)}
            </span>
          </div>
          <div className="mt-4 h-12">
            <Sparkline values={asset.sparkline} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 font-mono text-xs">
            <Metric label="Now" value={formatPrice(asset.priceNow, asset.currency)} />
            <Metric label="Sep 1st" value={formatPrice(asset.priceStart, asset.currency)} />
            <Metric label="Market Cap" value={formatCompact(asset.marketCap, asset.currency)} />
            <Metric label="Volume" value={formatCompact(asset.volume)} />
          </dl>
        </article>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const points = values.map((value, index) => ({ index, value }));
  if (points.length < 2) return <div className="h-10 border-b border-border" />;

  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={points} margin={{ top: 8, right: 0, bottom: 8, left: 0 }}>
        <ChartTooltip
          cursor={false}
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 0,
            color: "var(--color-popover-foreground)",
            fontSize: 11,
          }}
          formatter={(value) => [formatNumericPrice(Number(value)), "Close"]}
          labelFormatter={() => ""}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-emerald)"
          style={{ filter: "drop-shadow(0 0 4px var(--color-emerald))" }}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function LoadingMarketState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="glass max-w-3xl p-6">
        <p className="font-mono text-xs font-black uppercase text-primary">Live market tape</p>
        <h1 className="mt-8 font-display text-5xl font-black leading-none md:text-7xl">
          Loading the month-to-date board.
        </h1>
      </div>
    </main>
  );
}

function FailureState({ message }: { message: string }) {
  return (
    <div className="glass mx-auto my-12 max-w-3xl p-6 text-foreground">
      <p className="font-mono text-xs font-black uppercase text-primary">Market feed unavailable</p>
      <h2 className="mt-8 font-display text-4xl font-black leading-none md:text-6xl">
        The signal did not print.
      </h2>
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function EmptyMarketState() {
  return (
    <div className="glass p-6 text-foreground">
      <p className="font-mono text-xs font-black uppercase text-primary">No matching assets</p>
      <p className="mt-4 text-sm text-muted-foreground">Adjust the ticker, name, type, or sector filter.</p>
    </div>
  );
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${percentFormatter.format(value)}%`;
}

function formatNumericPrice(value: number) {
  if (!Number.isFinite(value)) return "—";
  return priceFormatter.format(value);
}

function formatPrice(value: number, currency: string) {
  const compactCurrency = currency === "USD" ? "$" : `${currency} `;
  return `${compactCurrency}${formatNumericPrice(value)}`;
}

function formatCompact(value: number | null, currency?: string) {
  if (value === null || !Number.isFinite(value)) return "—";
  const prefix = currency === "USD" ? "$" : currency ? `${currency} ` : "";
  return `${prefix}${compactFormatter.format(value)}`;
}

function exportCsv(rows: AssetPerformance[]) {
  const headers = [
    "Rank",
    "Ticker",
    "Name",
    "Type",
    "Sector",
    "Price Now",
    "Price Sep 1st",
    "Performance % MTD",
    "Market Cap",
    "Volume",
  ];
  const body = rows.map((row) =>
    [
      row.rank,
      row.symbol,
      row.name,
      row.type,
      row.sector,
      row.priceNow,
      row.priceStart,
      row.performance,
      row.marketCap ?? "",
      row.volume ?? "",
    ].map(csvCell),
  );
  const csv = [headers.map(csvCell), ...body].map((line) => line.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "top-20-performers-mtd.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}