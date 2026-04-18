import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Refrigerator,
  Car,
  ChefHat,
  Send,
  Camera,
  Mic,
  ScanBarcode,
} from "lucide-react";
import { api } from "../lib/api.js";

export default function AgentScreen({ onFlow, user }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content: `Afternoon${user?.name ? `, ${user.name}` : ""}. You're at ${
        user?.today?.protein?.current ?? 0
      }g / ${user?.today?.protein?.target ?? 160}g protein. Still have a meal slot — want me to plan around your fridge or find a spot nearby?`,
    },
  ]);
  const [streaming, setStreaming] = useState(false);
  const [actions, setActions] = useState([]);
  const ctrlRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.agentActions().then((a) => setActions(a.slice(0, 3))).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages, streaming]);

  const send = (text) => {
    if (!text.trim() || streaming) return;
    const nextUser = { role: "user", content: text.trim() };
    const nextAssistant = { role: "assistant", content: "", streaming: true };
    const nextHistory = [...messages, nextUser];
    setMessages([...nextHistory, nextAssistant]);
    setInput("");
    setStreaming(true);

    ctrlRef.current = api.chatStream({
      messages: nextHistory.map(({ role, content }) => ({ role, content })),
      onDelta: (chunk) => {
        setMessages((prev) => {
          const copy = prev.slice();
          const last = copy[copy.length - 1];
          if (last?.streaming) copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        });
      },
      onDone: () => {
        setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)));
        setStreaming(false);
      },
      onError: (e) => {
        setMessages((prev) => {
          const copy = prev.slice();
          copy[copy.length - 1] = {
            role: "assistant",
            content: `[error: ${e?.detail || "stream failed"}]`,
            streaming: false,
          };
          return copy;
        });
        setStreaming(false);
      },
    });
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="animate-float-up grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
      <section className="lg:col-span-8 glass-card p-4 lg:p-6 relative overflow-hidden min-h-[520px] flex flex-col">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-macro-green/20 blur-3xl" />
        <div className="relative flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-macro-green to-macro-greenDeep flex items-center justify-center shadow-glow">
            <ChefHat className="w-5 h-5 text-ink-950" />
          </div>
          <div>
            <p className="text-sm font-semibold">MacroAgent</p>
            <p className="text-[11px] text-macro-green flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${streaming ? "bg-macro-amber animate-pulse" : "bg-macro-green animate-pulse"}`} />
              {streaming ? "Typing…" : "Active · GPT-5.4 vision"}
            </p>
          </div>
        </div>

        {/* Mode CTAs */}
        <div className="relative flex gap-2 mb-3">
          <ModeCTA
            onClick={() => onFlow("home")}
            icon={<Refrigerator className="w-5 h-5" />}
            title="Eat at Home"
            subtitle="Scan fridge · GPT-5.4"
            accent="#34E39F"
            badge="Live"
          />
          <ModeCTA
            onClick={() => onFlow("road")}
            icon={<Car className="w-5 h-5" />}
            title="On the Road"
            subtitle="7 healthy spots nearby"
            accent="#FFB655"
            badge="Map"
          />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="relative flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-1">
          {messages.map((m, i) => (
            <Bubble key={i} side={m.role === "assistant" ? "agent" : "user"}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {m.content}
                {m.streaming && <span className="inline-block w-1.5 h-4 bg-macro-green ml-1 align-middle animate-pulse" />}
              </p>
            </Bubble>
          ))}
        </div>

        {/* Input bar */}
        <div className="relative mt-4 flex items-center gap-2">
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center shrink-0" title="Photo">
            <Camera className="w-4 h-4 text-white/70" />
          </button>
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center shrink-0" title="Barcode">
            <ScanBarcode className="w-4 h-4 text-white/70" />
          </button>
          <div className="flex-1 h-11 glass rounded-full flex items-center px-4 gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask MacroAgent anything…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/35"
              disabled={streaming}
            />
            <Mic className="w-4 h-4 text-white/50" />
          </div>
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
              input.trim() && !streaming
                ? "bg-macro-green text-ink-950 shadow-glow"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Suggestions sidebar */}
      <section className="lg:col-span-4 space-y-3">
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-macro-green/20 blur-3xl" />
          <p className="text-[10px] uppercase tracking-[0.22em] text-macro-green mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Ask the agent
          </p>
          <div className="space-y-1.5">
            {[
              "Plan tomorrow's meals around leg day",
              "Best quick lunch under 500 kcal?",
              "What should I grab at Trader Joe's?",
              "Am I on track this week?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={streaming}
                className="w-full text-left text-sm text-white/75 px-3 py-2 rounded-xl bg-white/4 hover:bg-white/8 transition border border-white/5 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-3">
            Recent agent actions
          </p>
          <ul className="space-y-2.5 text-sm">
            {actions.length === 0 && (
              <li className="text-xs text-white/40 italic">No actions yet.</li>
            )}
            {actions.map((a) => (
              <li key={a.id} className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-macro-green/20 flex items-center justify-center text-[11px]">
                  {iconFor(a.kind)}
                </span>
                <span className="flex-1 truncate">{a.summary}</span>
                <span className="text-[10px] text-white/40">{relTime(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function iconFor(kind) {
  return kind === "scan" ? "📸" : kind === "restaurant" ? "📍" : "🍽️";
}

function relTime(ts) {
  if (!ts) return "";
  const d = Date.now() - ts;
  if (d < 60_000) return `${Math.max(1, Math.round(d / 1000))}s`;
  if (d < 3_600_000) return `${Math.round(d / 60_000)}m`;
  if (d < 86_400_000) return `${Math.round(d / 3_600_000)}h`;
  return `${Math.round(d / 86_400_000)}d`;
}

function Bubble({ side, children }) {
  const cls = side === "agent" ? "self-start bubble-agent" : "self-end bubble-user ml-auto";
  return (
    <div className={`${cls} px-4 py-2.5 rounded-2xl max-w-[82%] animate-bubble-in`}>
      {children}
    </div>
  );
}

function ModeCTA({ onClick, icon, title, subtitle, accent, badge }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 glass-card p-3 text-left bento-hover active:scale-[0.98] transition relative overflow-hidden"
      style={{ boxShadow: `0 16px 40px -24px ${accent}55` }}
    >
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-40"
        style={{ background: accent }}
      />
      <div className="relative flex items-center gap-2 mb-1.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: `${accent}22`,
            color: accent,
            border: `1px solid ${accent}40`,
          }}
        >
          {icon}
        </div>
        <span
          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
          style={{
            color: accent,
            borderColor: `${accent}50`,
            background: `${accent}14`,
          }}
        >
          {badge}
        </span>
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-[11px] text-white/50 mt-0.5 truncate">{subtitle}</p>
    </button>
  );
}
