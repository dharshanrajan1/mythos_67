import { useState } from "react";
import {
  Sparkles,
  ScanLine,
  Clock,
  AlertTriangle,
  Drumstick,
  Leaf,
  FlaskConical,
  Snowflake,
  ChevronRight,
  Zap,
} from "lucide-react";

/**
 * FridgeHub — the hero card of the dashboard.
 * A glowing, glassy smart-fridge surface with live shelf preview,
 * freshness ring, expiring alerts, and the big scan CTA.
 */
export default function FridgeHub({ onScan }) {
  return (
    <div className="relative fridge-glass p-5 lg:p-6 overflow-hidden group">
      {/* Ambient aurora blobs */}
      <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-macro-green/30 blur-3xl animate-fridge-chill" />
      <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-macro-cyan/25 blur-3xl animate-fridge-chill" style={{ animationDelay: "2s" }} />
      <div className="absolute inset-0 fridge-noise pointer-events-none" />

      {/* Floating chill particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="absolute block w-1 h-1 rounded-full bg-macro-cyan/60 animate-chill-rise"
            style={{
              left: `${8 + i * 9}%`,
              bottom: `${(i * 13) % 40}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${6 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex items-center justify-center">
              <span className="absolute w-2.5 h-2.5 rounded-full bg-macro-green animate-ping opacity-70" />
              <span className="w-2 h-2 rounded-full bg-macro-green shadow-[0_0_12px_#34E39F]" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-macro-green hud-text">
              Smart Fridge · Live
            </span>
          </div>
          <h2 className="text-2xl lg:text-[26px] font-semibold leading-tight">
            Your fridge is{" "}
            <span className="text-gradient-green">stocked for protein.</span>
          </h2>
          <p className="text-xs text-white/55 mt-1">
            Last scanned 2h ago · 8 tracked items · 2 expiring soon
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-center">
          <FreshnessRing value={82} />
          <span className="text-[9px] uppercase tracking-wider text-white/50 mt-1">Fresh</span>
        </div>
      </div>

      {/* Fridge interior preview */}
      <div className="relative mt-5 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0E1426] to-[#060810]">
        <FridgeInteriorPreview />

        {/* Scan CTA overlaid */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <div className="glass px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Snowflake className="w-3 h-3 text-macro-cyan" />
            <span className="text-[10px] text-white/70 hud-text">3.4°C</span>
          </div>
        </div>
        <div className="absolute top-3 left-3 glass px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-macro-green animate-pulse" />
          <span className="text-[10px] text-white/75 hud-text">GPT-5.4 vision ready</span>
        </div>
      </div>

      {/* Category strip */}
      <div className="relative grid grid-cols-3 gap-2 mt-4">
        <CategoryPill icon={<Drumstick className="w-3.5 h-3.5" />} label="Protein" value="3 items" accent="#34E39F" />
        <CategoryPill icon={<Leaf className="w-3.5 h-3.5" />} label="Produce" value="4 items" accent="#7BFFD3" />
        <CategoryPill icon={<FlaskConical className="w-3.5 h-3.5" />} label="Sauces" value="3 items" accent="#A78BFA" />
      </div>

      {/* Expiring alert */}
      <div className="relative mt-3 p-3 rounded-2xl bg-gradient-to-r from-macro-amber/15 to-transparent border border-macro-amber/30 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-macro-amber/20 border border-macro-amber/40 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-macro-amber" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold">2 items expire this week</p>
          <p className="text-[11px] text-white/55 truncate">
            Rotisserie chicken · 2d · Greek yogurt · 3d
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
      </div>

      {/* Primary CTA */}
      <button
        onClick={onScan}
        className="relative mt-4 w-full h-14 rounded-2xl font-semibold text-ink-950 flex items-center justify-center gap-2 text-base active:scale-[0.99] transition overflow-hidden group/btn"
        style={{
          background: "linear-gradient(135deg, #7BFFD3 0%, #34E39F 55%, #0F8A5F 100%)",
          boxShadow: "0 20px 50px -15px rgba(52, 227, 159, 0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.35),transparent_60%)] opacity-0 group-hover/btn:opacity-100 transition" />
        <ScanLine className="w-5 h-5 relative" />
        <span className="relative">Scan my fridge</span>
        <span className="relative glass px-2 py-0.5 rounded-full text-[10px] text-ink-950/80 ml-1 border border-ink-950/10 bg-white/40">
          <Sparkles className="w-2.5 h-2.5 inline -mt-0.5" /> AI
        </span>
      </button>

      {/* Secondary row */}
      <div className="relative mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
        <button className="glass px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-white/8 transition">
          <Clock className="w-3.5 h-3.5 text-macro-cyan" />
          <span className="text-white/70 truncate">View full inventory</span>
        </button>
        <button
          onClick={onScan}
          className="glass px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-white/8 transition"
        >
          <Zap className="w-3.5 h-3.5 text-macro-amber" />
          <span className="text-white/70 truncate">15-min dinner plan</span>
        </button>
      </div>
    </div>
  );
}

/* ---------- Fridge interior preview ---------- */
const SHELVES = [
  {
    y: "12%",
    items: [
      { emoji: "🍗", name: "Chicken", qty: "400g", exp: 2, x: "10%" },
      { emoji: "🥚", name: "Eggs", qty: "6 pc", exp: 9, x: "50%" },
      { emoji: "🥛", name: "Milk", qty: "1L", exp: 5, x: "82%" },
    ],
  },
  {
    y: "44%",
    items: [
      { emoji: "🥒", name: "Cucumber", qty: "2 pc", exp: 4, x: "14%" },
      { emoji: "🌱", name: "Scallion", qty: "bunch", exp: 3, x: "42%" },
      { emoji: "🧄", name: "Garlic", qty: "6 cl", exp: 21, x: "68%" },
      { emoji: "🍋", name: "Lemon", qty: "2", exp: 10, x: "88%" },
    ],
  },
  {
    y: "76%",
    items: [
      { emoji: "🥫", name: "Soy sauce", qty: "bottle", exp: 120, x: "22%" },
      { emoji: "🌶️", name: "Chili oil", qty: "jar", exp: 90, x: "58%" },
      { emoji: "🍜", name: "Noodles", qty: "pack", exp: 60, x: "86%" },
    ],
  },
];

function FridgeInteriorPreview() {
  const [hover, setHover] = useState(null);

  return (
    <div className="relative aspect-[16/9] w-full">
      {/* Inner walls gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(150,220,255,0.18), transparent 55%), linear-gradient(180deg, #0E1730 0%, #060914 100%)",
        }}
      />
      {/* subtle vertical light streaks */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 60px)",
        }}
      />

      {/* Shelves + items */}
      {SHELVES.map((shelf, si) => (
        <div key={si} className="absolute inset-x-4" style={{ top: shelf.y }}>
          {/* Items sit ABOVE the shelf line */}
          <div className="relative h-0">
            {shelf.items.map((it, i) => (
              <FridgeItem
                key={it.name}
                item={it}
                delay={si * 0.15 + i * 0.08}
                isHover={hover === `${si}-${i}`}
                onHover={(on) => setHover(on ? `${si}-${i}` : null)}
              />
            ))}
          </div>
          {/* The shelf line */}
          <div className="fridge-shelf h-[2px] rounded-full mt-6" />
        </div>
      ))}

      {/* Door gasket frame */}
      <div className="absolute inset-2 rounded-2xl border border-white/6 pointer-events-none" />

      {/* Interior light */}
      <div
        className="absolute inset-x-0 top-0 h-8 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(150,220,255,0.35), transparent)",
        }}
      />
    </div>
  );
}

function FridgeItem({ item, delay, isHover, onHover }) {
  const urgent = item.exp <= 3;
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-full animate-float-up"
      style={{ left: item.x, animationDelay: `${delay}s` }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div
        className={`relative flex flex-col items-center transition-transform ${isHover ? "-translate-y-0.5" : ""}`}
      >
        {/* Item emoji */}
        <div
          className="text-[28px] leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
          style={{
            filter: urgent ? "drop-shadow(0 0 10px rgba(255,182,85,0.7))" : "drop-shadow(0 0 8px rgba(52,227,159,0.4))",
          }}
        >
          {item.emoji}
        </div>
        {/* Glow halo */}
        <div
          className="absolute -z-10 inset-0 blur-xl rounded-full"
          style={{
            background: urgent ? "rgba(255,182,85,0.35)" : "rgba(52,227,159,0.25)",
            transform: "scale(1.2)",
          }}
        />

        {/* Freshness dot */}
        <div
          className={`mt-1 w-1 h-1 rounded-full ${urgent ? "bg-macro-amber animate-pulse" : "bg-macro-green"}`}
        />

        {/* Hover tooltip */}
        {isHover && (
          <div className="absolute bottom-full mb-2 whitespace-nowrap glass-strong px-2.5 py-1.5 rounded-xl text-[10px] animate-bubble-in z-10">
            <p className="font-semibold text-white">{item.name}</p>
            <p className={`hud-text ${urgent ? "text-macro-amber" : "text-macro-green"}`}>
              {item.qty} · {item.exp}d
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Freshness ring ---------- */
function FreshnessRing({ value = 82 }) {
  const size = 72;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="fresh-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7BFFD3" />
            <stop offset="100%" stopColor="#34E39F" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#fresh-grad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: "drop-shadow(0 0 8px rgba(52,227,159,0.6))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-semibold">{value}</span>
        <span className="text-[8px] uppercase tracking-wider text-white/50 -mt-0.5">%</span>
      </div>
    </div>
  );
}

function CategoryPill({ icon, label, value, accent }) {
  return (
    <div
      className="p-2.5 rounded-xl border flex items-center gap-2"
      style={{
        background: `linear-gradient(135deg, ${accent}18, transparent)`,
        borderColor: `${accent}30`,
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accent}22`, color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wider text-white/50 leading-none">{label}</p>
        <p className="text-[12px] font-semibold leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}
