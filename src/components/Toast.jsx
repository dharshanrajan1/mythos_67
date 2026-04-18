import { useEffect } from "react";
import { Check } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 animate-float-up"
    >
      <div className="glass-strong flex items-center gap-3 px-5 py-3.5 rounded-full shadow-glow">
        <span className="w-7 h-7 rounded-full bg-macro-green flex items-center justify-center text-ink-950">
          <Check className="w-4 h-4 stroke-[3]" />
        </span>
        <span className="text-sm font-medium text-white pr-1">{toast.message}</span>
      </div>
    </div>
  );
}
