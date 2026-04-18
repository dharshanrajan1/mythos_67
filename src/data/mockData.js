export const user = {
  name: "Wei",
  handle: "@wei_lifts",
  goal: "Strength Training",
  plan: "High-protein · 2,500 kcal",
  streak: 12,
  joinedDays: 84,
  weightKg: 72.4,
  heightCm: 178,
  targetWeightKg: 74,
  today: {
    calories: { current: 1800, target: 2500 },
    protein: { current: 115, target: 160 },
    carbs: { current: 190, target: 280 },
    fat: { current: 58, target: 80 },
    water: { current: 1.8, target: 3.0 },
  },
};

export const todayMeals = [
  {
    id: "t1",
    slot: "Breakfast",
    time: "7:40 AM",
    name: "Oats, whey & berries",
    emoji: "🥣",
    cal: 420,
    p: 38,
    c: 54,
    f: 9,
    source: "manual",
  },
  {
    id: "t2",
    slot: "Snack",
    time: "10:30 AM",
    name: "Greek yogurt + almonds",
    emoji: "🥜",
    cal: 260,
    p: 22,
    c: 12,
    f: 14,
    source: "barcode",
  },
  {
    id: "t3",
    slot: "Lunch",
    time: "12:55 PM",
    name: "Beef & broccoli rice bowl",
    emoji: "🥢",
    cal: 680,
    p: 46,
    c: 72,
    f: 22,
    source: "restaurant",
  },
  {
    id: "t4",
    slot: "Pre-workout",
    time: "5:10 PM",
    name: "Banana + rice cakes",
    emoji: "🍌",
    cal: 240,
    p: 4,
    c: 52,
    f: 1,
    source: "quick",
  },
  {
    id: "t5",
    slot: "Post-workout",
    time: "7:05 PM",
    name: "Whey isolate shake",
    emoji: "🥤",
    cal: 200,
    p: 35,
    c: 6,
    f: 2,
    source: "agent",
  },
];

export const mealHistory = [
  {
    date: "Yesterday · Apr 17",
    hit: true,
    total: { cal: 2480, p: 168, c: 262, f: 74 },
    items: [
      { id: "y1", slot: "Breakfast", name: "Scallion pancake + eggs", emoji: "🥞", cal: 520, p: 26, c: 48, f: 22 },
      { id: "y2", slot: "Lunch", name: "Mapo tofu + rice", emoji: "🍚", cal: 740, p: 42, c: 78, f: 26 },
      { id: "y3", slot: "Dinner", name: "Grilled salmon + greens", emoji: "🐟", cal: 640, p: 58, c: 18, f: 32 },
      { id: "y4", slot: "Snack", name: "Protein bar", emoji: "🍫", cal: 210, p: 20, c: 22, f: 7 },
    ],
  },
  {
    date: "Wed · Apr 16",
    hit: true,
    total: { cal: 2390, p: 162, c: 240, f: 72 },
    items: [
      { id: "w1", slot: "Lunch", name: "Shredded chicken noodles", emoji: "🍜", cal: 540, p: 48, c: 62, f: 12 },
      { id: "w2", slot: "Dinner", name: "Hotpot (lean cut)", emoji: "🍲", cal: 880, p: 68, c: 44, f: 38 },
    ],
  },
  {
    date: "Tue · Apr 15",
    hit: false,
    total: { cal: 2120, p: 132, c: 210, f: 58 },
    items: [
      { id: "u1", slot: "Lunch", name: "Tomato egg noodles", emoji: "🍅", cal: 480, p: 22, c: 62, f: 14 },
      { id: "u2", slot: "Dinner", name: "Dumplings (12 pc)", emoji: "🥟", cal: 720, p: 38, c: 88, f: 22 },
    ],
  },
];

export const weeklyTrend = [
  { day: "Mon", cal: 2380, p: 152, hit: true },
  { day: "Tue", cal: 2120, p: 132, hit: false },
  { day: "Wed", cal: 2390, p: 162, hit: true },
  { day: "Thu", cal: 2480, p: 168, hit: true },
  { day: "Fri", cal: 1800, p: 115, hit: null, current: true },
  { day: "Sat", cal: 0, p: 0, hit: null },
  { day: "Sun", cal: 0, p: 0, hit: null },
];

export const streakCalendar = [
  // 5 weeks × 7 days
  [1, 1, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 0, 0], // 2 = today
];

export const achievements = [
  { id: "a1", name: "12-day streak", icon: "🔥", earned: true },
  { id: "a2", name: "Protein MVP", icon: "💪", earned: true, note: "Hit 160g 5x" },
  { id: "a3", name: "Home chef", icon: "👨‍🍳", earned: true, note: "30 meals cooked" },
  { id: "a4", name: "Scan master", icon: "📸", earned: false, note: "50 fridge scans (32/50)" },
  { id: "a5", name: "Macro perfect", icon: "🎯", earned: false, note: "All 3 macros within 5%" },
];

export const scannedIngredients = [
  { emoji: "🍗", name: "Rotisserie chicken", qty: "≈ 400g", exp: 2,  category: "protein", protein: 35 },
  { emoji: "🥚", name: "Eggs",               qty: "6 pcs",   exp: 9,  category: "protein", protein: 6 },
  { emoji: "🥛", name: "Whole milk",         qty: "1L",      exp: 5,  category: "protein", protein: 3 },
  { emoji: "🥒", name: "Cucumber",           qty: "2 pcs",   exp: 4,  category: "produce" },
  { emoji: "🌱", name: "Scallions",          qty: "bunch",   exp: 3,  category: "produce" },
  { emoji: "🧄", name: "Garlic",             qty: "6 cloves",exp: 21, category: "produce" },
  { emoji: "🍋", name: "Lemon",              qty: "2 pcs",   exp: 10, category: "produce" },
  { emoji: "🥫", name: "Soy sauce",          qty: "bottle",  exp: 120,category: "pantry" },
  { emoji: "🌶️", name: "Chili oil",          qty: "jar",     exp: 90, category: "pantry" },
  { emoji: "🍜", name: "Wheat noodles",      qty: "1 pack",  exp: 60, category: "pantry" },
];

export const recipes = [
  {
    id: "r1",
    title: "Shredded Chicken Cold Noodles",
    subtitle: "凉拌鸡丝面",
    minutes: 15,
    difficulty: "Easy",
    tint: "from-emerald-200 to-emerald-50",
    accent: "#34E39F",
    emoji: "🍜",
    calories: 540,
    protein: 48,
    carbs: 62,
    fat: 12,
    tags: ["High protein", "One bowl", "No oven"],
    why: "Uses your leftover chicken + noodles. Hits 30% of today's remaining protein.",
  },
  {
    id: "r2",
    title: "Quick Bobo Chicken",
    subtitle: "钵钵鸡",
    minutes: 20,
    difficulty: "Easy",
    tint: "from-orange-200 to-amber-50",
    accent: "#FFB655",
    emoji: "🌶️",
    calories: 480,
    protein: 52,
    carbs: 18,
    fat: 22,
    tags: ["Spicy", "Meal prep", "Low carb"],
    why: "Chicken + chili oil + cucumber — perfect for tomorrow's lunch box.",
  },
  {
    id: "r3",
    title: "Garlic Cucumber & Egg Bowl",
    subtitle: "蒜蓉黄瓜蛋拌饭",
    minutes: 12,
    difficulty: "Easy",
    tint: "from-lime-200 to-green-50",
    accent: "#7BFFD3",
    emoji: "🥢",
    calories: 410,
    protein: 32,
    carbs: 46,
    fat: 14,
    tags: ["Refreshing", "Quick", "Balanced"],
    why: "Light option if you want to save calories for dinner out.",
  },
];

export const venues = [
  { id: "v1", name: "Sweetgreen", type: "Salad bar", distance: "0.3 mi", rating: 4.7, emoji: "🥗", price: "$$", match: 92, openUntil: "10:00 PM" },
  { id: "v2", name: "Xi'an Famous Foods", type: "Chinese · Noodles", distance: "0.5 mi", rating: 4.6, emoji: "🍜", price: "$$", match: 88, openUntil: "9:30 PM" },
  { id: "v3", name: "Trader Joe's", type: "Grocery", distance: "0.7 mi", rating: 4.8, emoji: "🛒", price: "$", match: 81, openUntil: "9:00 PM" },
  { id: "v4", name: "Din Tai Fung", type: "Chinese · Dim sum", distance: "1.1 mi", rating: 4.8, emoji: "🥟", price: "$$$", match: 74, openUntil: "10:00 PM" },
];

export const menus = {
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

export const agentSuggestions = [
  {
    id: "s1",
    title: "Post-workout shake logged",
    body: "Great timing — you've hit 115g protein. 45g to go for today.",
    cta: "See next meal idea",
    tone: "green",
  },
  {
    id: "s2",
    title: "Short on protein + time?",
    body: "Your fridge has chicken. I can plan a 15-min dinner.",
    cta: "Scan fridge",
    action: "home",
    tone: "green",
  },
  {
    id: "s3",
    title: "Eating out tonight?",
    body: "4 high-protein spots open within 10 min of you.",
    cta: "Find spots",
    action: "road",
    tone: "amber",
  },
];

/* ----------------- Meridian-inspired modules ----------------- */

export const todayWorkout = {
  name: "Push day · Upper body",
  time: "6:00 PM",
  totalExercises: 6,
  completed: 2,
  estKcalBurn: 420,
  exercises: [
    { name: "Bench press", sets: "4×6", done: true, pr: true },
    { name: "Incline DB press", sets: "3×10", done: true },
    { name: "Overhead press", sets: "4×8", done: false },
    { name: "Lateral raise", sets: "3×12", done: false },
    { name: "Cable fly", sets: "3×12", done: false },
    { name: "Tricep rope", sets: "3×15", done: false },
  ],
};

export const diaryEntries = [
  {
    id: "d1",
    day: "Today",
    mood: "💪",
    goodDay: true,
    body: "Hit protein early with the shake. Cravings low. Push day felt strong.",
  },
  {
    id: "d2",
    day: "Yesterday",
    mood: "😌",
    goodDay: true,
    body: "Dinner at mom's — mapo tofu. Over carbs but worth it.",
  },
  {
    id: "d3",
    day: "Wed",
    mood: "😐",
    goodDay: false,
    body: "Stressful sprint at work. Snacked on peanuts.",
  },
];

export const goalCountdown = {
  label: "Bulk phase target",
  targetDate: "Jun 13, 2026",
  daysLeft: 56,
  weightDelta: 1.6, // kg to gain
  progressPct: 62,
};

export const weeklyMealPlan = [
  { day: "Mon", slot: "Dinner", name: "Beef & broccoli stir-fry", emoji: "🥦", p: 52, cal: 640, done: true },
  { day: "Tue", slot: "Dinner", name: "Cumin lamb rice bowl", emoji: "🍚", p: 48, cal: 720, done: true },
  { day: "Wed", slot: "Dinner", name: "Hotpot at home (lean)", emoji: "🍲", p: 68, cal: 880, done: true },
  { day: "Thu", slot: "Dinner", name: "Grilled salmon + greens", emoji: "🐟", p: 58, cal: 640, done: true },
  { day: "Fri", slot: "Dinner", name: "Shredded chicken noodles", emoji: "🍜", p: 48, cal: 540, done: false, tonight: true },
  { day: "Sat", slot: "Dinner", name: "Family dumpling night", emoji: "🥟", p: 40, cal: 780, done: false },
  { day: "Sun", slot: "Dinner", name: "Meal-prep bobo chicken", emoji: "🌶️", p: 52, cal: 480, done: false, agent: true },
];

export const shoppingList = [
  { id: "sh1", name: "Chicken breast", qty: "1 kg", aisle: "Meat", checked: false, urgent: true },
  { id: "sh2", name: "Greek yogurt 0%", qty: "2 tubs", aisle: "Dairy", checked: true },
  { id: "sh3", name: "Brown rice", qty: "1 bag", aisle: "Grains", checked: false },
  { id: "sh4", name: "Napa cabbage", qty: "1 head", aisle: "Produce", checked: false },
  { id: "sh5", name: "Sesame oil", qty: "1 bottle", aisle: "Pantry", checked: true },
  { id: "sh6", name: "Tofu (firm)", qty: "3 blocks", aisle: "Refrigerated", checked: false },
  { id: "sh7", name: "Eggs", qty: "1 dozen", aisle: "Dairy", checked: false },
];

export const weeklyRecap = {
  range: "Apr 11 – Apr 17",
  goodDays: 5,
  totalDays: 7,
  caloriesAvg: 2343,
  proteinAvg: 148,
  workouts: 5,
  workoutsPlanned: 6,
  cookedAtHome: 12,
  atePreview: 4,
  deltaWeight: 0.4,
  highlights: [
    { tone: "green", text: "5 consecutive days ≥ 140g protein — new record." },
    { tone: "amber", text: "Carbs 18% below target Tue & Sat — plan refuel days." },
    { tone: "green", text: "Hit bench press PR · Mon." },
  ],
};

export const weightTrend = [
  { d: "04/05", kg: 71.2 },
  { d: "04/08", kg: 71.5 },
  { d: "04/11", kg: 71.9 },
  { d: "04/14", kg: 72.0 },
  { d: "04/17", kg: 72.2 },
  { d: "04/18", kg: 72.4 },
];

export const mindDumpIdeas = [
  { id: "i1", text: "Try the smashed cucumber recipe from mom" },
  { id: "i2", text: "Prep ginger-scallion sauce for the week" },
  { id: "i3", text: "Ask agent about creatine timing with meals" },
];
