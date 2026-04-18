/**
 * Thin fetch wrapper for the MacroAgent backend.
 * Vite proxies /api → http://localhost:4000 in dev.
 */
const base = "";

async function j(path, opts = {}) {
  const res = await fetch(base + path, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

export const api = {
  me:       () => j("/api/me"),
  updateMe: (patch) => j("/api/me", { method: "PUT", body: JSON.stringify(patch) }),
  today:    () => j("/api/today"),
  meals:    (day) => j(`/api/meals${day ? `?day=${day}` : ""}`),
  addMeal:  (m) => j("/api/meals", { method: "POST", body: JSON.stringify(m) }),
  delMeal:  (id) => j(`/api/meals/${id}`, { method: "DELETE" }),
  addWater: (amount_l) => j("/api/water", { method: "POST", body: JSON.stringify({ amount_l }) }),
  addWeight:(kg) => j("/api/weight", { method: "POST", body: JSON.stringify({ kg }) }),

  diary:     () => j("/api/diary"),
  saveDiary: (entry) => j("/api/diary", { method: "POST", body: JSON.stringify(entry) }),

  mindDumps: () => j("/api/minddump"),
  addMind:   (text) => j("/api/minddump", { method: "POST", body: JSON.stringify({ text }) }),
  delMind:   (id) => j(`/api/minddump/${id}`, { method: "DELETE" }),

  shopping:    () => j("/api/shopping"),
  addShop:     (item) => j("/api/shopping", { method: "POST", body: JSON.stringify(item) }),
  updateShop:  (id, patch) => j(`/api/shopping/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  delShop:     (id) => j(`/api/shopping/${id}`, { method: "DELETE" }),

  plan:       () => j("/api/plan"),
  updatePlan: (id, patch) => j(`/api/plan/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

  workout:      () => j("/api/workout/today"),
  toggleEx:     (id, patch) => j(`/api/workout/exercise/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

  goal:        () => j("/api/goal"),
  updateGoal:  (g) => j("/api/goal", { method: "PUT", body: JSON.stringify(g) }),

  weekly:       () => j("/api/stats/weekly"),
  recap:        () => j("/api/stats/recap"),
  achievements: () => j("/api/achievements"),
  agentActions: () => j("/api/agent/actions"),

  venues:      () => j("/api/venues"),
  venueMenu:   (id) => j(`/api/venues/${id}/menu`),
  foodb:       (name) => j(`/api/foodb?name=${encodeURIComponent(name)}`),

  /* Vision + chat */
  scanMock:    () => j("/api/agent/scan", { method: "POST" }),
  scanReal:    async (file) => {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch("/api/agent/scan-real", { method: "POST", body: form });
    if (!res.ok) throw new Error(`scan ${res.status}`);
    return res.json();
  },
  /**
   * Open an SSE stream of assistant tokens. onDelta(str) fires per chunk,
   * onDone(meta) fires when the stream closes, onError(err) for failures.
   * Returns an AbortController you can call .abort() on.
   */
  chatStream: ({ messages, onDelta, onDone, onError }) => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) throw new Error(`chat ${res.status}`);
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const events = buf.split("\n\n");
          buf = events.pop() || "";
          for (const block of events) {
            const ev = {};
            for (const line of block.split("\n")) {
              const [k, ...rest] = line.split(":");
              ev[k.trim()] = rest.join(":").trim();
            }
            if (!ev.event) continue;
            try {
              const data = JSON.parse(ev.data || "{}");
              if (ev.event === "delta" && data.content) onDelta?.(data.content);
              if (ev.event === "done") onDone?.(data);
              if (ev.event === "error") onError?.(data);
            } catch {
              /* ignore */
            }
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") onError?.({ detail: String(err?.message || err) });
      }
    })();
    return ctrl;
  },
};
