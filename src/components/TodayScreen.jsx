import {
  Flame,
  Drumstick,
  Sparkles,
  Refrigerator,
  Car,
  Camera,
  ScanBarcode,
  PenLine,
  Droplet,
  Plus,
  ArrowRight,
  TrendingUp,
  Dumbbell,
} from "lucide-react";
import { Ring, MiniBar } from "./MacroRings.jsx";
import { agentSuggestions, weeklyTrend } from "../data/mockData.js";
import { WorkoutCard, DiaryCard, CountdownCard } from "./MeridianWidgets.jsx";
import FridgeHub from "./FridgeHub.jsx";
import { useAppState } from "../lib/AppState.jsx";
import { Trash2 } from "lucide-react";

export default function TodayScreen({ user, meals, onFlow, onTab }) {
  const { calories, protein, carbs, fat, water } = user.today;
  const { addWater, addMeal, deleteMeal } = useAppState();

  const quickLogManual = () => {
    const name = prompt("Meal name?");
    if (!name) return;
    const cal = parseInt(prompt("Calories?"), 10) || 0;
    const p = parseInt(prompt("Protein (g)?"), 10) || 0;
    const c = parseInt(prompt("Carbs (g)?"), 10) || 0;
    const f = parseInt(prompt("Fat (g)?"), 10) || 0;
    addMeal({ name, emoji: "🍽️", calories: cal, protein: p, carbs: c, fat: f, slot: "Manual", source: "manual" });
  };

  return (
    <div className="animate-float-up">
      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
        {/* Fridge hero — the centerpiece */}
        <section className="lg:col-span-7 order-1">
          <FridgeHub onScan={() => onFlow("home")} />
        </section>

        {/* Hero macros — secondary on desktop */}
        <section className="lg:col-span-5 order-2">
          <div className="glass-card p-5 lg:p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-macro-green/25 blur-3xl" />
            <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full bg-macro-amber/15 blur-3xl" />

            <div className="relative flex items-center justify-between mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-macro-green">
                  <Sparkles className="w-3 h-3" /> Today's goal
                </span>
                <p className="text-sm text-white/60 mt-0.5">
                  {user.goal} · Protein forward
                </p>
              </div>
              <div className="flex items-center gap-1.5 glass px-2.5 py-1 rounded-full">
                <Flame className="w-3.5 h-3.5 text-macro-amber" />
                <span className="text-xs font-semibold">{user.streak}-day streak</span>
              </div>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-4">
              <Ring
                size={140}
                stroke={11}
                progress={calories.current / calories.target}
                gradient={["#7BFFD3", "#34E39F"]}
                glow="#34E39F"
                label="Calories"
                value={calories.current}
                unit={`of ${calories.target}`}
              />
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center gap-3">
                  <Ring
                    size={66}
                    stroke={6}
                    progress={protein.current / protein.target}
                    gradient={["#FFD58A", "#FF8F6B"]}
                    glow="#FFB655"
                  />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/50">
                      Protein
                    </p>
                    <p className="text-xl font-semibold leading-tight">
                      {protein.current}
                      <span className="text-white/40 text-sm font-normal">
                        /{protein.target}g
                      </span>
                    </p>
                    <p className="text-[10px] text-macro-green">
                      45g to hit goal
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MiniBar label="Carbs" current={carbs.current} target={carbs.target} color="#5FD8FF" />
                  <MiniBar label="Fat" current={fat.current} target={fat.target} color="#A78BFA" />
                </div>
                <WaterBar water={water} />
              </div>
            </div>
          </div>
        </section>

        {/* Not cooking? — compact sibling to the Fridge hero */}
        <section className="lg:col-span-12 order-3">
          <div className="glass-card p-4 lg:p-5 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-macro-amber/20 blur-3xl" />
            <div className="relative flex items-center gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-macro-amber/18 border border-macro-amber/40 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 text-macro-amber" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-macro-amber">
                  Not cooking tonight?
                </p>
                <p className="text-sm font-semibold truncate">
                  7 high-protein spots open within 10 min
                </p>
                <p className="text-[11px] text-white/50 truncate">
                  Sweetgreen · Xi'an Famous Foods · Din Tai Fung…
                </p>
              </div>
            </div>
            <div className="relative flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onFlow("road")}
                className="flex-1 sm:flex-none h-10 px-4 rounded-xl font-semibold text-ink-950 flex items-center gap-2 text-sm active:scale-[0.98] transition"
                style={{
                  background: "linear-gradient(135deg, #FFD58A, #FFB655)",
                  boxShadow: "0 14px 30px -12px rgba(255, 182, 85, 0.55)",
                }}
              >
                <Car className="w-4 h-4" /> Find spots
              </button>
              <button
                onClick={() => onTab("agent")}
                className="h-10 px-3 glass rounded-xl text-sm text-white/75 hover:bg-white/8 transition flex items-center gap-1.5"
              >
                Ask agent
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Quick log actions */}
        <section className="lg:col-span-12">
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-white/50">
              Quick log
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <QuickAction icon={<Camera />} label="Photo meal" tint="#34E39F" onClick={() => onFlow("home")} />
            <QuickAction icon={<ScanBarcode />} label="Barcode" tint="#5FD8FF" onClick={() => onTab("agent")} />
            <QuickAction icon={<PenLine />} label="Manual" tint="#A78BFA" onClick={quickLogManual} />
            <QuickAction icon={<Droplet />} label="+ Water" tint="#FFB655" onClick={() => addWater(0.25)} />
          </div>
        </section>

        {/* Today's meal timeline */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-white/50">
              Today's meals
            </h2>
            <span className="text-[11px] text-white/40">
              {meals.length} logged
            </span>
          </div>
          <div className="glass-card p-2 lg:p-3">
            <div className="divide-y divide-white/5">
              {meals.map((m) => (
                <MealRow key={m.id} meal={m} onDelete={() => deleteMeal(m.id)} />
              ))}
              <button
                onClick={() => onTab("agent")}
                className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-white/5 rounded-xl transition"
              >
                <div className="w-10 h-10 rounded-xl bg-macro-green/15 border border-dashed border-macro-green/40 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-macro-green" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Add another meal</p>
                  <p className="text-[11px] text-white/45">
                    Chat with MacroAgent, scan, or log manually
                  </p>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Weekly snapshot */}
        <section className="lg:col-span-5 space-y-4">
          <div className="glass-card p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold">This week</h3>
                <p className="text-[11px] text-white/45 mt-0.5">
                  4/7 days hit · avg 2,343 kcal
                </p>
              </div>
              <div className="flex items-center gap-1 glass px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 text-macro-green" />
                <span className="text-[11px] font-semibold text-macro-green">
                  +8%
                </span>
              </div>
            </div>
            <WeeklyChart data={weeklyTrend} />
          </div>
        </section>

        {/* Meridian-inspired modules: Workout · Diary · Countdown */}
        <section className="lg:col-span-4">
          <WorkoutCard />
        </section>
        <section className="lg:col-span-4">
          <DiaryCard />
        </section>
        <section className="lg:col-span-4">
          <CountdownCard />
        </section>
      </div>
    </div>
  );
}

function WaterBar({ water }) {
  const pct = Math.min(100, (water.current / water.target) * 100);
  return (
    <div className="flex items-center gap-3 pt-1">
      <Droplet className="w-4 h-4 text-macro-cyan" />
      <div className="flex-1">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-white/50">
            Water
          </span>
          <span className="text-[11px] text-white/80 font-medium">
            {water.current}L
            <span className="text-white/40">/{water.target}L</span>
          </span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, rgba(95,216,255,0.5), #5FD8FF)",
              boxShadow: "0 0 12px #5FD8FF80",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function AgentAction({ icon, label, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative h-11 rounded-xl border flex items-center justify-center gap-2 font-medium text-sm active:scale-[0.98] transition"
      style={{
        background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
        borderColor: `${accent}50`,
        color: accent,
        boxShadow: `0 0 20px ${accent}25`,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function QuickAction({ icon, label, tint, onClick }) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-3.5 flex items-center gap-3 active:scale-[0.98] transition bento-hover"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: `${tint}22`,
          color: tint,
          border: `1px solid ${tint}33`,
        }}
      >
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function MealRow({ meal, onDelete }) {
  return (
    <div className="group flex items-center gap-3 px-3 py-3">
      <div className="w-11 h-11 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center text-xl">
        {meal.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{meal.name}</p>
          <SourceBadge source={meal.source} />
        </div>
        <p className="text-[11px] text-white/45 mt-0.5">
          {meal.slot} · {meal.time}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold">{meal.cal} kcal</p>
        <p className="text-[11px] text-macro-green">
          {meal.p}g <span className="text-white/40">P</span>
        </p>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          className="ml-2 w-8 h-8 rounded-lg bg-white/0 hover:bg-white/8 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white/60 hover:text-macro-peach"
          title="Delete meal"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function SourceBadge({ source }) {
  const map = {
    manual: { label: "Manual", color: "#94A3B8" },
    barcode: { label: "Barcode", color: "#5FD8FF" },
    restaurant: { label: "Restaurant", color: "#FFB655" },
    quick: { label: "Quick", color: "#A78BFA" },
    agent: { label: "Agent", color: "#34E39F" },
  };
  const m = map[source] || map.manual;
  return (
    <span
      className="text-[9px] px-1.5 py-0.5 rounded-full border leading-none whitespace-nowrap"
      style={{
        color: m.color,
        borderColor: `${m.color}40`,
        background: `${m.color}12`,
      }}
    >
      {m.label}
    </span>
  );
}

function WeeklyChart({ data }) {
  const max = Math.max(...data.map((d) => d.cal));
  return (
    <div className="flex items-end gap-1.5 h-24">
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
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full h-full flex items-end">
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${h}%`,
                  background: `linear-gradient(180deg, ${color}, ${color}80)`,
                  boxShadow:
                    d.hit === true || isCurrent ? `0 0 12px ${color}80` : "none",
                  opacity: d.cal === 0 ? 0.3 : 1,
                }}
              />
            </div>
            <span
              className={`text-[10px] ${
                isCurrent ? "text-macro-amber font-semibold" : "text-white/40"
              }`}
            >
              {d.day[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
