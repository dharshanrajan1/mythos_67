export function Ring({
  size = 150,
  stroke = 12,
  progress = 0.6,
  gradient = ["#7BFFD3", "#34E39F"],
  glow = "#34E39F",
  label,
  value,
  unit,
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(1, Math.max(0, progress)));
  const gradId = `g-${label?.replace(/\s/g, "") || Math.random()}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
          <filter id={`glow-${gradId}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          filter={`url(#glow-${gradId})`}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ textShadow: `0 0 18px ${glow}55` }}
      >
        {label && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">
            {label}
          </span>
        )}
        {value != null && (
          <span className="text-2xl font-semibold text-white leading-none mt-0.5">
            {value}
          </span>
        )}
        {unit && (
          <span className="text-[10px] text-white/40 mt-0.5">{unit}</span>
        )}
      </div>
    </div>
  );
}

export function MiniBar({ label, current, target, color = "#34E39F" }) {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-white/50">
          {label}
        </span>
        <span className="text-[11px] text-white/80 font-medium">
          {current}
          <span className="text-white/40">/{target}g</span>
        </span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 12px ${color}80`,
            transition: "width 900ms cubic-bezier(.22,1,.36,1)",
          }}
        />
      </div>
    </div>
  );
}
