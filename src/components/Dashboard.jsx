import {
  Refrigerator,
  Car,
  Flame,
  Dumbbell,
  Sparkles,
  ChevronRight,
  Bell,
  Trophy,
} from "lucide-react";
import { Ring, MiniBar } from "./MacroRings.jsx";

export default function Dashboard({ user, onNavigate }) {
  const { calories, protein, carbs, fat } = user.today;
  const calProgress = calories.current / calories.target;
  const protProgress = protein.current / protein.target;

  return (
    <div className="relative h-full overflow-y-auto no-scrollbar pb-10">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Friday · Apr 18
          </p>
          <h1 className="text-[28px] font-semibold leading-tight mt-0.5">
            Hey, {user.name}
            <span className="text-white/40"> 👋</span>
          </h1>
        </div>
        <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <Bell className="w-4 h-4 text-white/80" />
          <span className="absolute w-2 h-2 bg-macro-amber rounded-full translate-x-3 -translate-y-3 shadow-[0_0_8px_#FFB655]" />
        </button>
      </div>

      {/* Hero Bento */}
      <div className="px-4">
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-macro-green/20 blur-3xl" />
          <div className="absolute -bottom-14 -left-10 w-44 h-44 rounded-full bg-macro-amber/15 blur-3xl" />

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
              <span className="text-xs font-semibold">{user.streak}d</span>
            </div>
          </div>

          <div className="relative flex items-center gap-4">
            <Ring
              size={140}
              stroke={11}
              progress={calProgress}
              gradient={["#7BFFD3", "#34E39F"]}
              glow="#34E39F"
              label="Calories"
              value={calories.current}
              unit={`of ${calories.target}`}
            />
            <div className="flex-1 space-y-3.5">
              <div className="flex items-center gap-3">
                <Ring
                  size={62}
                  stroke={6}
                  progress={protProgress}
                  gradient={["#FFD58A", "#FF8F6B"]}
                  glow="#FFB655"
                />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">
                    Protein
                  </p>
                  <p className="text-lg font-semibold leading-tight">
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
                <MiniBar
                  label="Carbs"
                  current={carbs.current}
                  target={carbs.target}
                  color="#5FD8FF"
                />
                <MiniBar
                  label="Fat"
                  current={fat.current}
                  target={fat.target}
                  color="#A78BFA"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-6 pt-6 pb-3 flex items-baseline justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.22em] text-white/50">
          Where are you eating?
        </h2>
        <span className="text-[10px] text-white/30">Pick a mode</span>
      </div>

      {/* The Big Choice */}
      <div className="px-4 space-y-3">
        <ModeCard
          onClick={() => onNavigate("home")}
          title="Eat at Home"
          subtitle="Scan your fridge · 8 ingredients ready"
          icon={<Refrigerator className="w-7 h-7" strokeWidth={1.75} />}
          gradient="from-macro-green/25 via-macro-green/10 to-transparent"
          glow="shadow-glow"
          accent="#34E39F"
          badge="3 recipes match"
        />
        <ModeCard
          onClick={() => onNavigate("road")}
          title="On the Road"
          subtitle="7 healthy spots within 10 min"
          icon={<Car className="w-7 h-7" strokeWidth={1.75} />}
          gradient="from-macro-amber/25 via-macro-amber/10 to-transparent"
          glow="shadow-glowAmber"
          accent="#FFB655"
          badge="Live nearby"
        />
      </div>

      {/* Quick stats bento */}
      <div className="px-4 pt-5 grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<Dumbbell className="w-4 h-4" />}
          label="Strength"
          value="Push day"
          accent="#34E39F"
        />
        <StatTile
          icon={<Trophy className="w-4 h-4" />}
          label="This week"
          value="5 / 7"
          accent="#FFB655"
        />
        <StatTile
          icon={<Sparkles className="w-4 h-4" />}
          label="Agent"
          value="Active"
          accent="#A78BFA"
          pulse
        />
      </div>

      <div className="px-6 pt-6 pb-4 text-center">
        <p className="text-[11px] text-white/40">
          Powered by <span className="text-gradient-green font-semibold">MacroAgent</span> · GPT-5.4 vision
        </p>
      </div>
    </div>
  );
}

function ModeCard({
  onClick,
  title,
  subtitle,
  icon,
  gradient,
  accent,
  badge,
}) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full glass-card bento-hover p-5 text-left overflow-hidden active:scale-[0.99] transition-transform"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none`}
      />
      <div
        className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full blur-3xl opacity-50"
        style={{ background: accent }}
      />
      <div className="relative flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10"
          style={{
            background: `linear-gradient(135deg, ${accent}40, ${accent}10)`,
            color: accent,
            boxShadow: `0 0 20px ${accent}40`,
          }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full border"
              style={{
                color: accent,
                borderColor: `${accent}50`,
                background: `${accent}12`,
              }}
            >
              {badge}
            </span>
          </div>
          <p className="text-xs text-white/60 mt-0.5 truncate">{subtitle}</p>
        </div>
        <ChevronRight
          className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform"
        />
      </div>
    </button>
  );
}

function StatTile({ icon, label, value, accent, pulse }) {
  return (
    <div className="glass-card p-3 relative overflow-hidden">
      {pulse && (
        <span
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />
      )}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
        style={{
          background: `${accent}22`,
          color: accent,
        }}
      >
        {icon}
      </div>
      <p className="text-[9px] uppercase tracking-wider text-white/40">
        {label}
      </p>
      <p className="text-sm font-semibold text-white mt-0.5 truncate">
        {value}
      </p>
    </div>
  );
}
