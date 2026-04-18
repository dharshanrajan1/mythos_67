import { useState } from "react";
import {
  Target,
  Flame,
  Dumbbell,
  Scale,
  Bell,
  Link,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useAppState } from "../lib/AppState.jsx";

export default function ProfileScreen({ user }) {
  const { me, refresh, showToast } = useAppState();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: me?.name ?? user.name,
    handle: me?.handle ?? user.handle,
    weightKg: me?.weightKg ?? user.weightKg,
    heightCm: me?.heightCm ?? user.heightCm,
    targetWeightKg: me?.targetWeightKg ?? user.targetWeightKg,
  });

  const saveProfile = async () => {
    try {
      await api.updateMe({
        name: form.name,
        handle: form.handle,
        weightKg: Number(form.weightKg) || 0,
        heightCm: Number(form.heightCm) || 0,
        targetWeightKg: Number(form.targetWeightKg) || 0,
      });
      showToast?.("Profile updated");
      await refresh?.();
      setEditing(false);
    } catch {}
  };

  const updateTarget = async (key, current, unit) => {
    const next = prompt(`New ${key} target (${unit})?`, String(current));
    if (!next) return;
    const n = Number(next);
    if (!Number.isFinite(n) || n <= 0) return;
    try {
      await api.updateMe({ targets: { [key]: n } });
      showToast?.(`${key} goal updated`);
      await refresh?.();
    } catch {}
  };

  const targets = me?.targets ?? {
    calories: user.today.calories.target,
    protein: user.today.protein.target,
    carbs: user.today.carbs.target,
    fat: user.today.fat.target,
  };

  return (
    <div className="animate-float-up grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
      {/* Identity */}
      <section className="lg:col-span-5">
        <div className="glass-card p-5 lg:p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-macro-green/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-macro-green to-macro-amber flex items-center justify-center text-3xl font-bold text-ink-950 shadow-glow">
                {(form.name || "M")[0]}
              </div>
              <button
                onClick={() => setEditing((v) => !v)}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-ink-900 border border-white/10 flex items-center justify-center"
              >
                {editing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/6 border border-white/10 rounded-lg px-2 py-1 text-lg font-semibold outline-none focus:border-macro-green/50"
                />
              ) : (
                <h2 className="text-xl font-semibold">{form.name}</h2>
              )}
              {editing ? (
                <input
                  value={form.handle}
                  onChange={(e) => setForm({ ...form, handle: e.target.value })}
                  className="mt-1 w-full bg-white/4 border border-white/8 rounded-lg px-2 py-0.5 text-xs text-white/70 outline-none"
                />
              ) : (
                <p className="text-xs text-white/55">{form.handle}</p>
              )}
              <div className="flex items-center gap-1.5 mt-2">
                <Flame className="w-3.5 h-3.5 text-macro-amber" />
                <span className="text-xs font-medium">
                  {user.streak}-day streak
                </span>
                <span className="text-white/25 text-xs">·</span>
                <span className="text-xs text-white/55">
                  {user.joinedDays}d tracked
                </span>
              </div>
            </div>
          </div>

          <div className="relative grid grid-cols-3 gap-2 mt-5">
            <EditableStat
              label="Weight"
              unit="kg"
              value={form.weightKg}
              editing={editing}
              onChange={(v) => setForm({ ...form, weightKg: v })}
            />
            <EditableStat
              label="Height"
              unit="cm"
              value={form.heightCm}
              editing={editing}
              onChange={(v) => setForm({ ...form, heightCm: v })}
            />
            <EditableStat
              label="Target"
              unit="kg"
              value={form.targetWeightKg}
              accent
              editing={editing}
              onChange={(v) => setForm({ ...form, targetWeightKg: v })}
            />
          </div>

          {editing && (
            <button
              onClick={saveProfile}
              className="relative mt-4 w-full h-10 rounded-xl bg-macro-green/25 border border-macro-green/45 text-macro-green font-semibold text-sm flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save profile
            </button>
          )}
        </div>
      </section>

      {/* Goals */}
      <section className="lg:col-span-7">
        <div className="glass-card p-5 lg:p-6 h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-macro-green" />
              <h3 className="text-sm font-semibold">Daily macro goals</h3>
            </div>
            <button className="text-[11px] text-macro-green hover:text-macro-mint transition flex items-center gap-1">
              Re-plan with agent <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <GoalTile
              label="Calories"
              value={targets.calories}
              unit="kcal"
              color="#34E39F"
              onEdit={() => updateTarget("calories", targets.calories, "kcal")}
            />
            <GoalTile
              label="Protein"
              value={targets.protein}
              unit="g"
              color="#FFB655"
              active
              onEdit={() => updateTarget("protein", targets.protein, "g")}
            />
            <GoalTile
              label="Carbs"
              value={targets.carbs}
              unit="g"
              color="#5FD8FF"
              onEdit={() => updateTarget("carbs", targets.carbs, "g")}
            />
            <GoalTile
              label="Fat"
              value={targets.fat}
              unit="g"
              color="#A78BFA"
              onEdit={() => updateTarget("fat", targets.fat, "g")}
            />
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-gradient-to-br from-macro-green/10 to-transparent border border-macro-green/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-macro-green/20 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-macro-green" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Plan: High-protein · Strength</p>
              <p className="text-[11px] text-white/55">
                3,500 kcal cycle · auto-adjusts on workout days
              </p>
            </div>
            <button
              onClick={async () => {
                const plans = ["High-protein · Strength", "Cut · Recomposition", "Maintain · Lifestyle"];
                const choice = prompt(`Switch plan:\n${plans.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\nEnter 1-3:`);
                const i = Number(choice) - 1;
                if (!plans[i]) return;
                try {
                  await api.updateMe({ plan: plans[i] });
                  showToast?.(`Plan: ${plans[i]}`);
                  await refresh?.();
                } catch {}
              }}
              className="text-[11px] px-3 py-1.5 rounded-full bg-white/8 hover:bg-white/12 transition"
            >
              Switch
            </button>
          </div>
        </div>
      </section>

      {/* Settings groups */}
      <section className="lg:col-span-6 space-y-3">
        <SettingsGroup
          title="Preferences"
          items={[
            { icon: <Bell className="w-4 h-4 text-macro-amber" />, label: "Reminders", value: "3 active" },
            { icon: <Scale className="w-4 h-4 text-macro-cyan" />, label: "Units", value: "Metric" },
            { icon: <Target className="w-4 h-4 text-macro-green" />, label: "Weight goal cadence", value: "Weekly" },
          ]}
        />
        <SettingsGroup
          title="Agent"
          items={[
            { icon: <Dumbbell className="w-4 h-4 text-macro-violet" />, label: "Strength coach", value: "On" },
            { icon: <ShieldCheck className="w-4 h-4 text-macro-green" />, label: "Photo privacy", value: "On-device" },
            { icon: <Target className="w-4 h-4 text-macro-amber" />, label: "Goal focus", value: "Protein" },
          ]}
        />
      </section>

      <section className="lg:col-span-6 space-y-3">
        <SettingsGroup
          title="Connections"
          items={[
            { icon: <Link className="w-4 h-4 text-macro-cyan" />, label: "Apple Health", value: "Connected" },
            { icon: <Link className="w-4 h-4 text-macro-violet" />, label: "Whoop", value: "Connect" },
            { icon: <Link className="w-4 h-4 text-macro-amber" />, label: "MyFitnessPal import", value: "Done" },
          ]}
        />

        <div className="glass-card p-2">
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition text-macro-peach">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>

        <p className="text-center text-[10px] text-white/30 leading-relaxed">
          MacroAgent v0.9.0 ·{" "}
          <span className="text-macro-green">GPT-5.4 vision</span> ·
          Nutrition data from{" "}
          <a
            href="https://foodb.ca/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted hover:text-white/60"
          >
            FooDB
          </a>
        </p>
      </section>
    </div>
  );
}

function EditableStat({ label, value, unit, accent, editing, onChange }) {
  return (
    <div
      className={`p-3 rounded-xl text-center ${
        accent ? "bg-macro-green/15 border border-macro-green/30" : "bg-white/5 border border-white/8"
      }`}
    >
      {editing ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-transparent text-base font-semibold text-center outline-none ${
            accent ? "text-macro-green" : "text-white"
          }`}
        />
      ) : (
        <p className={`text-base font-semibold ${accent ? "text-macro-green" : "text-white"}`}>
          {value}
          <span className="text-xs text-white/50 font-normal ml-0.5">{unit}</span>
        </p>
      )}
      <p className="text-[10px] uppercase tracking-wider text-white/45 mt-0.5">
        {label}
      </p>
    </div>
  );
}

function GoalTile({ label, value, unit, color, active, onEdit }) {
  return (
    <button
      onClick={onEdit}
      className="p-3.5 rounded-2xl border bento-hover text-left active:scale-[0.98] transition"
      style={{
        background: active ? `${color}18` : "rgba(255,255,255,0.04)",
        borderColor: active ? `${color}50` : "rgba(255,255,255,0.08)",
        boxShadow: active ? `0 0 20px ${color}25` : "none",
      }}
    >
      <p
        className="text-[10px] uppercase tracking-wider"
        style={{ color: active ? color : "rgba(255,255,255,0.5)" }}
      >
        {label}
      </p>
      <p className="text-lg font-semibold mt-0.5">
        {value}
        <span className="text-xs text-white/50 font-normal ml-1">{unit}</span>
      </p>
      <p className="text-[9px] text-white/30 mt-1">tap to edit</p>
    </button>
  );
}

function SettingsGroup({ title, items }) {
  return (
    <div className="glass-card overflow-hidden">
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/45 px-5 pt-4 pb-2">
        {title}
      </p>
      <div className="divide-y divide-white/5">
        {items.map((it, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/4 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center">
              {it.icon}
            </div>
            <span className="text-sm font-medium text-left">{it.label}</span>
            <div className="flex-1" />
            <span className="text-[12px] text-white/50">{it.value}</span>
            <ChevronRight className="w-4 h-4 text-white/30" />
          </button>
        ))}
      </div>
    </div>
  );
}
