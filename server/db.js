import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, "macroagent.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  handle TEXT,
  goal TEXT,
  plan TEXT,
  streak INTEGER DEFAULT 0,
  joined_days INTEGER DEFAULT 0,
  weight_kg REAL,
  height_cm REAL,
  target_weight_kg REAL,
  target_calories INTEGER DEFAULT 2500,
  target_protein INTEGER DEFAULT 160,
  target_carbs INTEGER DEFAULT 280,
  target_fat INTEGER DEFAULT 80,
  target_water REAL DEFAULT 3.0
);

CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  slot TEXT,
  time TEXT,
  name TEXT NOT NULL,
  emoji TEXT,
  cal INTEGER NOT NULL,
  p INTEGER NOT NULL,
  c INTEGER NOT NULL,
  f INTEGER NOT NULL,
  source TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_meals_day ON meals(day);

CREATE TABLE IF NOT EXISTS water_logs (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  amount_l REAL NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_water_day ON water_logs(day);

CREATE TABLE IF NOT EXISTS weight_logs (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  kg REAL NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS diary (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  mood TEXT,
  good_day INTEGER DEFAULT 0,
  body TEXT,
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_diary_day ON diary(day);

CREATE TABLE IF NOT EXISTS mind_dumps (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS shopping (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  qty TEXT,
  aisle TEXT,
  checked INTEGER DEFAULT 0,
  urgent INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_plan (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  slot TEXT NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT,
  cal INTEGER,
  p INTEGER,
  done INTEGER DEFAULT 0,
  tonight INTEGER DEFAULT 0,
  agent INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  name TEXT NOT NULL,
  time TEXT,
  est_kcal_burn INTEGER
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets TEXT,
  done INTEGER DEFAULT 0,
  pr INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_exercises_workout ON workout_exercises(workout_id);

CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  label TEXT,
  target_date TEXT,
  progress_pct INTEGER DEFAULT 0,
  weight_delta REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  note TEXT,
  earned INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS agent_actions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  summary TEXT,
  payload TEXT,
  created_at INTEGER NOT NULL
);
`);

export default db;
