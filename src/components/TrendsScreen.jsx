import {
  TrendingUp,
  Flame,
  Target,
  Award,
  Sparkles,
  ChefHat,
  Dumbbell,
  Scale,
} from "lucide-react";
import {
  weeklyTrend,
  streakCalendar,
  achievements,
  weeklyRecap,
  weightTrend,
} from "../data/mockData.js";
import { Ring } from "./MacroRings.jsx";

export default function TrendsScreen({ user }) {
  return (
    <div className="animate-float-up grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
      {/* Weekly Recap — Meridian-style */}
      <section className="lg:col-span-8">
        <div className="glass-card p-5 lg:p-6 relative overflow-hidden">
          <div className="absolute -top-14 -right-14 w-60 h-60 rounded-full bg-macro-green/15 blur-3xl" />
          <div className="absolute -bottom-14 -left-14 w-60 h-60 rounded-full bg-macro-amber/10 blur-3xl" />

          <div className="relative flex items-center justify-between mb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-macro-green">
                <Sparkles className="w-3 h-3" /> Weekly recap
              </span>
              <h2 className="text-2xl font-semibold mt-0.5">
                {weeklyRecap.range}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-white/45">
                Good days
              </p>
              <p className="text-2xl font-bold text-gradient-green leading-none">
                {weeklyRecap.goodDays}
                <span className="text-sm text-white/45 font-normal">
                  /{weeklyRecap.totalDays}
                </span>
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <RecapStat
              icon={<Flame className="w-4 h-4" />}
              label="Avg kcal"
              value={weeklyRecap.caloriesAvg}
              color="#34E39F"
            />
            <RecapStat
              icon={<Dumbbell className="w-4 h-4" />}
              label="Workouts"
              value={`${weeklyRecap.workouts}/${weeklyRecap.workoutsPlanned}`}
              color="#A78BFA"
            />
            <RecapStat
              icon={<ChefHat className="w-4 h-4" />}
              label="Cooked"
              value={weeklyRecap.cookedAtHome}
              color="#FFB655"
            />
            <RecapStat
              icon={<Scale className="w-4 h-4" />}
              label="Weight Δ"
              value={`+${weeklyRecap.deltaWeight}kg`}
              color="#5FD8FF"
            />
          </div>

          <div className="relative mt-4 space-y-1.5">
            {weeklyRecap.highlights.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-[12px] px-3 py-2 rounded-xl"
                style={{
                  background:
                    h.tone === "green"
                      ? "rgba(52, 227, 159, 0.08)"
                      : "rgba(255, 182, 85, 0.08)",
                  border: `1px solid ${
                    h.tone === "green"
                      ? "rgba(52, 227, 159, 0.25)"
                      : "rgba(255, 182, 85, 0.25)"
                  }`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{
                    background: h.tone === "green" ? "#34E39F" : "#FFB655",
                    boxShadow: `0 0 8px ${
                      h.tone === "green" ? "#34E39F" : "#FFB655"
                    }`,
                  }}
                />
                <span className="text-white/85 leading-snug">{h.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weight trend sparkline */}
      <section className="lg:col-span-4">
        <div className="glass-card p-5 h-full relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-macro-cyan/15 blur-3xl" />
          <div className="relative flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-macro-cyan" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-macro-cyan">
              Weight · 2 wk
            </span>
          </div>
          <p className="relative text-2xl font-semibold">
            {user.weightKg}
            <span className="text-sm text-white/50 font-normal"> kg</span>
          </p>
          <p className="relative text-[11px] text-macro-green mt-0.5">
            +1.2 kg vs 2 weeks ago
          </p>
          <WeightSparkline data={weightTrend} />
          <div className="relative flex items-center justify-between text-[10px] text-white/45 mt-2">
            <span>{weightTrend[0].d}</span>
            <span>{weightTrend[weightTrend.length - 1].d}</span>
          </div>
        </div>
      </section>
      {/* Big weekly chart */}
      <section className="lg:col-span-8">
        <div className="glass-card p-5 lg:p-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-macro-green/15 blur-3xl" />
          <div className="relative flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-macro-green">
                This week
              </p>
              <h2 className="text-2xl font-semibold mt-0.5">
                2,343 <span className="text-base text-white/50 font-normal">avg kcal</span>
              </h2>
              <p className="text-xs text-white/55">
                4 of 7 days on target · +8% protein vs last week
              </p>
            </div>
            <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-macro-green" />
              <span className="text-xs font-semibold text-macro-green">+8%</span>
            </div>
          </div>
          <BigChart data={weeklyTrend} />
        </div>
      </section>

      {/* Ring trio */}
      <section className="lg:col-span-4 grid grid-cols-3 lg:grid-cols-1 gap-3">
        <MiniRingCard
          label="Avg kcal"
          progress={0.94}
          value="94%"
          sub="of 2,500 goal"
          gradient={["#7BFFD3", "#34E39F"]}
          glow="#34E39F"
        />
        <MiniRingCard
          label="Avg protein"
          progress={0.92}
          value="92%"
          sub="of 160g goal"
          gradient={["#FFD58A", "#FF8F6B"]}
          glow="#FFB655"
        />
        <MiniRingCard
          label="Workouts"
          progress={0.83}
          value="5/6"
          sub="plan completed"
          gradient={["#C4B5FD", "#A78BFA"]}
          glow="#A78BFA"
        />
      </section>

      {/* Streak calendar */}
      <section className="lg:col-span-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-macro-amber" />
                {user.streak}-day streak
              </h3>
              <p className="text-[11px] text-white/45">
                Last 5 weeks · {user.joinedDays} days tracked total
              </p>
            </div>
            <span className="text-[11px] text-macro-green">Keep going →</span>
          </div>
          <StreakGrid />
          <div className="flex items-center gap-4 mt-3 text-[10px] text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-macro-green/60" />
              Hit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-white/10" />
              Missed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-macro-amber shadow-[0_0_6px_#FFB655]" />
              Today
            </span>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="lg:col-span-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-macro-violet" />
              Achievements
            </h3>
            <span className="text-[11px] text-white/45">
              {achievements.filter((a) => a.earned).length}/{achievements.length}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`p-3 rounded-xl border text-center ${
                  a.earned
                    ? "bg-macro-green/8 border-macro-green/30"
                    : "bg-white/3 border-white/8 opacity-60"
                }`}
              >
                <div className="text-2xl mb-1">{a.icon}</div>
                <p className="text-[11px] font-semibold">{a.name}</p>
                {a.note && (
                  <p className="text-[9px] text-white/45 mt-0.5 leading-tight">
                    {a.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Macro breakdown */}
      <section className="lg:col-span-12">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-macro-green" />
            <h3 className="text-sm font-semibold">Weekly macro mix</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MacroBar label="Protein" pct={92} color="#34E39F" detail="148g avg · 160g goal" />
            <MacroBar label="Carbs" pct={84} color="#5FD8FF" detail="236g avg · 280g goal" />
            <MacroBar label="Fat" pct={96} color="#A78BFA" detail="77g avg · 80g goal" />
          </div>
        </div>
      </section>
    </div>
  );
}

function BigChart({ data }) {
  const max = Math.max(...data.map((d) => d.cal));
  return (
    <div className="relative">
      {/* Gridlines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-px bg-white/5" />
        ))}
      </div>
      <div className="relative flex items-end gap-3 h-48">
        {data.map((d) => {
          const h = d.cal === 0 ? 6 : (d.cal / max) * 100;
          const isCurrent = d.current;
          const color =
            d.hit === true
              ? "#34E39F"
              : d.hit === false
              ? "#FF8F6B"
              : isCurrent
              ? "#FFB655"
              : "rgba(255,255,255,0.15)";
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2 relative">
              {d.cal > 0 && (
                <div
                  className="absolute -top-7 text-[10px] font-semibold"
                  style={{
                    color: isCurrent ? "#FFB655" : "rgba(255,255,255,0.75)",
                  }}
                >
                  {d.cal}
                </div>
              )}
              <div className="w-full h-full flex items-end">
                <div
                  className="w-full rounded-t-xl transition-all"
                  style={{
                    height: `${h}%`,
                    background: `linear-gradient(180deg, ${color}, ${color}70)`,
                    boxShadow:
                      d.hit === true || isCurrent ? `0 0 16px ${color}90` : "none",
                    opacity: d.cal === 0 ? 0.35 : 1,
                  }}
                />
              </div>
              <span
                className={`text-[11px] ${
                  isCurrent
                    ? "text-macro-amber font-semibold"
                    : "text-white/50"
                }`}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniRingCard({ label, progress, value, sub, gradient, glow }) {
  return (
    <div className="glass-card p-4 flex lg:flex-row flex-col items-center gap-3">
      <Ring
        size={74}
        stroke={8}
        progress={progress}
        gradient={gradient}
        glow={glow}
      />
      <div className="text-center lg:text-left min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-white/45">
          {label}
        </p>
        <p className="text-lg font-semibold leading-tight">{value}</p>
        <p className="text-[10px] text-white/55 truncate">{sub}</p>
      </div>
    </div>
  );
}

function StreakGrid() {
  const weeks = streakCalendar;
  return (
    <div className="grid grid-rows-5 gap-1.5">
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1.5">
          {week.map((d, di) => {
            const bg =
              d === 2
                ? "bg-macro-amber shadow-[0_0_8px_#FFB655]"
                : d === 1
                ? "bg-macro-green/60"
                : "bg-white/8";
            return (
              <div
                key={`${wi}-${di}`}
                className={`aspect-square rounded-md ${bg}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function RecapStat({ icon, label, value, color }) {
  return (
    <div
      className="p-3 rounded-2xl border"
      style={{
        background: `${color}12`,
        borderColor: `${color}30`,
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5"
        style={{ background: `${color}22`, color }}
      >
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-wider text-white/45">
        {label}
      </p>
      <p className="text-base font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function WeightSparkline({ data }) {
  const values = data.map((d) => d.kg);
  const min = Math.min(...values) - 0.3;
  const max = Math.max(...values) + 0.3;
  const w = 240;
  const h = 80;
  const xStep = w / (data.length - 1);
  const points = data
    .map(
      (d, i) =>
        `${i * xStep},${h - ((d.kg - min) / (max - min)) * h}`
    )
    .join(" ");
  const area = `0,${h} ${points} ${w},${h}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-20 mt-3"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="wt-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5FD8FF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#5FD8FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#wt-fill)" />
      <polyline
        points={points}
        fill="none"
        stroke="#5FD8FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px rgba(95,216,255,0.7))" }}
      />
      {data.map((d, i) => {
        const cx = i * xStep;
        const cy = h - ((d.kg - min) / (max - min)) * h;
        const last = i === data.length - 1;
        return (
          <circle
            key={d.d}
            cx={cx}
            cy={cy}
            r={last ? 4 : 2}
            fill={last ? "#5FD8FF" : "#0B0E1A"}
            stroke="#5FD8FF"
            strokeWidth={last ? 0 : 1.5}
            style={last ? { filter: "drop-shadow(0 0 6px #5FD8FF)" } : {}}
          />
        );
      })}
    </svg>
  );
}

function MacroBar({ label, pct, color, detail }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-semibold">{label}</span>
        <span className="text-[11px] font-semibold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 10px ${color}80`,
          }}
        />
      </div>
      <p className="text-[10px] text-white/45 mt-1">{detail}</p>
    </div>
  );
}
