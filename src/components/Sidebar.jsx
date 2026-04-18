import {
  Sparkles,
  Home,
  UtensilsCrossed,
  Bot,
  LineChart,
  User,
  Plus,
  Refrigerator,
  Car,
} from "lucide-react";

const tabs = [
  { id: "today", label: "Today", icon: Home },
  { id: "meals", label: "Meals", icon: UtensilsCrossed },
  { id: "agent", label: "Agent", icon: Bot, badge: "AI" },
  { id: "trends", label: "Trends", icon: LineChart },
  { id: "profile", label: "Profile", icon: User },
];

export default function Sidebar({ tab, onTab, onFlow, user }) {
  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-64 flex-col p-5 border-r border-white/5 bg-ink-950/60 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-macro-green to-macro-greenDeep flex items-center justify-center shadow-glow">
          <Sparkles className="w-4 h-4 text-ink-950" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">
            Macro<span className="text-gradient-green">Agent</span>
          </p>
          <p className="text-[10px] text-white/40">AI nutrition assistant</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                active
                  ? "bg-white/10 text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "text-white/60 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-macro-green" : ""}`} />
              <span className="flex-1 text-left font-medium">{t.label}</span>
              {t.badge && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-macro-green/20 text-macro-green">
                  {t.badge}
                </span>
              )}
              {active && (
                <span className="w-1 h-5 rounded-full bg-macro-green shadow-[0_0_8px_#34E39F]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Log */}
      <div className="mt-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 px-2 mb-2">
          Quick log
        </p>
        <button
          onClick={() => onFlow("home")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/5 transition"
        >
          <Refrigerator className="w-4 h-4 text-macro-green" />
          Scan fridge
        </button>
        <button
          onClick={() => onFlow("road")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/5 transition"
        >
          <Car className="w-4 h-4 text-macro-amber" />
          Find restaurant
        </button>
      </div>

      <div className="flex-1" />

      {/* Agent CTA */}
      <button
        onClick={() => onTab("agent")}
        className="glass-card p-4 text-left relative overflow-hidden group"
      >
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-macro-green/20 blur-2xl group-hover:bg-macro-green/30 transition" />
        <div className="relative flex items-center gap-2 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-macro-green animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider text-macro-green">
            Agent active
          </span>
        </div>
        <p className="relative text-sm font-semibold">
          "You're 45g short on protein."
        </p>
        <p className="relative text-[11px] text-white/55 mt-1">
          Ask me anything about your day →
        </p>
      </button>

      {/* Profile row */}
      <button
        onClick={() => onTab("profile")}
        className="mt-3 flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-macro-green to-macro-amber flex items-center justify-center font-semibold text-ink-950">
          {user.name[0]}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-[10px] text-white/45 truncate">{user.plan}</p>
        </div>
      </button>
    </aside>
  );
}
