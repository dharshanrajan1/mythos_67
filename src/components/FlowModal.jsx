import { useEffect } from "react";

export default function FlowModal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 animate-float-up">
      <div
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative h-full w-full flex items-center justify-center lg:p-6">
        <div className="relative w-full h-full lg:h-[820px] lg:max-w-[420px] lg:rounded-[40px] overflow-hidden lg:border lg:border-white/10 lg:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] bg-ink-950">
          {children}
        </div>
      </div>
    </div>
  );
}
