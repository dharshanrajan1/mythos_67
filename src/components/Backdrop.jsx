export default function Backdrop({ variant = "default" }) {
  const particles = Array.from({ length: 14 });
  return (
    <>
      <div className={`aurora ${variant === "violet" ? "aurora-violet" : ""}`} />
      <div className="particles">
        {particles.map((_, i) => (
          <span
            key={i}
            style={{
              top: `${(i * 37) % 100}%`,
              left: `${(i * 53) % 100}%`,
              animationDelay: `${(i * 1.1) % 12}s`,
              animationDuration: `${10 + (i % 5) * 2}s`,
              opacity: 0.25 + (i % 5) * 0.1,
              transform: `scale(${0.6 + (i % 4) * 0.3})`,
            }}
          />
        ))}
      </div>
    </>
  );
}
