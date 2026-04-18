const colors = ["#34E39F", "#FFB655", "#7BFFD3", "#A78BFA", "#5FD8FF", "#FF8F6B"];

export default function Confetti() {
  const pieces = Array.from({ length: 40 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-40">
      {pieces.map((_, i) => {
        const c = colors[i % colors.length];
        return (
          <span
            key={i}
            className="absolute top-0 animate-confetti-fall"
            style={{
              left: `${(i * 41) % 100}%`,
              width: `${6 + (i % 3) * 3}px`,
              height: `${10 + (i % 4) * 3}px`,
              background: c,
              boxShadow: `0 0 10px ${c}`,
              borderRadius: i % 2 ? "3px" : "999px",
              animationDelay: `${(i % 8) * 0.08}s`,
              animationDuration: `${1.6 + (i % 5) * 0.2}s`,
              transform: `rotate(${(i * 23) % 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
