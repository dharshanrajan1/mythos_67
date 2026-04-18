import { Bell, Search, Sparkles } from "lucide-react";

const labelByTab = {
  today: "Today",
  meals: "Meals",
  agent: "MacroAgent",
  trends: "Trends",
  profile: "Profile",
};

export default function TopHeader({ user, tab }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-ink-950/60 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-3">
        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-macro-green to-macro-greenDeep flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-ink-950" />
          </div>
          <p className="text-sm font-semibold text-white">
            {labelByTab[tab] || "MacroAgent"}
          </p>
        </div>

        {/* Desktop heading */}
        <div className="hidden lg:block flex-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
            Friday · April 18
          </p>
          <h1 className="text-xl font-semibold leading-tight">
            {tab === "today"
              ? `Hey, ${user.name} 👋`
              : labelByTab[tab] || "MacroAgent"}
          </h1>
        </div>

        <div className="flex-1 lg:flex-none lg:w-80 ml-2">
          <div className="h-10 glass rounded-full flex items-center px-4 gap-2">
            <Search className="w-4 h-4 text-white/50" />
            <input
              placeholder="Search meals, recipes, restaurants…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/35 min-w-0"
            />
            <span className="hidden sm:inline text-[10px] text-white/40 border border-white/10 rounded px-1.5 py-0.5">
              ⌘K
            </span>
          </div>
        </div>

        <button className="relative w-10 h-10 rounded-full glass flex items-center justify-center">
          <Bell className="w-4 h-4 text-white/80" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-macro-amber rounded-full shadow-[0_0_8px_#FFB655]" />
        </button>
      </div>
    </header>
  );
}
