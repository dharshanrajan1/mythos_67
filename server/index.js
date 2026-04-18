import express from "express";
import cors from "cors";
import multer from "multer";
import "dotenv/config";
import db from "./db.js";
import "./seed.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "12mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const PORT = process.env.PORT || 4000;
const iso = () => new Date().toISOString().slice(0, 10);
const rid = (p = "id") => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

function toMeal(r) {
  return {
    id: r.id, day: r.day, slot: r.slot, time: r.time, name: r.name, emoji: r.emoji,
    cal: r.cal, p: r.p, c: r.c, f: r.f, source: r.source, createdAt: r.created_at,
  };
}

/* ----------- Profile ----------- */
app.get("/api/me", (_req, res) => {
  const p = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  res.json({
    name: p.name, handle: p.handle, goal: p.goal, plan: p.plan,
    streak: p.streak, joinedDays: p.joined_days,
    weightKg: p.weight_kg, heightCm: p.height_cm, targetWeightKg: p.target_weight_kg,
    targets: {
      calories: p.target_calories, protein: p.target_protein,
      carbs: p.target_carbs, fat: p.target_fat, water: p.target_water,
    },
  });
});

app.put("/api/me", (req, res) => {
  const b = req.body || {};
  const fields = [];
  const vals = [];
  const map = {
    name: "name", handle: "handle", goal: "goal", plan: "plan",
    weightKg: "weight_kg", heightCm: "height_cm", targetWeightKg: "target_weight_kg",
  };
  for (const [k, col] of Object.entries(map)) {
    if (b[k] !== undefined) { fields.push(`${col} = ?`); vals.push(b[k]); }
  }
  if (b.targets) {
    const tMap = { calories: "target_calories", protein: "target_protein", carbs: "target_carbs", fat: "target_fat", water: "target_water" };
    for (const [k, col] of Object.entries(tMap)) {
      if (b.targets[k] !== undefined) { fields.push(`${col} = ?`); vals.push(b.targets[k]); }
    }
  }
  if (fields.length) {
    db.prepare(`UPDATE profile SET ${fields.join(", ")} WHERE id = 1`).run(...vals);
  }
  res.json({ ok: true });
});

/* ----------- Today aggregate ----------- */
app.get("/api/today", (_req, res) => {
  const day = iso();
  const p = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  const meals = db.prepare("SELECT * FROM meals WHERE day = ? ORDER BY created_at ASC").all(day).map(toMeal);

  const totals = meals.reduce(
    (acc, m) => ({ cal: acc.cal + m.cal, p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f }),
    { cal: 0, p: 0, c: 0, f: 0 }
  );
  const waterRow = db.prepare("SELECT COALESCE(SUM(amount_l), 0) as l FROM water_logs WHERE day = ?").get(day);

  res.json({
    day,
    meals,
    totals,
    today: {
      calories: { current: totals.cal, target: p.target_calories },
      protein: { current: totals.p, target: p.target_protein },
      carbs: { current: totals.c, target: p.target_carbs },
      fat: { current: totals.f, target: p.target_fat },
      water: { current: waterRow.l, target: p.target_water },
    },
  });
});

/* ----------- Meals ----------- */
app.get("/api/meals", (req, res) => {
  const day = req.query.day;
  const rows = day
    ? db.prepare("SELECT * FROM meals WHERE day = ? ORDER BY created_at ASC").all(day)
    : db.prepare("SELECT * FROM meals ORDER BY created_at DESC LIMIT 200").all();
  res.json(rows.map(toMeal));
});

app.post("/api/meals", (req, res) => {
  const b = req.body || {};
  if (!b.name || b.cal == null) return res.status(400).json({ error: "name + cal required" });
  const id = b.id || rid("m");
  const day = b.day || iso();
  const createdAt = Date.now();
  const time = b.time || new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  db.prepare(
    `INSERT INTO meals (id, day, slot, time, name, emoji, cal, p, c, f, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, day, b.slot || "Just now", time, b.name, b.emoji || "🍽️",
        b.cal | 0, b.p | 0, b.c | 0, b.f | 0, b.source || "manual", createdAt);
  logAction("log", `Logged ${b.name}`, { id, cal: b.cal, p: b.p });
  res.json(toMeal(db.prepare("SELECT * FROM meals WHERE id = ?").get(id)));
});

app.delete("/api/meals/:id", (req, res) => {
  db.prepare("DELETE FROM meals WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

app.get("/api/meals/history", (_req, res) => {
  const today = iso();
  const rows = db.prepare(`SELECT * FROM meals WHERE day != ? ORDER BY day DESC, created_at ASC`).all(today);
  const byDay = new Map();
  for (const r of rows) {
    if (!byDay.has(r.day)) byDay.set(r.day, { date: r.day, items: [], total: { cal: 0, p: 0, c: 0, f: 0 } });
    const d = byDay.get(r.day);
    d.items.push(toMeal(r));
    d.total.cal += r.cal; d.total.p += r.p; d.total.c += r.c; d.total.f += r.f;
  }
  const p = db.prepare("SELECT target_protein FROM profile WHERE id = 1").get();
  const out = [...byDay.values()].map((d) => ({ ...d, hit: d.total.p >= p.target_protein }));
  res.json(out);
});

/* ----------- Water ----------- */
app.post("/api/water", (req, res) => {
  const amount = Number(req.body?.amount_l ?? 0.25);
  db.prepare("INSERT INTO water_logs (id, day, amount_l, created_at) VALUES (?, ?, ?, ?)")
    .run(rid("w"), iso(), amount, Date.now());
  res.json({ ok: true });
});

/* ----------- Weight ----------- */
app.get("/api/weight", (_req, res) => {
  const rows = db.prepare("SELECT * FROM weight_logs ORDER BY day ASC").all();
  res.json(rows.map((r) => ({ d: r.day.slice(5).replace("-", "/"), kg: r.kg })));
});

app.post("/api/weight", (req, res) => {
  const kg = Number(req.body?.kg);
  if (!kg) return res.status(400).json({ error: "kg required" });
  db.prepare("INSERT INTO weight_logs (id, day, kg, created_at) VALUES (?, ?, ?, ?)")
    .run(rid("kg"), iso(), kg, Date.now());
  db.prepare("UPDATE profile SET weight_kg = ? WHERE id = 1").run(kg);
  res.json({ ok: true });
});

/* ----------- Diary ----------- */
app.get("/api/diary", (_req, res) => {
  const rows = db.prepare("SELECT * FROM diary ORDER BY day DESC LIMIT 60").all();
  res.json(rows.map((r) => ({
    id: r.id, day: r.day, mood: r.mood, goodDay: !!r.good_day, body: r.body,
  })));
});

app.post("/api/diary", (req, res) => {
  const b = req.body || {};
  const day = b.day || iso();
  const id = `d_${day}`;
  db.prepare(`
    INSERT INTO diary (id, day, mood, good_day, body, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(day) DO UPDATE SET mood = excluded.mood, good_day = excluded.good_day, body = excluded.body
  `).run(id, day, b.mood || "💪", b.goodDay ? 1 : 0, b.body || "", Date.now());
  res.json({ ok: true });
});

/* ----------- Mind dumps ----------- */
app.get("/api/minddump", (_req, res) => {
  const rows = db.prepare("SELECT * FROM mind_dumps ORDER BY created_at DESC LIMIT 20").all();
  res.json(rows.map((r) => ({ id: r.id, text: r.text })));
});

app.post("/api/minddump", (req, res) => {
  const text = String(req.body?.text || "").trim();
  if (!text) return res.status(400).json({ error: "text required" });
  const id = rid("i");
  db.prepare("INSERT INTO mind_dumps (id, text, created_at) VALUES (?, ?, ?)")
    .run(id, text, Date.now());
  res.json({ id, text });
});

app.delete("/api/minddump/:id", (req, res) => {
  db.prepare("DELETE FROM mind_dumps WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

/* ----------- Shopping ----------- */
app.get("/api/shopping", (_req, res) => {
  const rows = db.prepare("SELECT * FROM shopping ORDER BY created_at ASC").all();
  res.json(rows.map((r) => ({
    id: r.id, name: r.name, qty: r.qty, aisle: r.aisle,
    checked: !!r.checked, urgent: !!r.urgent,
  })));
});

app.post("/api/shopping", (req, res) => {
  const b = req.body || {};
  if (!b.name) return res.status(400).json({ error: "name required" });
  const id = rid("sh");
  db.prepare(
    `INSERT INTO shopping (id, name, qty, aisle, checked, urgent, created_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`
  ).run(id, b.name, b.qty || "", b.aisle || "Other", b.urgent ? 1 : 0, Date.now());
  res.json({ ok: true });
});

app.patch("/api/shopping/:id", (req, res) => {
  const b = req.body || {};
  const cur = db.prepare("SELECT * FROM shopping WHERE id = ?").get(req.params.id);
  if (!cur) return res.status(404).end();
  db.prepare("UPDATE shopping SET checked = ?, urgent = ? WHERE id = ?")
    .run(b.checked != null ? (b.checked ? 1 : 0) : cur.checked,
         b.urgent != null ? (b.urgent ? 1 : 0) : cur.urgent,
         req.params.id);
  res.json({ ok: true });
});

app.delete("/api/shopping/:id", (req, res) => {
  db.prepare("DELETE FROM shopping WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

/* ----------- Meal plan ----------- */
app.get("/api/plan", (_req, res) => {
  const rows = db.prepare("SELECT * FROM meal_plan").all();
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  rows.sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day));
  res.json(rows.map((r) => ({
    id: r.id, day: r.day, slot: r.slot, name: r.name, emoji: r.emoji,
    cal: r.cal, p: r.p, done: !!r.done, tonight: !!r.tonight, agent: !!r.agent,
  })));
});

app.patch("/api/plan/:id", (req, res) => {
  const b = req.body || {};
  const cur = db.prepare("SELECT * FROM meal_plan WHERE id = ?").get(req.params.id);
  if (!cur) return res.status(404).end();
  db.prepare("UPDATE meal_plan SET done = ? WHERE id = ?")
    .run(b.done != null ? (b.done ? 1 : 0) : cur.done, req.params.id);
  res.json({ ok: true });
});

/* ----------- Workout ----------- */
app.get("/api/workout/today", (_req, res) => {
  const w = db.prepare("SELECT * FROM workouts ORDER BY day DESC LIMIT 1").get();
  if (!w) return res.json(null);
  const ex = db.prepare("SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY sort_order").all(w.id);
  res.json({
    id: w.id, name: w.name, time: w.time, estKcalBurn: w.est_kcal_burn,
    exercises: ex.map((e) => ({
      id: e.id, name: e.name, sets: e.sets, done: !!e.done, pr: !!e.pr,
    })),
    completed: ex.filter((e) => e.done).length,
    totalExercises: ex.length,
  });
});

app.patch("/api/workout/exercise/:id", (req, res) => {
  const b = req.body || {};
  const cur = db.prepare("SELECT * FROM workout_exercises WHERE id = ?").get(req.params.id);
  if (!cur) return res.status(404).end();
  db.prepare("UPDATE workout_exercises SET done = ? WHERE id = ?")
    .run(b.done != null ? (b.done ? 1 : 0) : (cur.done ? 0 : 1), req.params.id);
  res.json({ ok: true });
});

/* ----------- Goal ----------- */
app.get("/api/goal", (_req, res) => {
  const g = db.prepare("SELECT * FROM goals WHERE id = 1").get();
  const p = db.prepare("SELECT weight_kg, target_weight_kg FROM profile WHERE id = 1").get();
  const daysLeft = Math.max(0, Math.ceil((new Date(g.target_date) - Date.now()) / 86400_000));
  res.json({
    label: g.label, targetDate: g.target_date, progressPct: g.progress_pct,
    weightDelta: +(p.target_weight_kg - p.weight_kg).toFixed(2), daysLeft,
  });
});

app.put("/api/goal", (req, res) => {
  const b = req.body || {};
  const fields = []; const vals = [];
  if (b.label) { fields.push("label = ?"); vals.push(b.label); }
  if (b.targetDate) { fields.push("target_date = ?"); vals.push(b.targetDate); }
  if (b.progressPct != null) { fields.push("progress_pct = ?"); vals.push(b.progressPct | 0); }
  if (fields.length) db.prepare(`UPDATE goals SET ${fields.join(", ")} WHERE id = 1`).run(...vals);
  res.json({ ok: true });
});

/* ----------- Stats / recap ----------- */
app.get("/api/stats/weekly", (_req, res) => {
  const today = iso();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso2 = d.toISOString().slice(0, 10);
    const row = db
      .prepare("SELECT COALESCE(SUM(cal), 0) as cal, COALESCE(SUM(p), 0) as p FROM meals WHERE day = ?")
      .get(iso2);
    const label = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
    const p = db.prepare("SELECT target_protein, target_calories FROM profile WHERE id = 1").get();
    let hit = null;
    if (iso2 === today) hit = null;
    else if (row.cal === 0) hit = null;
    else hit = row.p >= p.target_protein;
    days.push({ day: label, cal: row.cal, p: row.p, hit, current: iso2 === today });
  }
  res.json(days);
});

app.get("/api/stats/recap", (_req, res) => {
  const p = db.prepare("SELECT target_protein FROM profile WHERE id = 1").get();
  const rows = db.prepare(`
    SELECT day, SUM(cal) as cal, SUM(p) as p, COUNT(*) as n
    FROM meals WHERE day >= date('now', '-6 days') GROUP BY day
  `).all();
  let good = 0;
  let calAvg = 0, proteinAvg = 0;
  let cooked = 0;
  rows.forEach((r) => {
    calAvg += r.cal; proteinAvg += r.p;
    if (r.p >= p.target_protein) good++;
    cooked += r.n;
  });
  const n = rows.length || 1;
  res.json({
    range: "This week",
    goodDays: good,
    totalDays: 7,
    caloriesAvg: Math.round(calAvg / n),
    proteinAvg: Math.round(proteinAvg / n),
    workouts: 5, workoutsPlanned: 6,
    cookedAtHome: cooked, atePreview: 4,
    deltaWeight: 0.4,
    highlights: [
      { tone: "green", text: `${good} days hit protein goal this week.` },
      { tone: "amber", text: "Carbs low on rest days — plan refuel meals." },
      { tone: "green", text: "New PR logged · Bench press." },
    ],
  });
});

/* ----------- Achievements / agent actions ----------- */
app.get("/api/achievements", (_req, res) => {
  const rows = db.prepare("SELECT * FROM achievements").all();
  res.json(rows.map((r) => ({ id: r.id, name: r.name, icon: r.icon, note: r.note, earned: !!r.earned })));
});

app.get("/api/agent/actions", (_req, res) => {
  const rows = db.prepare("SELECT * FROM agent_actions ORDER BY created_at DESC LIMIT 10").all();
  res.json(rows.map((r) => ({
    id: r.id, kind: r.kind, summary: r.summary, at: r.created_at,
  })));
});

function logAction(kind, summary, payload) {
  db.prepare("INSERT INTO agent_actions (id, kind, summary, payload, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(rid("ac"), kind, summary, JSON.stringify(payload || {}), Date.now());
}

/* ----------- Scan / agent mock ----------- */
const MOCK_INGREDIENTS = [
  { emoji: "🍗", name: "Rotisserie chicken", qty: "≈ 400g" },
  { emoji: "🥒", name: "Cucumber", qty: "2 pcs" },
  { emoji: "🌶️", name: "Chili oil", qty: "jar" },
  { emoji: "🧄", name: "Garlic", qty: "6 cloves" },
  { emoji: "🍜", name: "Wheat noodles", qty: "1 pack" },
  { emoji: "🥫", name: "Soy sauce", qty: "bottle" },
  { emoji: "🌱", name: "Scallions", qty: "bunch" },
  { emoji: "🥚", name: "Eggs", qty: "6 pcs" },
];
const MOCK_RECIPES = [
  { id: "r1", title: "Shredded Chicken Cold Noodles", subtitle: "凉拌鸡丝面", minutes: 15, difficulty: "Easy",
    tint: "from-emerald-200 to-emerald-50", accent: "#34E39F", emoji: "🍜", calories: 540, protein: 48, carbs: 62, fat: 12,
    tags: ["High protein", "One bowl", "No oven"],
    why: "Uses leftover chicken + noodles. Hits 30% of today's remaining protein." },
  { id: "r2", title: "Quick Bobo Chicken", subtitle: "钵钵鸡", minutes: 20, difficulty: "Easy",
    tint: "from-orange-200 to-amber-50", accent: "#FFB655", emoji: "🌶️", calories: 480, protein: 52, carbs: 18, fat: 22,
    tags: ["Spicy", "Meal prep", "Low carb"],
    why: "Chicken + chili oil + cucumber — perfect for tomorrow's lunch box." },
  { id: "r3", title: "Garlic Cucumber & Egg Bowl", subtitle: "蒜蓉黄瓜蛋拌饭", minutes: 12, difficulty: "Easy",
    tint: "from-lime-200 to-green-50", accent: "#7BFFD3", emoji: "🥢", calories: 410, protein: 32, carbs: 46, fat: 14,
    tags: ["Refreshing", "Quick", "Balanced"],
    why: "Light option if you want to save calories for dinner out." },
];

/* Mock scan — kept for when no image / no API key is available */
app.post("/api/agent/scan", (_req, res) => {
  logAction("scan", "Scanned fridge (mock)", { items: MOCK_INGREDIENTS.length });
  setTimeout(
    () => res.json({ ingredients: MOCK_INGREDIENTS, suggestedRecipes: MOCK_RECIPES, source: "mock" }),
    1400
  );
});

/**
 * Real vision scan — accepts a multipart `image` field, sends it to the
 * OpenAI vision API (OPENAI_MODEL, default "gpt-4o"), and asks for a
 * structured JSON reply. Falls back to mock data when OPENAI_API_KEY is unset
 * or the call fails (so the UI always has something to render).
 */
app.post("/api/agent/scan-real", upload.single("image"), async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o";

  if (!req.file) return res.status(400).json({ error: "missing image" });

  if (!apiKey) {
    logAction("scan", "Scanned fridge (no key)", { reason: "OPENAI_API_KEY missing" });
    return res.json({
      ingredients: MOCK_INGREDIENTS,
      suggestedRecipes: MOCK_RECIPES,
      source: "mock",
      warning: "OPENAI_API_KEY not set — returning mock data. Add it to server/.env",
    });
  }

  const b64 = req.file.buffer.toString("base64");
  const mime = req.file.mimetype || "image/jpeg";
  const dataUrl = `data:${mime};base64,${b64}`;

  const systemPrompt = `You are MacroAgent, a nutrition & meal-planning assistant for a strength-training user.
Analyze the provided fridge photo. Return ONLY a compact JSON object matching this exact schema:
{
  "ingredients": [
    { "emoji": "string (1 emoji)", "name": "string", "qty": "string (e.g. '2 pcs', '400g', 'bottle')",
      "exp": integer (estimated days until expiry), "category": "protein" | "produce" | "pantry" | "dairy" | "other",
      "protein": integer (grams protein per 100g, optional) }
  ],
  "suggestedRecipes": [
    { "id": "string", "title": "string", "subtitle": "string (localized name ok)",
      "minutes": integer, "difficulty": "Easy" | "Medium" | "Hard",
      "tint": "from-emerald-200 to-emerald-50",
      "accent": "#hex", "emoji": "string",
      "calories": integer, "protein": integer, "carbs": integer, "fat": integer,
      "tags": ["string", "string", "string"],
      "why": "string (1 sentence tying back to visible ingredients)" }
  ]
}
Include up to 10 ingredients and 3 recipes. Recipes must use visible ingredients and be high-protein-friendly (>= 30g protein).
Accent colors should be one of "#34E39F", "#FFB655", "#7BFFD3", "#5FD8FF", "#A78BFA".
Output JSON only — no prose, no markdown.`;

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        max_tokens: 1600,
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this fridge photo. Return the JSON." },
              { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("OpenAI error:", resp.status, txt);
      logAction("scan", "Vision call failed", { status: resp.status });
      return res.status(502).json({
        error: "vision_call_failed",
        status: resp.status,
        detail: txt.slice(0, 500),
        ingredients: MOCK_INGREDIENTS,
        suggestedRecipes: MOCK_RECIPES,
        source: "mock",
      });
    }

    const json = await resp.json();
    const raw = json.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse failed:", raw.slice(0, 200));
      return res.json({
        ingredients: MOCK_INGREDIENTS,
        suggestedRecipes: MOCK_RECIPES,
        source: "mock",
        warning: "model did not return valid JSON",
      });
    }

    const ingredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
    const suggestedRecipes = Array.isArray(parsed.suggestedRecipes) ? parsed.suggestedRecipes : [];
    logAction("scan", `Scanned fridge · ${ingredients.length} items`, { model });
    res.json({ ingredients, suggestedRecipes, source: "openai", model });
  } catch (err) {
    console.error("Scan-real error:", err);
    logAction("scan", "Vision call error", { error: String(err?.message || err) });
    res.status(500).json({
      error: "scan_failed",
      detail: String(err?.message || err),
      ingredients: MOCK_INGREDIENTS,
      suggestedRecipes: MOCK_RECIPES,
      source: "mock",
    });
  }
});

/* ----------- Venues / menus ----------- */
const VENUES = [
  { id: "v1", name: "Sweetgreen", type: "Salad bar", distance: "0.3 mi", rating: 4.7, emoji: "🥗", price: "$$", match: 92, openUntil: "10:00 PM" },
  { id: "v2", name: "Xi'an Famous Foods", type: "Chinese · Noodles", distance: "0.5 mi", rating: 4.6, emoji: "🍜", price: "$$", match: 88, openUntil: "9:30 PM" },
  { id: "v3", name: "Trader Joe's", type: "Grocery", distance: "0.7 mi", rating: 4.8, emoji: "🛒", price: "$", match: 81, openUntil: "9:00 PM" },
  { id: "v4", name: "Din Tai Fung", type: "Chinese · Dim sum", distance: "1.1 mi", rating: 4.8, emoji: "🥟", price: "$$$", match: 74, openUntil: "10:00 PM" },
];
const MENUS = {
  v1: [
    { id: "m1", name: "Harvest Bowl (no grain)", cal: 520, p: 42, c: 28, f: 22, recommend: true, note: "Swap grain for extra chicken" },
    { id: "m2", name: "Spicy Chicken Caesar", cal: 610, p: 46, c: 30, f: 28, recommend: true },
    { id: "m3", name: "Miso Glazed Salmon Plate", cal: 580, p: 40, c: 42, f: 20, recommend: false },
    { id: "m4", name: "Guacamole Greens", cal: 720, p: 14, c: 48, f: 52, recommend: false, note: "Low protein for your day" },
  ],
  v2: [
    { id: "m5", name: "Spicy Cumin Lamb (no noodle)", cal: 540, p: 44, c: 18, f: 28, recommend: true, note: "Protein-forward" },
    { id: "m6", name: "Stewed Oxtail Soup", cal: 480, p: 38, c: 22, f: 24, recommend: true },
    { id: "m7", name: "Liang Pi Cold Skin Noodles", cal: 690, p: 16, c: 110, f: 14, recommend: false },
    { id: "m8", name: "Pork Zhajiang Noodles", cal: 820, p: 28, c: 96, f: 30, recommend: false },
  ],
  v3: [
    { id: "m9", name: "Teriyaki Chicken Thighs", cal: 340, p: 38, c: 12, f: 14, recommend: true },
    { id: "m10", name: "Edamame Hummus Pack", cal: 180, p: 14, c: 16, f: 8, recommend: true },
    { id: "m11", name: "Cauliflower Gnocchi", cal: 430, p: 8, c: 56, f: 18, recommend: false },
  ],
  v4: [
    { id: "m12", name: "Chicken Xiao Long Bao (6 pc)", cal: 360, p: 24, c: 34, f: 12, recommend: true },
    { id: "m13", name: "Shrimp & Pork Wontons", cal: 420, p: 28, c: 30, f: 18, recommend: true },
    { id: "m14", name: "Fried Rice with Pork Chop", cal: 880, p: 26, c: 92, f: 42, recommend: false },
  ],
};

app.get("/api/venues", (_req, res) => res.json(VENUES));
app.get("/api/venues/:id/menu", (req, res) => {
  const items = MENUS[req.params.id] || [];
  res.json({
    venue: VENUES.find((v) => v.id === req.params.id),
    items,
  });
});

/* ----------- FooDB ----------- */
const FOODB = {
  "Rotisserie chicken": {
    foodbId: "FOOD00093",
    per100g: { kcal: 189, protein: 24, fat: 10, carbs: 0 },
    compounds: [
      { name: "Carnosine", role: "Muscle buffer", tag: "strength" },
      { name: "Creatine", role: "ATP support", tag: "strength" },
      { name: "B12", role: "Red blood cells", tag: "vitamin" },
    ],
    insight: "Lean protein + carnosine supports training buffering capacity.",
  },
  Cucumber: {
    foodbId: "FOOD00267",
    per100g: { kcal: 16, protein: 0.7, fat: 0.1, carbs: 3.6 },
    compounds: [
      { name: "Cucurbitacin", role: "Anti-inflammatory", tag: "phyto" },
      { name: "Silica", role: "Connective tissue", tag: "mineral" },
      { name: "Vitamin K", role: "Bone health", tag: "vitamin" },
    ],
    insight: "Low-cal hydration vehicle; pairs well with protein-heavy dishes.",
  },
  "Chili oil": {
    foodbId: "FOOD00891",
    per100g: { kcal: 820, protein: 1, fat: 90, carbs: 4 },
    compounds: [
      { name: "Capsaicin", role: "Metabolic boost", tag: "bioactive" },
      { name: "Vitamin E", role: "Antioxidant", tag: "vitamin" },
    ],
    insight: "Capsaicin may modestly increase post-meal thermogenesis.",
  },
  "Soy sauce": {
    foodbId: "FOOD00451",
    per100g: { kcal: 60, protein: 8, fat: 0.1, carbs: 5.6 },
    compounds: [
      { name: "Umami peptides", role: "Flavor", tag: "flavor" },
      { name: "Sodium", role: "Electrolyte", tag: "watch" },
    ],
    insight: "Use sparingly — high sodium density.",
  },
  Garlic: {
    foodbId: "FOOD00230",
    per100g: { kcal: 149, protein: 6.4, fat: 0.5, carbs: 33 },
    compounds: [
      { name: "Allicin", role: "Antimicrobial", tag: "bioactive" },
      { name: "Selenium", role: "Antioxidant", tag: "mineral" },
    ],
    insight: "Allicin forms when fresh garlic is crushed — let it sit 10 min.",
  },
};
app.get("/api/foodb", (req, res) => {
  const name = String(req.query.name || "");
  res.json(FOODB[name] || null);
});

/* ----------- Streaming agent chat (SSE) ----------- */
function buildAgentSystem() {
  const p = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  const today = iso();
  const meals = db.prepare("SELECT * FROM meals WHERE day = ? ORDER BY created_at").all(today);
  const totals = meals.reduce(
    (a, m) => ({ cal: a.cal + m.cal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f }),
    { cal: 0, p: 0, c: 0, f: 0 }
  );
  const waterRow = db
    .prepare("SELECT COALESCE(SUM(amount_l), 0) AS w FROM water_logs WHERE day = ?")
    .get(today);

  return `You are MacroAgent — a warm, concise nutrition + strength-training coach inside a wellness app.
Today is ${today}. The user:
- Name: ${p.name} (${p.handle})
- Goal: ${p.goal} · Plan: ${p.plan}
- Weight ${p.weight_kg}kg → target ${p.target_weight_kg}kg
- Streak: ${p.streak} days, tracked ${p.joined_days} days total.

Daily targets: ${p.target_calories} kcal · ${p.target_protein}g protein · ${p.target_carbs}g carbs · ${p.target_fat}g fat · ${p.target_water}L water.

Today so far: ${totals.cal} kcal · ${totals.p}g protein · ${totals.c}g carbs · ${totals.f}g fat · ${waterRow.w}L water.
Meals logged today: ${meals.map((m) => `${m.slot || "meal"} — ${m.name} (${m.cal}kcal, ${m.p}g P)`).join("; ") || "none yet"}.

Respond in 2–4 short sentences. Use concrete grams/kcal numbers. Emoji are fine but sparing.
If the user asks for a meal, suggest something that closes their biggest macro gap. If they ask to log or plan, be specific. Never restate the full profile — just use it.`;
}

app.post("/api/agent/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o";
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  if (!apiKey) {
    const fallback =
      "I don't have API access right now — add OPENAI_API_KEY to server/.env and restart. In the meantime: you're short on protein; try a whey shake + Greek yogurt to close the gap.";
    for (const chunk of fallback.match(/.{1,18}/g) || []) {
      send("delta", { content: chunk });
      await new Promise((r) => setTimeout(r, 40));
    }
    send("done", { source: "mock" });
    return res.end();
  }

  try {
    const system = buildAgentSystem();
    const full = [{ role: "system", content: system }, ...messages];

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.6,
        max_tokens: 500,
        messages: full,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const txt = await upstream.text();
      send("error", { status: upstream.status, detail: txt.slice(0, 400) });
      return res.end();
    }

    const reader = upstream.body.getReader();
    const dec = new TextDecoder();
    let buf = "";

    let aborted = false;
    req.on("close", () => { aborted = true; });

    while (!aborted) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });

      const lines = buf.split("\n");
      buf = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") {
          send("done", { source: "openai", model });
          return res.end();
        }
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) send("delta", { content: delta });
        } catch {
          /* ignore */
        }
      }
    }

    send("done", { source: "openai", model });
    res.end();
  } catch (err) {
    send("error", { detail: String(err?.message || err) });
    res.end();
  }
});

/* ----------- Boot ----------- */
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`MacroAgent API on :${PORT}`));
