import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { BarChart3, Home, LayoutGrid, Trophy } from "lucide-react";

import { getCandles, getIndices, type Candle } from "@/lib/terminal.functions";
import type { AssetPerformance } from "@/lib/market-data.functions";

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const pct = (v: number) => `${v >= 0 ? "+" : ""}${fmt.format(v)}%`;

/* ---------------- Navbar ---------------- */
export function Navbar() {
  const { data = [] } = useQuery({ queryKey: ["indices"], queryFn: () => getIndices(), refetchInterval: 60_000 });
  const loop = [...data, ...data, ...data, ...data];
  return (
    <header className="sticky top-3 z-40 mx-3 mt-3">
      <div className="glass flex items-center gap-4 rounded-full px-4 py-2.5 hover:shadow-none">
        <a href="#hero" className="shrink-0 font-display text-xl font-bold tracking-tight">
          BOURSE<span className="text-primary">.</span>
        </a>
        <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          {data.length > 0 ? (
            <motion.div
              className="flex w-max gap-8 font-mono text-xs"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 28, ease: "linear", repeat: Infinity }}
            >
              {loop.map((q, i) => (
                <span key={i} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-muted-foreground">{q.label}</span>
                  <span>{fmt.format(q.price)}</span>
                  <span className={q.change >= 0 ? "text-emerald" : "text-bear"}>
                    {q.change >= 0 ? "▲" : "▼"} {pct(q.change)}
                  </span>
                </span>
              ))}
            </motion.div>
          ) : (
            <span className="font-mono text-xs text-muted-foreground">Connecting to live indices…</span>
          )}
        </div>
        <a
          href="#board"
          className="hidden shrink-0 rounded-full border border-primary/60 px-4 py-1.5 text-xs font-bold uppercase text-primary shadow-[0_0_20px_-4px_var(--color-primary)] transition hover:bg-primary hover:text-primary-foreground sm:inline-flex"
        >
          Dashboard
        </a>
      </div>
    </header>
  );
}

/* ---------------- Hero wallpaper ---------------- */
const BULL: Array<[string, number]> = [
  ["60,120 110,80 150,110", 0.5], ["110,80 190,70 150,110", 0.35], ["190,70 260,85 150,110", 0.25],
  ["150,110 260,85 250,160", 0.4], ["150,110 250,160 140,170", 0.2], ["60,120 150,110 140,170", 0.3],
  ["60,120 140,170 70,175", 0.45], ["260,85 300,70 310,110", 0.55], ["260,85 310,110 250,160", 0.3],
  ["300,70 330,40 315,75", 0.7], ["300,70 285,45 305,72", 0.6], ["310,110 335,125 300,130", 0.5],
  ["250,160 300,130 310,110", 0.2], ["70,175 80,230 95,175", 0.4], ["140,170 150,230 160,170", 0.35],
  ["230,160 240,230 250,160", 0.4], ["95,175 140,170 115,200", 0.15], ["60,120 30,150 45,120", 0.5],
];

function seeded(n: number) {
  let s = n;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

export function HeroWallpaper() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yChart = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const yBull = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const { candles, line, particles } = useMemo(() => {
    const r = seeded(7);
    let p = 300;
    const cs = Array.from({ length: 34 }, (_, i) => {
      const o = p;
      const c = o - (r() - 0.35) * 22;
      p = c;
      return { x: 20 + i * 28, o, c, h: Math.min(o, c) - r() * 14, l: Math.max(o, c) + r() * 14 };
    });
    const ln = cs.map((c) => `${c.x},${c.c}`).join(" ");
    const ps = Array.from({ length: 36 }, () => ({ x: r() * 100, y: r() * 100, d: 6 + r() * 10, s: 1 + r() * 2 }));
    return { candles: cs, line: ln, particles: ps };
  }, []);

  return (
    <section ref={ref} id="hero" className="relative flex min-h-[88vh] items-center overflow-hidden">
      <motion.svg
        style={{ y: yChart }}
        viewBox="0 0 980 400"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60 [transform:perspective(900px)_rotateX(18deg)]"
      >
        {candles.map((c, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.6 }}
          >
            <line x1={c.x} x2={c.x} y1={c.h} y2={c.l} stroke={c.c < c.o ? "var(--color-emerald)" : "var(--color-bear)"} strokeWidth={1} />
            <rect
              x={c.x - 7}
              width={14}
              y={Math.min(c.o, c.c)}
              height={Math.max(2, Math.abs(c.o - c.c))}
              fill={c.c < c.o ? "var(--color-emerald)" : "var(--color-bear)"}
              opacity={0.75}
              style={{ filter: `drop-shadow(0 0 6px ${c.c < c.o ? "var(--color-emerald)" : "var(--color-bear)"})` }}
            />
          </motion.g>
        ))}
        <motion.polyline
          points={line}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          style={{ filter: "drop-shadow(0 0 8px var(--color-primary))" }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, opacity: [0.7, 1, 0.7] }}
          transition={{ pathLength: { duration: 2.4 }, opacity: { duration: 3, repeat: Infinity } }}
        />
      </motion.svg>

      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full bg-primary"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, boxShadow: "0 0 8px var(--color-primary)" }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: p.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <motion.svg
        style={{ y: yBull }}
        viewBox="0 0 360 250"
        className="pointer-events-none absolute -right-10 top-1/2 hidden w-[46%] max-w-[640px] -translate-y-1/2 md:block"
        animate={{ rotate: [0, 1.5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="bullGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#FF2E93" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00FF94" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <g style={{ filter: "drop-shadow(0 0 18px rgba(0,229,255,.45))" }}>
          {BULL.map(([pts, o], i) => (
            <polygon key={i} points={pts} fill="url(#bullGlass)" fillOpacity={o + 0.2} stroke="rgba(255,255,255,.35)" strokeWidth={0.6} />
          ))}
        </g>
      </motion.svg>

      <motion.div style={{ y: yText }} className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          className="mb-6 font-mono text-xs uppercase tracking-widest text-primary"
        >
          ● Live · Yahoo Finance
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9 }}
          className="text-gradient font-display text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl lg:text-[96px]"
        >
          La Bourse,
          <br />
          enfin belle.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.4 }}
          className="mt-6 max-w-md text-lg text-muted-foreground"
        >
          Trading terminal inspiré du futur.
        </motion.p>
        <motion.a
          href="#overview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="btn-glow mt-10 inline-flex rounded-full px-6 py-3 text-sm font-bold uppercase"
        >
          Explorer les marchés
        </motion.a>
      </motion.div>
    </section>
  );
}

/* ---------------- Bento ---------------- */
const Reveal = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export function MarketOverview({ assets }: { assets: AssetPerformance[] }) {
  return (
    <section id="overview" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8">
      <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">Market overview</p>
      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2 lg:row-span-2">
          <CandleCard />
        </Reveal>
        <Reveal delay={0.1}>
          <TopMoversCard assets={assets.slice(0, 5)} />
        </Reveal>
        <Reveal delay={0.2}>
          <WorldMapCard />
        </Reveal>
      </div>
    </section>
  );
}

function CandleCard() {
  const [tf, setTf] = useState<"1D" | "1W" | "1M">("1M");
  const { data = [], isLoading } = useQuery({
    queryKey: ["candles", "^GSPC", tf],
    queryFn: () => getCandles({ data: { symbol: "^GSPC", tf } }),
    staleTime: 60_000,
  });
  const last = data[data.length - 1];
  const first = data[0];
  const change = last && first ? ((last.c - first.o) / first.o) * 100 : 0;
  return (
    <div className="glass h-full p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted-foreground">S&P 500 · ^GSPC</p>
          <p className="mt-1 font-mono text-3xl font-bold">
            {last ? fmt.format(last.c) : "—"}{" "}
            <span className={`text-base ${change >= 0 ? "text-emerald" : "text-bear"}`}>{pct(change)}</span>
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-border p-1">
          {(["1D", "1W", "1M"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`rounded-full px-3 py-1 font-mono text-xs transition ${tf === t ? "bg-primary text-primary-foreground shadow-[0_0_14px_var(--color-primary)]" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[340px] rounded-xl bg-background/60">
        {isLoading ? (
          <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">Loading candles…</div>
        ) : (
          <CandleSvg candles={data} />
        )}
      </div>
    </div>
  );
}

function CandleSvg({ candles }: { candles: Candle[] }) {
  if (candles.length < 2) return null;
  const W = 800, H = 340, volH = 60, pad = 10;
  const hi = Math.max(...candles.map((c) => c.h));
  const lo = Math.min(...candles.map((c) => c.l));
  const maxV = Math.max(...candles.map((c) => c.v), 1);
  const step = (W - pad * 2) / candles.length;
  const y = (v: number) => pad + ((hi - v) / (hi - lo || 1)) * (H - volH - pad * 3);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={0} x2={W} y1={(i * (H - volH)) / 5} y2={(i * (H - volH)) / 5} stroke="rgba(255,255,255,.05)" />
      ))}
      {candles.map((c, i) => {
        const x = pad + i * step + step / 2;
        const up = c.c >= c.o;
        const col = up ? "var(--color-emerald)" : "var(--color-bear)";
        return (
          <g key={c.t} style={{ filter: `drop-shadow(0 0 3px ${col})` }}>
            <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={1} />
            <rect x={x - step * 0.32} width={step * 0.64} y={y(Math.max(c.o, c.c))} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} />
            <rect x={x - step * 0.32} width={step * 0.64} y={H - (c.v / maxV) * volH} height={(c.v / maxV) * volH} fill={col} opacity={0.25} />
          </g>
        );
      })}
    </svg>
  );
}

function TopMoversCard({ assets }: { assets: AssetPerformance[] }) {
  return (
    <div className="glass h-full p-5">
      <p className="mb-4 font-mono text-xs uppercase text-muted-foreground">Top movers · MTD</p>
      <ul className="space-y-3">
        {assets.map((a) => (
          <li key={a.symbol} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono font-bold">{a.symbol}</p>
              <p className="truncate text-xs text-muted-foreground">{a.name}</p>
            </div>
            <span
              className={`badge-pulse rounded-full px-2.5 py-1 font-mono text-xs font-bold ${a.performance >= 0 ? "bg-emerald text-positive-foreground" : "bg-bear text-foreground"}`}
            >
              {pct(a.performance)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const EXCHANGES = [
  { name: "NYSE", x: 27, y: 38 }, { name: "NASDAQ", x: 25, y: 40 }, { name: "Toronto", x: 26, y: 33 },
  { name: "São Paulo", x: 35, y: 72 }, { name: "London", x: 48, y: 28 }, { name: "Paris", x: 50, y: 31 },
  { name: "Frankfurt", x: 52, y: 29 }, { name: "Dubai", x: 63, y: 46 }, { name: "Mumbai", x: 69, y: 50 },
  { name: "Shanghai", x: 81, y: 42 }, { name: "Hong Kong", x: 80, y: 47 }, { name: "Tokyo", x: 88, y: 38 },
  { name: "Sydney", x: 90, y: 78 }, { name: "Johannesburg", x: 56, y: 76 },
];
// rough continent ellipses (cx, cy, rx, ry) in % space
const LAND: Array<[number, number, number, number]> = [
  [22, 35, 13, 13], [30, 22, 9, 7], [34, 68, 7, 15], [51, 30, 7, 7], [55, 56, 8, 16],
  [70, 34, 16, 12], [80, 50, 7, 7], [89, 76, 6, 5], [42, 14, 4, 4],
];

function WorldMapCard() {
  const dots = useMemo(() => {
    const out: Array<[number, number]> = [];
    for (let x = 2; x < 100; x += 2.2)
      for (let y = 4; y < 96; y += 4)
        if (LAND.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1)) out.push([x, y]);
    return out;
  }, []);
  return (
    <div className="glass h-full p-5">
      <p className="mb-4 font-mono text-xs uppercase text-muted-foreground">Global exchanges · live</p>
      <div className="relative aspect-[2/1] w-full">
        {dots.map(([x, y], i) => (
          <span key={i} className="absolute h-1 w-1 rounded-[1px] bg-foreground/15" style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
        {EXCHANGES.map((e, i) => (
          <motion.span
            key={e.name}
            title={e.name}
            className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
            style={{ left: `${e.x}%`, top: `${e.y}%`, boxShadow: "0 0 10px 2px var(--color-primary)" }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 2, delay: i * 0.25, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Cursor + bottom nav ---------------- */
export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  if (!enabled) return null;
  return (
    <>
      <div
        className="pointer-events-none fixed z-50 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{ left: pos.x, top: pos.y, background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }}
      />
      <div
        className="pointer-events-none fixed z-50 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
        style={{ left: pos.x, top: pos.y, boxShadow: "0 0 12px 3px var(--color-primary)" }}
      />
    </>
  );
}

export function BottomNav() {
  const items = [
    { href: "#hero", label: "Home", Icon: Home },
    { href: "#overview", label: "Markets", Icon: LayoutGrid },
    { href: "#board", label: "Top 20", Icon: Trophy },
    { href: "#positions", label: "Positions", Icon: BarChart3 },
  ];
  return (
    <nav className="glass fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-full py-2 lg:hidden">
      {items.map(({ href, label, Icon }) => (
        <a key={href} href={href} className="flex flex-col items-center gap-0.5 px-3 text-[10px] uppercase text-muted-foreground hover:text-primary">
          <Icon className="h-5 w-5" />
          {label}
        </a>
      ))}
    </nav>
  );
}
