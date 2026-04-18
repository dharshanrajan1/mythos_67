import db from "./db.js";

const today = new Date().toISOString().slice(0, 10);
const now = Date.now();

function ensureSeeded() {
  const row = db.prepare("SELECT COUNT(*) as c FROM profile").get();
  if (row.c > 0) return;

  db.prepare(
    `INSERT INTO profile
     (id, name, handle, goal, plan, streak, joined_days, weight_kg, height_cm,
      target_weight_kg, target_calories, target_protein, target_carbs, target_fat, target_water)
     VALUES (1, 'Wei', '@wei_lifts', 'Strength Training', 'High-protein · 2,500 kcal',
             12, 84, 72.4, 178, 74, 2500, 160, 280, 80, 3.0)`
  ).run();

  const meals = [
    ["t1", "Breakfast", "7:40 AM", "Oats, whey & berries", "🥣", 420, 38, 54, 9, "manual"],
    ["t2", "Snack", "10:30 AM", "Greek yogurt + almonds", "🥜", 260, 22, 12, 14, "barcode"],
    ["t3", "Lunch", "12:55 PM", "Beef & broccoli rice bowl", "🥢", 680, 46, 72, 22, "restaurant"],
    ["t4", "Pre-workout", "5:10 PM", "Banana + rice cakes", "🍌", 240, 4, 52, 1, "quick"],
    ["t5", "Post-workout", "7:05 PM", "Whey isolate shake", "🥤", 200, 35, 6, 2, "agent"],
  ];
  const insertMeal = db.prepare(
    `INSERT INTO meals (id, day, slot, time, name, emoji, cal, p, c, f, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  meals.forEach((m, i) => insertMeal.run(m[0], today, ...m.slice(1), now + i));

  // Some history for yesterday + earlier
  const history = [
    ["y1", addDays(today, -1), "Breakfast", "Scallion pancake + eggs", "🥞", 520, 26, 48, 22],
    ["y2", addDays(today, -1), "Lunch", "Mapo tofu + rice", "🍚", 740, 42, 78, 26],
    ["y3", addDays(today, -1), "Dinner", "Grilled salmon + greens", "🐟", 640, 58, 18, 32],
    ["y4", addDays(today, -1), "Snack", "Protein bar", "🍫", 210, 20, 22, 7],
    ["w1", addDays(today, -2), "Lunch", "Shredded chicken noodles", "🍜", 540, 48, 62, 12],
    ["w2", addDays(today, -2), "Dinner", "Hotpot (lean cut)", "🍲", 880, 68, 44, 38],
    ["u1", addDays(today, -3), "Lunch", "Tomato egg noodles", "🍅", 480, 22, 62, 14],
    ["u2", addDays(today, -3), "Dinner", "Dumplings (12 pc)", "🥟", 720, 38, 88, 22],
  ];
  const insertHistory = db.prepare(
    `INSERT INTO meals (id, day, slot, time, name, emoji, cal, p, c, f, source, created_at)
     VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, 'manual', ?)`
  );
  history.forEach((h, i) =>
    insertHistory.run(h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], h[8], now - (i + 1) * 3600_000)
  );

  db.prepare(
    `INSERT INTO water_logs (id, day, amount_l, created_at) VALUES (?, ?, ?, ?)`
  ).run("wa1", today, 1.8, now);

  db.prepare(
    `INSERT INTO weight_logs (id, day, kg, created_at) VALUES (?, ?, ?, ?)`
  ).run("kg0", today, 72.4, now);
  const wh = [
    ["kg1", addDays(today, -14), 71.2],
    ["kg2", addDays(today, -11), 71.5],
    ["kg3", addDays(today, -8), 71.9],
    ["kg4", addDays(today, -5), 72.0],
    ["kg5", addDays(today, -2), 72.2],
  ];
  const iw = db.prepare(
    `INSERT INTO weight_logs (id, day, kg, created_at) VALUES (?, ?, ?, ?)`
  );
  wh.forEach((w, i) => iw.run(w[0], w[1], w[2], now - (i + 1) * 86400_000));

  const insDiary = db.prepare(
    `INSERT INTO diary (id, day, mood, good_day, body, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  );
  insDiary.run("d2", addDays(today, -1), "😌", 1, "Dinner at mom's — mapo tofu. Over carbs but worth it.", now - 86400_000);
  insDiary.run("d3", addDays(today, -2), "😐", 0, "Stressful sprint at work. Snacked on peanuts.", now - 2 * 86400_000);

  const insMind = db.prepare(
    `INSERT INTO mind_dumps (id, text, created_at) VALUES (?, ?, ?)`
  );
  [
    ["i1", "Try the smashed cucumber recipe from mom"],
    ["i2", "Prep ginger-scallion sauce for the week"],
    ["i3", "Ask agent about creatine timing with meals"],
  ].forEach(([id, text], i) => insMind.run(id, text, now - i * 3600_000));

  const insShop = db.prepare(
    `INSERT INTO shopping (id, name, qty, aisle, checked, urgent, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  [
    ["sh1", "Chicken breast", "1 kg", "Meat", 0, 1],
    ["sh2", "Greek yogurt 0%", "2 tubs", "Dairy", 1, 0],
    ["sh3", "Brown rice", "1 bag", "Grains", 0, 0],
    ["sh4", "Napa cabbage", "1 head", "Produce", 0, 0],
    ["sh5", "Sesame oil", "1 bottle", "Pantry", 1, 0],
    ["sh6", "Tofu (firm)", "3 blocks", "Refrigerated", 0, 0],
    ["sh7", "Eggs", "1 dozen", "Dairy", 0, 0],
  ].forEach((s, i) => insShop.run(s[0], s[1], s[2], s[3], s[4], s[5], now + i));

  const insPlan = db.prepare(
    `INSERT INTO meal_plan (id, day, slot, name, emoji, cal, p, done, tonight, agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  [
    ["p1", "Mon", "Dinner", "Beef & broccoli stir-fry", "🥦", 640, 52, 1, 0, 0],
    ["p2", "Tue", "Dinner", "Cumin lamb rice bowl", "🍚", 720, 48, 1, 0, 0],
    ["p3", "Wed", "Dinner", "Hotpot at home (lean)", "🍲", 880, 68, 1, 0, 0],
    ["p4", "Thu", "Dinner", "Grilled salmon + greens", "🐟", 640, 58, 1, 0, 0],
    ["p5", "Fri", "Dinner", "Shredded chicken noodles", "🍜", 540, 48, 0, 1, 0],
    ["p6", "Sat", "Dinner", "Family dumpling night", "🥟", 780, 40, 0, 0, 0],
    ["p7", "Sun", "Dinner", "Meal-prep bobo chicken", "🌶️", 480, 52, 0, 0, 1],
  ].forEach((p) => insPlan.run(...p));

  db.prepare(
    `INSERT INTO workouts (id, day, name, time, est_kcal_burn) VALUES (?, ?, ?, ?, ?)`
  ).run("wk1", today, "Push day · Upper body", "6:00 PM", 420);

  const insEx = db.prepare(
    `INSERT INTO workout_exercises (id, workout_id, name, sets, done, pr, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  [
    ["e1", "Bench press", "4×6", 1, 1, 0],
    ["e2", "Incline DB press", "3×10", 1, 0, 1],
    ["e3", "Overhead press", "4×8", 0, 0, 2],
    ["e4", "Lateral raise", "3×12", 0, 0, 3],
    ["e5", "Cable fly", "3×12", 0, 0, 4],
    ["e6", "Tricep rope", "3×15", 0, 0, 5],
  ].forEach((e) => insEx.run(e[0], "wk1", e[1], e[2], e[3], e[4], e[5]));

  db.prepare(
    `INSERT INTO goals (id, label, target_date, progress_pct, weight_delta)
     VALUES (1, 'Bulk phase target', 'Jun 13, 2026', 62, 1.6)`
  ).run();

  const insAch = db.prepare(
    `INSERT INTO achievements (id, name, icon, note, earned) VALUES (?, ?, ?, ?, ?)`
  );
  [
    ["a1", "12-day streak", "🔥", null, 1],
    ["a2", "Protein MVP", "💪", "Hit 160g 5x", 1],
    ["a3", "Home chef", "👨‍🍳", "30 meals cooked", 1],
    ["a4", "Scan master", "📸", "50 fridge scans (32/50)", 0],
    ["a5", "Macro perfect", "🎯", "All 3 macros within 5%", 0],
  ].forEach((a) => insAch.run(...a));

  const insAct = db.prepare(
    `INSERT INTO agent_actions (id, kind, summary, payload, created_at) VALUES (?, ?, ?, ?, ?)`
  );
  insAct.run("ac1", "scan", "Scanned fridge", "{}", now - 2 * 60_000);
  insAct.run("ac2", "log", "Logged shake", "{}", now - 3_600_000);
  insAct.run("ac3", "restaurant", "Found Xi'an Famous Foods", "{}", now - 3 * 3_600_000);
}

function addDays(dateIso, n) {
  const d = new Date(dateIso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

ensureSeeded();
