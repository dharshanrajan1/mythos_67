import { Home, UtensilsCrossed, Bot, LineChart, User, Plus } from "lucide-react";

const tabs = [
  { id: "today", label: "Today", icon: Home },
  { id: "meals", label: "Meals", icon: UtensilsCrossed },
  { id: "agent", label: "Agent", icon: Bot, primary: true },
  { id: "trends", label: "Trends", icon: LineChart },
  { id: "profile", label: "Me", icon: User },
];

export default function TabBar({ tab, onTab, onFlow }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40">
      <div className="mx-2 mb-2 glass-strong rounded-[28px] px-2 py-1.5 flex items-center justify-around shadow-soft">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          if (t.primary) {
            return (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                className="relative -mt-6 w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-macro-green to-macro-greenDeep text-ink-950 shadow-glow border-4 border-ink-950"
              >
                <Icon className="w-6 h-6" strokeWidth={2.2} />
                <span
                  className={`absolute -top-1 -right-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-ink-950 text-macro-green border border-macro-green/40`}
                >
                  AI
                </span>
              </button>
            );
          }
          return (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl transition ${
                active ? "text-white" : "text-white/45"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-macro-green" : ""}`} />
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
