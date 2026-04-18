import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Filter,
  Flame,
  Drumstick,
  CalendarCheck2,
  ShoppingCart,
  UtensilsCrossed,
  Check,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { mealHistory } from "../data/mockData.js";
import { api } from "../lib/api.js";

const TABS = [
  { id: "log", label: "Log", icon: UtensilsCrossed },
  { id: "plan", label: "Week plan", icon: CalendarCheck2 },
  { id: "shop", label: "Shopping", icon: ShoppingCart },
];

export default function MealsScreen({ meals, onFlow }) {
  const [tab, setTab] = useState("log");

  const todayTotal = useMemo(
    () =>
      meals.reduce(
        (acc, m) => ({
          cal: acc.cal + m.cal,
          p: acc.p + m.p,
          c: acc.c + m.c,
          f: acc.f + m.f,
        }),
        { cal: 0, p: 0, c: 0, f: 0 }
      ),
    [meals]
  );

  return (
    <div className="animate-float-up space-y-4 pt-2">
      {/* Header */}
      <div className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-macro-green">
            Today · Apr 18
          </p>
          <h2 className="text-2xl font-semibold mt-0.5">
            {todayTotal.cal}
            <span className="text-base text-white/50 font-normal"> kcal</span>
          </h2>
          <p className="text-xs text-white/55 mt-0.5">
            {todayTotal.p}g P · {todayTotal.c}g C · {todayTotal.f}g F ·{" "}
            {meals.length} meals
          </p>
        </div>
        <div className="flex gap-2">
          <button className="h-11 px-3 rounded-xl glass flex items-center gap-1.5 text-sm font-medium">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button
            onClick={() => onFlow("home")}
            className="h-11 px-4 rounded-xl bg-macro-green text-ink-950 font-semibold flex items-center gap-1.5 shadow-glow text-sm"
          >
            <Plus className="w-4 h-4" />
            Add meal
          </button>
        </div>
      </div>

      {/* Segmented tabs */}
      <div className="glass-card p-1.5 grid grid-cols-3 gap-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition ${
                active
                  ? "bg-white/12 text-white border border-white/10"
                  : "text-white/55 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-macro-green" : ""}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "log" && <LogView meals={meals} todayTotal={todayTotal} />}
      {tab === "plan" && <PlanView onFlow={onFlow} />}
      {tab === "shop" && <ShopView />}
    </div>
  );
}

function LogView({ meals, todayTotal }) {
  return (
    <div className="space-y-4">
      <DayGroup
        date="Today · Apr 18"
        hit={todayTotal.p >= 160}
        total={todayTotal}
        items={meals}
        active
      />
      {mealHistory.map((day) => (
        <DayGroup key={day.date} {...day} />
      ))}
    </div>
  );
}

function DayGroup({ date, hit, total, items, active }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{date}</p>
          {active && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-macro-green text-ink-950">
              LIVE
            </span>
          )}
          {!active && hit && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-macro-green/20 text-macro-green border border-macro-green/30">
              Goal hit
            </span>
          )}
          {!active && !hit && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-macro-peach/20 text-macro-peach border border-macro-peach/30">
              Short 28g P
            </span>
          )}
        </div>
        <div className="text-right text-[11px] text-white/55">
          <span className="text-white font-semibold text-sm">{total.cal}</span>{" "}
          kcal · {total.p}g P
        </div>
      </div>
      <div className="divide-y divide-white/5 px-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 px-3 py-3">
            <div className="w-11 h-11 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center text-xl">
              {it.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{it.name}</p>
              <p className="text-[11px] text-white/45 mt-0.5">
                {it.slot} {it.time ? "· " + it.time : ""}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-[11px] text-white/80 justify-end">
                <Flame className="w-3 h-3 text-macro-amber" /> {it.cal}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-macro-green justify-end">
                <Drumstick className="w-3 h-3" /> {it.p}g
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanView({ onFlow }) {
  const [plan, setPlan] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.plan().then((p) => { setPlan(p); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);

  const toggle = async (id, done) => {
    setPlan((prev) => prev.map((m) => (m.id === id ? { ...m, done: !done } : m)));
    try { await api.updatePlan(id, { done: !done }); } catch {}
  };

  const doneCount = plan.filter((m) => m.done).length;
  const totalProtein = plan.reduce((a, m) => a + m.p, 0);

  return (
    <div className="space-y-4">
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-macro-green/15 blur-3xl" />
        <div className="relative flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-macro-green">
              Week plan · Apr 14–20
            </p>
            <h3 className="text-lg font-semibold mt-0.5">
              {doneCount}/{plan.length || 0} dinners planned & cooked
            </h3>
            <p className="text-[11px] text-white/55 mt-0.5">
              Total planned protein: {totalProtein}g · agent-curated
            </p>
          </div>
          <button
            onClick={() => onFlow("home")}
            className="h-10 px-3 rounded-xl bg-macro-green/15 border border-macro-green/35 text-macro-green text-sm font-semibold flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Re-plan
          </button>
        </div>
      </div>

      {!loaded && (
        <p className="text-center text-xs text-white/40 py-6">Loading plan…</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {plan.map((m) => (
          <button
            key={m.id}
            onClick={() => toggle(m.id, m.done)}
            className={`glass-card p-4 relative overflow-hidden text-left bento-hover active:scale-[0.99] ${
              m.tonight ? "ring-1 ring-macro-green/40 shadow-glow" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-white/45">
                {m.day} · {m.slot}
              </span>
              {m.done && (
                <span className="w-5 h-5 rounded-full bg-macro-green flex items-center justify-center">
                  <Check className="w-3 h-3 text-ink-950 stroke-[3]" />
                </span>
              )}
              {m.tonight && !m.done && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-macro-green text-ink-950">
                  Tonight
                </span>
              )}
              {m.agent && !m.tonight && !m.done && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-macro-violet/20 text-macro-violet border border-macro-violet/30 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  Agent
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center text-xl">
                {m.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${m.done ? "line-through text-white/55" : ""}`}>{m.name}</p>
                <p className="text-[11px] text-white/55">
                  {m.cal} kcal · {m.p}g protein
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ShopView() {
  const [shopping, setShopping] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = () =>
    api.shopping()
      .then((s) => { setShopping(s); setLoaded(true); })
      .catch(() => setLoaded(true));

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    const current = shopping.find((s) => s.id === id);
    if (!current) return;
    const nextChecked = !current.checked;
    setShopping((prev) => prev.map((s) => (s.id === id ? { ...s, checked: nextChecked } : s)));
    try { await api.updateShop(id, { checked: nextChecked }); } catch {}
  };

  const remove = async (id, e) => {
    e?.stopPropagation?.();
    setShopping((prev) => prev.filter((s) => s.id !== id));
    try { await api.delShop(id); } catch {}
  };

  const add = async () => {
    const name = prompt("Item name?");
    if (!name) return;
    const qty = prompt("Quantity (e.g. '1 kg', '2 pcs')?") || "";
    const aisle = prompt("Aisle (Meat / Produce / Pantry / Dairy / Grains / Other)?") || "Other";
    setAdding(true);
    try { await api.addShop({ name, qty, aisle }); await load(); } catch {}
    setAdding(false);
  };

  const byAisle = shopping.reduce((acc, item) => {
    (acc[item.aisle] = acc[item.aisle] || []).push(item);
    return acc;
  }, {});

  const remaining = shopping.filter((s) => !s.checked).length;

  return (
    <div className="space-y-4">
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-macro-amber/15 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-macro-amber">
              Shopping list · Trader Joe's
            </p>
            <h3 className="text-lg font-semibold mt-0.5">
              {remaining} items to grab
            </h3>
            <p className="text-[11px] text-white/55 mt-0.5">
              Built from your week plan + low-stock pantry
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={add}
              disabled={adding}
              className="h-10 px-3 rounded-xl bg-macro-green/15 border border-macro-green/35 text-macro-green text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add item
            </button>
            <button className="h-10 px-3 rounded-xl bg-macro-amber/15 border border-macro-amber/35 text-macro-amber text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Order delivery
            </button>
          </div>
        </div>
      </div>

      {!loaded && (
        <p className="text-center text-xs text-white/40 py-6">Loading shopping list…</p>
      )}

      {Object.entries(byAisle).map(([aisle, items]) => (
        <div key={aisle} className="glass-card overflow-hidden">
          <div className="px-5 py-2.5 border-b border-white/5 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">
              {aisle}
            </p>
            <span className="text-[10px] text-white/40">
              {items.filter((i) => !i.checked).length} left
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {items.map((item) => (
              <div
                key={item.id}
                className={`group w-full flex items-center gap-3 px-5 py-3 text-left transition ${
                  item.checked ? "opacity-50" : "hover:bg-white/3"
                }`}
              >
                <button
                  onClick={() => toggle(item.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    item.checked
                      ? "bg-macro-green border-macro-green"
                      : "border-white/20"
                  }`}
                >
                  {item.checked && (
                    <Check className="w-3.5 h-3.5 text-ink-950 stroke-[3]" />
                  )}
                </button>
                <button
                  onClick={() => toggle(item.id)}
                  className={`flex-1 text-sm text-left ${
                    item.checked ? "line-through text-white/50" : "text-white"
                  }`}
                >
                  {item.name}
                </button>
                {item.urgent && !item.checked && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-macro-peach/20 text-macro-peach border border-macro-peach/30 flex items-center gap-0.5">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Urgent
                  </span>
                )}
                <span className="text-[11px] text-white/45 w-20 text-right">
                  {item.qty}
                </span>
                <button
                  onClick={(e) => remove(item.id, e)}
                  className="text-[10px] text-white/30 hover:text-macro-peach opacity-0 group-hover:opacity-100 transition px-1"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
