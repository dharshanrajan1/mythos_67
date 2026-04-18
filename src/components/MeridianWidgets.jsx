import { useEffect, useState } from "react";
import {
  Dumbbell,
  BookOpen,
  CalendarClock,
  Plus,
  Check,
  Trophy,
  Sparkles,
  Lightbulb,
  X,
} from "lucide-react";
import { api } from "../lib/api.js";

/* Fitness card — pulls real workout from the API and toggles exercise state. */
export function WorkoutCard() {
  const [w, setW] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = () => api.workout().then(setW).catch(() => {});
  useEffect(() => { load(); }, []);

  const toggle = async (id, done) => {
    setBusy(id);
    setW((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) => (e.id === id ? { ...e, done: !done } : e)),
            completed: prev.exercises.reduce(
              (acc, e) => acc + (e.id === id ? (!done ? 1 : 0) : e.done ? 1 : 0),
              0
            ),
          }
        : prev
    );
    try { await api.toggleEx(id, { done: !done }); } catch {}
    setBusy(null);
  };

  if (!w) {
    return (
      <div className="glass-card p-5 h-full flex items-center justify-center text-xs text-white/40">
        Loading workout…
      </div>
    );
  }

  const pct = w.totalExercises ? (w.completed / w.totalExercises) * 100 : 0;
  const nextEx = w.exercises.find((e) => !e.done);

  return (
    <div className="glass-card p-5 relative overflow-hidden h-full">
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-macro-violet/20 blur-3xl" />
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-macro-violet" />
          <span className="text-[11px] uppercase tracking-[0.22em] text-macro-violet">
            Tonight's workout
          </span>
        </div>
        <span className="text-[10px] text-white/45">{w.time}</span>
      </div>
      <h3 className="text-lg font-semibold">{w.name}</h3>
      <p className="text-[11px] text-white/50 mt-0.5">
        Burns ≈ {w.estKcalBurn} kcal · {w.totalExercises} exercises
      </p>

      <div className="mt-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-white/50">
            Progress
          </span>
          <span className="text-[11px] text-white/80 font-medium">
            {w.completed}/{w.totalExercises}
          </span>
        </div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, rgba(167,139,250,0.5), #A78BFA)",
              boxShadow: "0 0 10px rgba(167,139,250,0.8)",
            }}
          />
        </div>
      </div>

      <ul className="mt-3 space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
        {w.exercises.map((ex) => (
          <li key={ex.id} className="flex items-center gap-2 text-[12px]">
            <button
              onClick={() => toggle(ex.id, ex.done)}
              disabled={busy === ex.id}
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition ${
                ex.done
                  ? "bg-macro-violet border-macro-violet text-ink-950"
                  : "border-white/20 hover:border-macro-violet/70"
              }`}
            >
              {ex.done && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <span className={`flex-1 truncate ${ex.done ? "text-white/45 line-through" : "text-white/85"}`}>
              {ex.name}
            </span>
            {ex.pr && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-macro-amber/20 text-macro-amber border border-macro-amber/30 flex items-center gap-0.5">
                <Trophy className="w-2.5 h-2.5" /> PR
              </span>
            )}
            <span className="text-[10px] text-white/40">{ex.sets}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => nextEx && toggle(nextEx.id, false)}
        disabled={!nextEx}
        className="mt-3 w-full h-10 rounded-xl bg-macro-violet/20 border border-macro-violet/40 text-macro-violet font-semibold text-sm hover:bg-macro-violet/30 transition disabled:opacity-50"
      >
        {nextEx ? `Log next · ${nextEx.name}` : "All done 🎉"}
      </button>
    </div>
  );
}

/* Diary + mind-dump — pulls and writes to /api/diary and /api/minddump. */
export function DiaryCard() {
  const [text, setText] = useState("");
  const [goodDay, setGoodDay] = useState(true);
  const [mood, setMood] = useState("💪");
  const [recent, setRecent] = useState([]);
  const [dumps, setDumps] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const load = async () => {
    try {
      const [d, m] = await Promise.all([api.diary(), api.mindDumps()]);
      const todays = d.find((e) => e.day === today);
      if (todays) {
        setText(todays.body || "");
        setGoodDay(!!todays.goodDay);
        setMood(todays.mood || "💪");
      }
      setRecent(d.filter((e) => e.day !== today).slice(0, 2));
      setDumps(m);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.saveDiary({ day: today, mood, goodDay, body: text });
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    } catch {}
    setSaving(false);
  };

  const addDump = async () => {
    const t = prompt("Capture a thought:");
    if (!t?.trim()) return;
    try {
      const created = await api.addMind(t.trim());
      setDumps((prev) => [{ id: created.id, text: created.text }, ...prev]);
    } catch {}
  };

  const delDump = async (id) => {
    setDumps((prev) => prev.filter((d) => d.id !== id));
    try { await api.delMind(id); } catch {}
  };

  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-macro-cyan" />
          <span className="text-[11px] uppercase tracking-[0.22em] text-macro-cyan">
            Diary · Today
          </span>
        </div>
        <button
          onClick={() => setGoodDay((v) => !v)}
          className={`text-[10px] px-2 py-1 rounded-full border flex items-center gap-1 transition ${
            goodDay
              ? "bg-macro-green/20 border-macro-green/40 text-macro-green"
              : "bg-white/5 border-white/10 text-white/50"
          }`}
        >
          {goodDay ? "Good day ✨" : "Mark good day"}
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="How did today's fuel feel? Cravings, energy, mood…"
        rows={2}
        className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-sm placeholder:text-white/35 outline-none focus:border-macro-cyan/50 resize-none"
      />
      <div className="mt-2 flex items-center gap-2">
        <div className="flex gap-1">
          {["💪", "😌", "😐", "😤", "🔥"].map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition ${
                mood === m ? "bg-macro-cyan/25 ring-1 ring-macro-cyan/50" : "bg-white/4 hover:bg-white/8"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`ml-auto h-8 px-3 rounded-lg text-[11px] font-semibold transition ${
            saved
              ? "bg-macro-green/20 text-macro-green border border-macro-green/40"
              : "bg-macro-cyan/20 text-macro-cyan border border-macro-cyan/40 hover:bg-macro-cyan/30"
          } disabled:opacity-50`}
        >
          {saved ? "Saved ✓" : saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-macro-amber" />
          <span className="text-[10px] uppercase tracking-wider text-white/50">
            Mind dump
          </span>
        </div>
        <div className="space-y-1.5">
          {dumps.map((i) => (
            <div
              key={i.id}
              className="group flex items-center gap-2 text-[12px] text-white/75 px-2.5 py-1.5 rounded-lg bg-white/4 border border-white/5"
            >
              <span className="flex-1 truncate">{i.text}</span>
              <button
                onClick={() => delDump(i.id)}
                className="text-white/30 hover:text-macro-peach opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={addDump}
            className="w-full flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 px-2.5 py-1"
          >
            <Plus className="w-3 h-3" /> Capture a thought
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
        {recent.map((e) => (
          <div key={e.id} className="flex items-start gap-2 text-[11px]">
            <span className="text-base">{e.mood}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white/45 text-[10px]">{e.day}</p>
              <p className="text-white/75 truncate">{e.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Goal countdown — reads live goal from backend. */
export function CountdownCard() {
  const [g, setG] = useState(null);
  useEffect(() => { api.goal().then(setG).catch(() => {}); }, []);

  if (!g) {
    return (
      <div className="glass-card p-5 h-full flex items-center justify-center text-xs text-white/40">
        Loading goal…
      </div>
    );
  }

  return (
    <div className="glass-card p-5 relative overflow-hidden h-full">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-macro-amber/20 blur-3xl" />
      <div className="relative flex items-center gap-2 mb-3">
        <CalendarClock className="w-4 h-4 text-macro-amber" />
        <span className="text-[11px] uppercase tracking-[0.22em] text-macro-amber">
          Goal countdown
        </span>
      </div>
      <h3 className="relative text-lg font-semibold">{g.label}</h3>
      <p className="relative text-[11px] text-white/55 mt-0.5">
        Target {g.targetDate} · {g.weightDelta}kg to gain
      </p>

      <div className="relative flex items-baseline gap-2 mt-4">
        <span className="text-5xl font-bold text-gradient-amber leading-none">
          {g.daysLeft}
        </span>
        <span className="text-sm text-white/55">days left</span>
      </div>

      <div className="relative mt-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-white/50">
            Progress
          </span>
          <span className="text-[11px] text-macro-amber font-semibold">
            {g.progressPct}%
          </span>
        </div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${g.progressPct}%`,
              background: "linear-gradient(90deg, #FFD58A, #FFB655)",
              boxShadow: "0 0 12px #FFB655",
            }}
          />
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-macro-green/8 border border-macro-green/25">
        <Sparkles className="w-3.5 h-3.5 text-macro-green shrink-0" />
        <p className="text-[11px] text-white/75 leading-snug">
          On pace — agent projects{" "}
          <span className="text-macro-green font-medium">
            {Math.max(0, (g.weightDelta - 0.6).toFixed(1))}kg short
          </span>{" "}
          without carb bumps on rest days.
        </p>
      </div>
    </div>
  );
}
