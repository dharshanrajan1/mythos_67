import { Signal, Wifi, BatteryFull } from "lucide-react";

export default function PhoneFrame({ children }) {
  return (
    <div className="relative z-10 min-h-screen w-full flex items-center justify-center py-6 lg:py-10">
      <div className="relative w-full max-w-[420px] lg:max-w-[400px]">
        {/* Device bezel — only shows on desktop for context */}
        <div className="hidden lg:block absolute -inset-3 rounded-[56px] bg-gradient-to-b from-white/10 to-white/0 blur-2xl" />
        <div className="relative rounded-[44px] lg:rounded-[52px] overflow-hidden lg:border lg:border-white/10 lg:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] bg-ink-950">
          {/* Status bar */}
          <div className="relative h-11 px-7 flex items-center justify-between text-xs font-semibold text-white/90 bg-transparent">
            <span>9:41</span>
            {/* Dynamic island placeholder */}
            <div className="absolute left-1/2 top-2 -translate-x-1/2 w-28 h-7 rounded-full bg-black/80 border border-white/5" />
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryFull className="w-5 h-3.5" />
            </div>
          </div>
          <div className="relative h-[calc(100svh-48px)] lg:h-[780px] overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
