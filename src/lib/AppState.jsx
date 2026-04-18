import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api.js";

const Ctx = createContext(null);
export const useAppState = () => useContext(Ctx);

const fmtTime = (ts) =>
  new Date(ts ?? Date.now()).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

function toDashboardUser(me, today, targets) {
  const t = today?.totals || { cal: 0, p: 0, c: 0, f: 0 };
  const tg = me?.targets || targets || { calories: 2500, protein: 160, carbs: 280, fat: 80, water: 3 };
  return {
    name: me?.name ?? "Wei",
    handle: me?.handle ?? "",
    goal: me?.goal ?? "Strength Training",
    plan: me?.plan ?? "",
    streak: me?.streak ?? 0,
    joinedDays: me?.joinedDays ?? 0,
    weightKg: me?.weightKg ?? 0,
    heightCm: me?.heightCm ?? 0,
    targetWeightKg: me?.targetWeightKg ?? 0,
    today: {
      calories: { current: t.cal, target: tg.calories },
      protein:  { current: t.p,   target: tg.protein  },
      carbs:    { current: t.c,   target: tg.carbs    },
      fat:      { current: t.f,   target: tg.fat      },
      water:    { current: today?.water ?? 0, target: tg.water },
    },
  };
}

export function AppStateProvider({ children }) {
  const [me, setMe] = useState(null);
  const [today, setToday] = useState(null);
  const [meals, setMeals] = useState([]);
  const [toast, setToast] = useState(null);

  const loadCore = useCallback(async () => {
    try {
      const [meR, todayR] = await Promise.all([api.me(), api.today()]);
      setMe(meR);
      setToday(todayR);
      setMeals(
        (todayR.meals || []).map((m) => ({
          id: m.id, slot: m.slot, time: m.time, name: m.name, emoji: m.emoji,
          cal: m.cal, p: m.p, c: m.c, f: m.f, source: m.source,
        }))
      );
    } catch (err) {
      console.warn("[AppState] core load failed, using local defaults:", err);
    }
  }, []);

  useEffect(() => { loadCore(); }, [loadCore]);

  const showToast = useCallback((message) => setToast({ message, id: Date.now() }), []);
  const closeToast = useCallback(() => setToast(null), []);

  const addMeal = useCallback(
    async ({ calories, protein, carbs, fat, name, emoji, slot, source = "agent" }) => {
      const payload = {
        name: name || "Logged meal",
        emoji: emoji || "🍽️",
        slot: slot || "Just now",
        time: fmtTime(),
        cal: calories, p: protein, c: carbs, f: fat,
        source,
      };
      try {
        await api.addMeal(payload);
        showToast(`Logged · +${protein}g protein`);
      } catch (err) {
        console.warn("addMeal failed:", err);
      }
      await loadCore();
    },
    [loadCore, showToast]
  );

  const deleteMeal = useCallback(async (id) => {
    try { await api.delMeal(id); } catch {}
    await loadCore();
  }, [loadCore]);

  const addWater = useCallback(async (amount_l = 0.25) => {
    try {
      await api.addWater(amount_l);
      showToast(`+${amount_l}L water`);
    } catch {}
    await loadCore();
  }, [loadCore, showToast]);

  const value = {
    me,
    today,
    meals,
    user: toDashboardUser(me, today, me?.targets),
    toast,
    showToast,
    closeToast,
    addMeal,
    deleteMeal,
    addWater,
    refresh: loadCore,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
