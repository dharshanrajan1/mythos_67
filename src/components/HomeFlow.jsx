import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Sparkles,
  Zap,
  Flame,
  Drumstick,
  Clock,
  ChefHat,
  Check,
  Send,
  Microscope,
  X,
  Thermometer,
  Target,
  Layers,
  Snowflake,
  Gauge,
  Eye,
  Cpu,
  Database,
  ScanLine,
  AlertTriangle,
  TrendingUp,
  Apple,
  Wheat,
  Beef,
  Leaf,
  Package,
  Milk,
  ChevronDown,
} from "lucide-react";
import { analyzeFridgeImage } from "../lib/visionApi.js";
import { getFoodDetails } from "../lib/foodbApi.js";
import { api } from "../lib/api.js";
import Confetti from "./Confetti.jsx";

export default function HomeFlow({ onExit, onLog }) {
  const [step, setStep] = useState("scan"); // scan | scanning | chat | confirm
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [source, setSource] = useState(null); // "openai" | "mock"
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [warning, setWarning] = useState(null);

  const runScan = async (file) => {
    setStep("scanning");
    setWarning(null);
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedUrl(url);
    } else {
      setUploadedUrl(null);
    }
    try {
      const r = await analyzeFridgeImage(file || null);
      setIngredients(r.ingredients || []);
      setRecipes(r.suggestedRecipes || []);
      setSource(r.source || null);
      if (r.warning) setWarning(r.warning);
      setStep("chat");
    } catch (err) {
      console.warn("scan failed:", err);
      setWarning(String(err?.message || err));
      setStep("chat");
    }
  };

  const startScan = () => runScan(null);
  const startScanWithFile = (file) => runScan(file);

  const pickRecipe = (r) => {
    setSelected(r);
    setStep("confirm");
    setTimeout(() => {
      onLog(r);
      setTimeout(onExit, 1400);
    }, 900);
  };

  return (
    <div className="relative h-full bg-ink-950">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-3">
        <button
          onClick={onExit}
          className="w-9 h-9 rounded-full glass flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              step === "scanning"
                ? "bg-macro-amber animate-pulse"
                : "bg-macro-green"
            }`}
          />
          <span className="text-[11px] font-medium">
            {step === "scanning" ? "Agent thinking..." : "MacroAgent"}
          </span>
        </div>
        <div className="w-9 h-9" />
      </div>

      {(step === "scan" || step === "scanning") && (
        <ScanScreen
          step={step}
          onStart={startScan}
          onPickFile={startScanWithFile}
          uploadedUrl={uploadedUrl}
        />
      )}
      {step === "chat" && (
        <ChatScreen
          ingredients={ingredients}
          recipes={recipes}
          onPick={pickRecipe}
        />
      )}
      {step === "confirm" && <ConfirmScreen recipe={selected} />}
    </div>
  );
}

/* ----------- Scan viewfinder (cinematic) ------------ */
// Each detected item has an absolute bounding box in % coords relative
// to the fridge viewport. The emoji sits centered in the box.
const DETECTIONS = [
  { id: "chi", emoji: "🍗", label: "Rotisserie chicken", conf: 97, fresh: 68, exp: 2,  box: { x: 6,  y: 8,  w: 28, h: 22 }, tone: "green" },
  { id: "egg", emoji: "🥚", label: "Eggs · dozen",       conf: 94, fresh: 92, exp: 9,  box: { x: 42, y: 10, w: 18, h: 20 }, tone: "green" },
  { id: "mlk", emoji: "🥛", label: "Whole milk 1L",      conf: 91, fresh: 80, exp: 5,  box: { x: 70, y: 6,  w: 22, h: 26 }, tone: "green" },
  { id: "cuc", emoji: "🥒", label: "Cucumber",            conf: 89, fresh: 75, exp: 4,  box: { x: 8,  y: 42, w: 22, h: 18 }, tone: "cyan" },
  { id: "scl", emoji: "🌱", label: "Scallion",            conf: 86, fresh: 60, exp: 3,  box: { x: 36, y: 42, w: 18, h: 18 }, tone: "cyan" },
  { id: "gar", emoji: "🧄", label: "Garlic · 6 cloves",   conf: 92, fresh: 98, exp: 21, box: { x: 60, y: 42, w: 14, h: 18 }, tone: "cyan" },
  { id: "soy", emoji: "🥫", label: "Soy sauce",           conf: 88, fresh: 99, exp: 120,box: { x: 10, y: 70, w: 18, h: 22 }, tone: "violet" },
  { id: "chl", emoji: "🌶️", label: "Chili oil",           conf: 90, fresh: 95, exp: 90, box: { x: 44, y: 70, w: 18, h: 22 }, tone: "amber" },
  { id: "ndl", emoji: "🍜", label: "Wheat noodles",       conf: 84, fresh: 99, exp: 60, box: { x: 70, y: 70, w: 22, h: 22 }, tone: "green" },
];

const PIPELINE_STAGES = [
  { key: "decode", label: "Decode frame", ms: 180, icon: Camera },
  { key: "segment", label: "Segment · YOLO-v8", ms: 420, icon: Layers },
  { key: "classify", label: "Classify · GPT-5.4 vision", ms: 520, icon: Cpu },
  { key: "ocr", label: "OCR labels & dates", ms: 260, icon: Eye },
  { key: "quant", label: "Quantity estimate", ms: 220, icon: Gauge },
  { key: "foodb", label: "FooDB lookup", ms: 240, icon: Database },
];

function ScanScreen({ step, onStart, onPickFile, uploadedUrl }) {
  const scanning = step === "scanning";
  const [thermal, setThermal] = useState(false);
  const [detectedIdx, setDetectedIdx] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const fileRef = useRef(null);

  // Animate detection count while scanning
  useEffect(() => {
    if (!scanning) {
      setDetectedIdx(0);
      setStageIdx(0);
      return;
    }
    setDetectedIdx(0);
    const total = DETECTIONS.length;
    let i = 0;
    const tick = setInterval(() => {
      i += 1;
      setDetectedIdx(Math.min(i, total));
      if (i >= total) clearInterval(tick);
    }, 240);
    return () => clearInterval(tick);
  }, [scanning]);

  // Pipeline stage stepper
  useEffect(() => {
    if (!scanning) return;
    let acc = 0;
    const timers = PIPELINE_STAGES.map((s, idx) => {
      acc += s.ms;
      return setTimeout(() => setStageIdx(idx + 1), acc);
    });
    return () => timers.forEach(clearTimeout);
  }, [scanning]);

  return (
    <div className="relative h-full flex flex-col bg-gradient-to-b from-ink-950 via-[#060914] to-ink-950 overflow-hidden">
      {/* Ambient aurora */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-macro-green/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-macro-cyan/15 blur-3xl pointer-events-none" />

      {/* Camera HUD top strip */}
      <div className="relative z-10 pt-14 px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 glass px-2.5 py-1 rounded-full">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              scanning ? "bg-macro-amber animate-pulse" : "bg-macro-green"
            }`}
          />
          <span className="hud-text text-[10px] text-white/75">
            {scanning ? "REC · VISION" : "LIVE · f/1.8"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setThermal((t) => !t)}
            className={`glass px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] hud-text transition ${
              thermal ? "text-macro-peach border-macro-peach/40" : "text-white/60"
            }`}
          >
            <Thermometer className="w-3 h-3" />
            {thermal ? "THERMAL" : "NORMAL"}
          </button>
          <div className="glass px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] hud-text text-white/70">
            <Snowflake className="w-3 h-3 text-macro-cyan" />
            3.4°C
          </div>
        </div>
      </div>

      {/* Viewfinder container */}
      <div className="relative flex-1 px-3 pt-3 pb-2">
        <div className="relative w-full h-full rounded-[28px] overflow-hidden border border-white/10 bg-gradient-to-b from-[#0B1226] to-[#030613]">
          {uploadedUrl ? (
            <UploadedPhotoLayer
              url={uploadedUrl}
              scanning={scanning}
              thermal={thermal}
            />
          ) : (
            <FridgeViewport
              scanning={scanning}
              thermal={thermal}
              detectedCount={detectedIdx}
            />
          )}

          {/* HUD counter overlay */}
          <div className="absolute top-3 left-3 glass-strong rounded-2xl px-3 py-2 flex items-center gap-2">
            <Target
              className={`w-3.5 h-3.5 ${
                scanning ? "text-macro-amber animate-reticle" : "text-macro-green"
              }`}
            />
            <div>
              <p className="hud-text text-[9px] uppercase tracking-wider text-white/45 leading-none">
                Detected
              </p>
              <p className="hud-text text-sm font-semibold leading-tight">
                <span className={scanning ? "animate-count-blink text-macro-green" : "text-macro-green"}>
                  {String(detectedIdx).padStart(2, "0")}
                </span>
                <span className="text-white/40">/{DETECTIONS.length}</span>
              </p>
            </div>
          </div>

          {/* Freshness summary overlay */}
          <div className="absolute top-3 right-3 glass-strong rounded-2xl px-3 py-2">
            <p className="hud-text text-[9px] uppercase tracking-wider text-white/45 leading-none">
              Avg fresh
            </p>
            <p className="hud-text text-sm font-semibold text-macro-green leading-tight">
              {scanning
                ? Math.min(96, 50 + detectedIdx * 6)
                : "--"}
              %
            </p>
          </div>

          {/* Processing pipeline — bottom-left */}
          {scanning && (
            <div className="absolute bottom-3 left-3 glass-strong rounded-2xl p-3 w-[220px] sm:w-[260px] animate-float-up">
              <p className="hud-text text-[9px] uppercase tracking-[0.2em] text-macro-green mb-2">
                · Pipeline · GPT-5.4
              </p>
              <ul className="space-y-1.5">
                {PIPELINE_STAGES.map((s, i) => {
                  const Icon = s.icon;
                  const done = i < stageIdx;
                  const active = i === stageIdx;
                  return (
                    <li key={s.key} className="flex items-center gap-2 text-[11px]">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                          done
                            ? "bg-macro-green/25 text-macro-green border border-macro-green/40"
                            : active
                            ? "bg-macro-amber/20 text-macro-amber border border-macro-amber/40"
                            : "bg-white/5 text-white/40 border border-white/8"
                        }`}
                      >
                        {done ? (
                          <Check className="w-3 h-3" />
                        ) : active ? (
                          <span className="w-2.5 h-2.5 rounded-full border-2 border-macro-amber border-t-transparent animate-spin" />
                        ) : (
                          <Icon className="w-3 h-3" />
                        )}
                      </span>
                      <span
                        className={`flex-1 truncate ${
                          done
                            ? "text-white/70"
                            : active
                            ? "text-white"
                            : "text-white/40"
                        }`}
                      >
                        {s.label}
                      </span>
                      {done && (
                        <span className="hud-text text-[9px] text-macro-green">OK</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Reticle dead-center when idle */}
          {!scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-28 h-28 animate-reticle">
                <div className="absolute inset-0 rounded-full border border-macro-green/40" />
                <div className="absolute inset-4 rounded-full border border-macro-green/60" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-macro-green/50" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-macro-green/50" />
                <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-macro-green shadow-[0_0_14px_#34E39F]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom control panel */}
      <div className="relative glass-strong mx-3 mb-4 p-4 lg:p-5 rounded-[28px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-macro-green" />
            <span className="hud-text text-[10px] uppercase tracking-[0.22em] text-macro-green">
              {scanning ? "AI Agent · GPT-5.4" : "Step 1 of 3 · Scan"}
            </span>
          </div>
          {scanning && (
            <span className="hud-text text-[10px] text-white/55">
              {Math.min(100, Math.round((stageIdx / PIPELINE_STAGES.length) * 100))}%
            </span>
          )}
        </div>
        <h2 className="text-lg font-semibold mb-0.5">
          {scanning
            ? "Reading your fridge…"
            : "Point at the fridge interior"}
        </h2>
        <p className="text-xs text-white/55 leading-relaxed">
          {scanning
            ? `Segmenting ${DETECTIONS.length} items · cross-referencing FooDB · matching to today's macros.`
            : "GPT-5.4 will identify ingredients, estimate quantities, and pull freshness from expiry cues."}
        </p>

        {scanning ? (
          <div className="mt-3 h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (stageIdx / PIPELINE_STAGES.length) * 100)}%`,
                background: "linear-gradient(90deg, #7BFFD3, #34E39F)",
                boxShadow: "0 0 14px rgba(52,227,159,0.6)",
              }}
            />
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 h-13 py-3.5 rounded-2xl font-semibold text-ink-950 flex items-center justify-center gap-2 active:scale-[0.98] transition relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #7BFFD3 0%, #34E39F 55%, #0F8A5F 100%)",
                boxShadow: "0 20px 50px -15px rgba(52, 227, 159, 0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              <Camera className="w-5 h-5" />
              Upload photo
              <span className="glass px-2 py-0.5 rounded-full text-[10px] ml-1 bg-white/40 text-ink-950/80 border border-ink-950/10">
                <Sparkles className="w-2.5 h-2.5 inline -mt-0.5" /> GPT-5.4
              </span>
            </button>
            <button
              onClick={onStart}
              className="h-13 px-4 py-3.5 rounded-2xl font-medium text-white/80 flex items-center justify-center gap-2 glass active:scale-[0.98] transition"
              title="Run a demo scan with mock data"
            >
              <ScanLine className="w-4 h-4 text-macro-green" />
              Demo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickFile(f);
                e.target.value = "";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* Photo layer — real uploaded image, with scan FX on top */
function UploadedPhotoLayer({ url, scanning, thermal }) {
  return (
    <div className="relative w-full h-full">
      <img
        src={url}
        alt="Fridge"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: thermal ? "saturate(0.3) hue-rotate(-20deg)" : "none" }}
      />
      <div className="absolute inset-0 bg-ink-950/20" />
      {thermal && <div className="absolute inset-0 thermal-wash pointer-events-none" />}
      {scanning && <div className="absolute inset-0 scan-grid pointer-events-none" />}
      {scanning && (
        <>
          <div
            className="absolute inset-x-0 h-24 pointer-events-none animate-scan-sweep"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(52, 227, 159, 0.35) 45%, rgba(52, 227, 159, 0.6) 50%, rgba(52, 227, 159, 0.35) 55%, transparent 100%)",
              filter: "blur(8px)",
            }}
          />
          <div
            className="absolute inset-x-0 h-0.5 pointer-events-none animate-scan-sweep"
            style={{
              background: "#34E39F",
              boxShadow: "0 0 18px #34E39F, 0 0 36px #34E39F",
            }}
          />
        </>
      )}
      {/* Viewfinder corners */}
      {["tl", "tr", "bl", "br"].map((c) => (
        <span
          key={c}
          className={`absolute w-6 h-6 pointer-events-none ${
            c.includes("t") ? "top-2" : "bottom-2"
          } ${c.includes("l") ? "left-2" : "right-2"} ${
            c.includes("t")
              ? c.includes("l")
                ? "border-t-2 border-l-2 rounded-tl-2xl"
                : "border-t-2 border-r-2 rounded-tr-2xl"
              : c.includes("l")
              ? "border-b-2 border-l-2 rounded-bl-2xl"
              : "border-b-2 border-r-2 rounded-br-2xl"
          }`}
          style={{
            borderColor: "#34E39F",
            boxShadow: "0 0 12px rgba(52,227,159,0.7)",
          }}
        />
      ))}
    </div>
  );
}

/* Simulated fridge interior with bounding boxes */
function FridgeViewport({ scanning, thermal, detectedCount }) {
  return (
    <div className="relative w-full h-full">
      {/* Ambient interior gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(150,220,255,0.22), transparent 55%), linear-gradient(180deg, #0E1730 0%, #060914 100%)",
        }}
      />

      {/* Shelves */}
      {[30, 62].map((top, i) => (
        <div
          key={i}
          className="fridge-shelf absolute inset-x-6 h-[2px] rounded-full"
          style={{ top: `${top}%` }}
        />
      ))}

      {/* Items — positioned at bbox center */}
      {DETECTIONS.map((d, i) => {
        const cx = d.box.x + d.box.w / 2;
        const cy = d.box.y + d.box.h / 2;
        return (
          <div
            key={d.id}
            className="absolute"
            style={{
              left: `${cx}%`,
              top: `${cy}%`,
              transform: "translate(-50%, -50%)",
              fontSize: 34,
              filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.7))",
              opacity: thermal ? 0.55 : 1,
              transition: "opacity .4s",
              zIndex: 1,
            }}
          >
            <span style={{ animationDelay: `${i * 0.1}s` }} className="animate-float-up">
              {d.emoji}
            </span>
          </div>
        );
      })}

      {/* Thermal wash overlay */}
      {thermal && <div className="absolute inset-0 thermal-wash pointer-events-none" />}

      {/* Scan grid overlay */}
      {scanning && (
        <div className="absolute inset-0 scan-grid pointer-events-none" />
      )}

      {/* Horizontal scan sweep */}
      {scanning && (
        <>
          <div
            className="absolute inset-x-0 h-24 pointer-events-none animate-scan-sweep"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(52, 227, 159, 0.35) 45%, rgba(52, 227, 159, 0.6) 50%, rgba(52, 227, 159, 0.35) 55%, transparent 100%)",
              filter: "blur(8px)",
            }}
          />
          <div
            className="absolute inset-x-0 h-0.5 pointer-events-none animate-scan-sweep"
            style={{
              background: "#34E39F",
              boxShadow: "0 0 18px #34E39F, 0 0 36px #34E39F",
            }}
          />
        </>
      )}

      {/* Bounding boxes + labels */}
      {DETECTIONS.slice(0, detectedCount).map((d, i) => (
        <DetectionBox key={d.id} d={d} index={i} />
      ))}

      {/* Viewfinder corners */}
      {["tl", "tr", "bl", "br"].map((c) => (
        <span
          key={c}
          className={`absolute w-6 h-6 pointer-events-none ${
            c.includes("t") ? "top-2" : "bottom-2"
          } ${c.includes("l") ? "left-2" : "right-2"} ${
            c.includes("t")
              ? c.includes("l")
                ? "border-t-2 border-l-2 rounded-tl-2xl"
                : "border-t-2 border-r-2 rounded-tr-2xl"
              : c.includes("l")
              ? "border-b-2 border-l-2 rounded-bl-2xl"
              : "border-b-2 border-r-2 rounded-br-2xl"
          }`}
          style={{
            borderColor: "#34E39F",
            boxShadow: "0 0 12px rgba(52,227,159,0.7)",
          }}
        />
      ))}
    </div>
  );
}

function DetectionBox({ d, index }) {
  const toneClass =
    d.tone === "amber"
      ? "bbox-amber"
      : d.tone === "cyan"
      ? "bbox-cyan"
      : d.tone === "violet"
      ? "bbox-violet"
      : "";
  const color =
    d.tone === "amber"
      ? "#FFB655"
      : d.tone === "cyan"
      ? "#5FD8FF"
      : d.tone === "violet"
      ? "#A78BFA"
      : "#34E39F";
  const labelAbove = d.box.y > 14;

  return (
    <div
      className={`bbox ${toneClass} animate-float-up`}
      style={{
        left: `${d.box.x}%`,
        top: `${d.box.y}%`,
        width: `${d.box.w}%`,
        height: `${d.box.h}%`,
        color,
        animationDelay: `${index * 0.05}s`,
        zIndex: 2,
      }}
    >
      <span className="corners" />
      {/* Label tag */}
      <div
        className="absolute whitespace-nowrap glass-strong rounded-lg px-2 py-1 flex items-center gap-1.5 text-[10px] hud-text"
        style={{
          top: labelAbove ? "-26px" : "calc(100% + 6px)",
          left: "-2px",
          borderColor: `${color}60`,
          color: "white",
        }}
      >
        <span className="text-[11px]">{d.emoji}</span>
        <span className="font-semibold truncate max-w-[120px]">{d.label}</span>
        <span style={{ color }} className="font-semibold">
          {d.conf}%
        </span>
      </div>
      {/* Freshness chip inside */}
      <div
        className="absolute bottom-1 right-1 rounded-full px-1.5 py-0.5 text-[8px] hud-text font-semibold"
        style={{
          background: `${color}22`,
          color,
          border: `1px solid ${color}50`,
        }}
      >
        {d.exp}d
      </div>
    </div>
  );
}

/* ----------- iMessage chat + carousel (live streaming) ------------ */
function ChatScreen({ ingredients, recipes, onPick }) {
  const [typed, setTyped] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [messages, setMessages] = useState([]);
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const scrollRef = useRef(null);
  const ctrlRef = useRef(null);
  const analysisRef = useRef(null);
  const autoAnalyzedRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setTyped(true), 1100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages, typed, streaming, analysis]);

  // Auto-trigger a detailed fridge analysis once ingredients arrive
  useEffect(() => {
    if (autoAnalyzedRef.current || !ingredients.length) return;
    autoAnalyzedRef.current = true;
    setAnalyzing(true);
    setAnalysis("");
    const list = ingredients
      .map((i) => `${i.emoji || ""} ${i.name} (${i.qty || "n/a"}, exp ${i.exp ?? "?"}d, ${i.category || "other"})`)
      .join("; ");
    analysisRef.current = api.chatStream({
      messages: [
        {
          role: "user",
          content:
            `I just scanned my fridge and the system detected these items: ${list}.\n\n` +
            `Give me a thorough analysis in 4 short sections with these exact headers — use them verbatim on their own line:\n` +
            `1) **Snapshot** — 1–2 sentences on what's in the fridge overall.\n` +
            `2) **Priorities** — bullet list (max 4) of the most urgent items to use and why.\n` +
            `3) **Macro potential** — rough grams of protein / carbs / fat available across the whole fridge.\n` +
            `4) **Meal prep ideas** — 3 bullet suggestions combining 2–3 items each.\n\n` +
            `Be concrete, mention specific items by name. Use markdown bullets (-).`,
        },
      ],
      onDelta: (chunk) => setAnalysis((prev) => prev + chunk),
      onDone: () => setAnalyzing(false),
      onError: (e) => {
        setAnalysis((prev) => prev + `\n[analysis unavailable: ${e?.detail || "stream failed"}]`);
        setAnalyzing(false);
      },
    });
    return () => analysisRef.current?.abort?.();
  }, [ingredients]);

  const send = (text) => {
    if (!text.trim() || streaming) return;
    const seedContext = ingredients.length
      ? `[Context: fridge scan detected ${ingredients.length} items: ${ingredients
          .map((i) => i.name)
          .join(", ")}]`
      : "";
    const userMsg = { role: "user", content: text.trim() };
    const asstMsg = { role: "assistant", content: "", streaming: true };
    const history = [...messages, userMsg];
    setMessages([...history, asstMsg]);
    setInput("");
    setStreaming(true);

    ctrlRef.current = api.chatStream({
      messages: [
        ...(seedContext ? [{ role: "user", content: seedContext }] : []),
        ...history.map(({ role, content }) => ({ role, content })),
      ],
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

  const suggestions = [
    "Use the protein-heavy items first",
    "What should I cook tonight?",
    "Plan tomorrow's lunch",
    "What's expiring first?",
  ];

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto no-scrollbar pt-16 pb-4 px-4 flex flex-col gap-2.5"
    >
      {/* Agent identity */}
      <div className="flex flex-col items-center py-2 mb-2 animate-float-up">
        <div className="w-14 h-14 rounded-full border border-white/15 bg-gradient-to-br from-macro-green/40 to-macro-green/10 flex items-center justify-center mb-2 shadow-glow">
          <ChefHat className="w-6 h-6 text-macro-green" />
        </div>
        <p className="text-sm font-semibold">MacroAgent</p>
        <p className="text-[10px] text-white/40">
          {streaming || analyzing ? "Typing…" : "Active now · GPT-5.4"}
        </p>
      </div>

      {/* Hero analysis summary */}
      <AnalysisSummary ingredients={ingredients} />

      {/* Freshness + category breakdowns */}
      <AnalysisBreakdown ingredients={ingredients} />

      {/* Priority items (what to eat first) */}
      <PriorityItems ingredients={ingredients} />

      {/* Live streaming analysis narrative */}
      <AnalysisNarrative text={analysis} streaming={analyzing} />

      {/* Agent bubble — inventory intro */}
      <Bubble side="agent" delay={200}>
        <p className="text-sm leading-relaxed">
          Full inventory —{" "}
          <span className="text-macro-green font-medium">
            {ingredients.length} items
          </span>
          . Tap any item to see FooDB nutrition + bioactive compounds.
        </p>
      </Bubble>

      {/* Inventory snapshot */}
      <InventorySnapshot ingredients={ingredients} />

      <Bubble side="agent" delay={300}>
        <p className="text-sm leading-relaxed">
          And here are{" "}
          <span className="text-macro-green font-medium">high-protein meals</span>{" "}
          using what you already have 💪
        </p>
      </Bubble>

      {/* Typing indicator → carousel */}
      {!typed ? (
        <div className="self-start bubble-agent px-4 py-3 rounded-2xl flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/60 animate-typing"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      ) : (
        <div className="-mx-4 px-4 animate-float-up">
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} onPick={() => onPick(r)} />
            ))}
          </div>
          <div className="flex justify-center gap-1 mt-1">
            {recipes.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full ${
                  i === 0 ? "w-6 bg-macro-green" : "w-1 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {typed && messages.length === 0 && (
        <>
          <Bubble side="agent" delay={0}>
            <p className="text-xs text-white/70">
              Tap <span className="text-macro-green font-medium">Cook & Log</span> on
              any card, or ask me anything about your fridge.
            </p>
          </Bubble>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={streaming}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white/4 border border-white/8 hover:bg-white/8 text-white/75 disabled:opacity-50 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Live conversation */}
      {messages.map((m, i) => (
        <Bubble key={i} side={m.role === "assistant" ? "agent" : "user"} delay={0}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {m.content}
            {m.streaming && (
              <span className="inline-block w-1.5 h-4 bg-macro-green ml-1 align-middle animate-pulse" />
            )}
          </p>
        </Bubble>
      ))}

      {/* iMessage input bar */}
      <div className="mt-2 glass px-3 py-2.5 rounded-full flex items-center gap-2">
        <Camera className="w-4 h-4 text-white/50" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          disabled={streaming}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/35 disabled:opacity-60"
          placeholder={streaming ? "MacroAgent is typing…" : "Ask MacroAgent anything…"}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || streaming}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
            input.trim() && !streaming
              ? "bg-macro-green text-ink-950"
              : "bg-white/10 text-white/40"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Hero analysis summary (total items + macro potential) ---------- */
const CATEGORY_PROTEIN = { protein: 22, produce: 2, dairy: 7, pantry: 6, other: 3 };
const CATEGORY_CARB = { protein: 0, produce: 7, dairy: 5, pantry: 42, other: 8 };
const CATEGORY_FAT = { protein: 9, produce: 0.3, dairy: 4, pantry: 10, other: 4 };

// Rough quantity parser — pulls grams/kilograms/pcs/bottles into an estimated gram weight.
function estimateGrams(qty) {
  if (!qty) return 180;
  const s = String(qty).toLowerCase();
  const kg = s.match(/([\d.]+)\s*kg/);
  if (kg) return Math.round(parseFloat(kg[1]) * 1000);
  const g = s.match(/([\d.]+)\s*g/);
  if (g) return parseFloat(g[1]);
  const pcs = s.match(/([\d.]+)\s*(pcs|piece|pc|pack|packs|clove|cloves|count|ct)/);
  if (pcs) return parseFloat(pcs[1]) * 60;
  const dozen = s.match(/dozen/); if (dozen) return 12 * 50;
  const bunch = s.match(/bunch/); if (bunch) return 120;
  if (s.includes("bottle") || s.includes("jar")) return 250;
  if (s.includes("tub") || s.includes("carton") || s.includes("box")) return 450;
  return 180;
}

function aggregateMacros(ingredients) {
  let cal = 0, p = 0, c = 0, f = 0;
  ingredients.forEach((it) => {
    const grams = estimateGrams(it.qty);
    const cat = (it.category || "other").toLowerCase();
    const per100P = it.protein ?? CATEGORY_PROTEIN[cat] ?? 5;
    const per100C = CATEGORY_CARB[cat] ?? 5;
    const per100F = CATEGORY_FAT[cat] ?? 3;
    const factor = grams / 100;
    p += per100P * factor;
    c += per100C * factor;
    f += per100F * factor;
    cal += (per100P * 4 + per100C * 4 + per100F * 9) * factor;
  });
  return { cal: Math.round(cal), p: Math.round(p), c: Math.round(c), f: Math.round(f) };
}

function AnalysisSummary({ ingredients }) {
  if (!ingredients.length) return null;
  const totals = aggregateMacros(ingredients);
  const avgExp =
    Math.round(
      (ingredients.reduce((a, i) => a + (i.exp ?? 14), 0) / ingredients.length) * 10
    ) / 10;
  const urgent = ingredients.filter((i) => (i.exp ?? 99) <= 3).length;
  const freshScore = Math.min(100, Math.round((avgExp / 14) * 100));
  const meals = Math.max(1, Math.round(totals.p / 35));

  return (
    <div className="animate-float-up glass-card p-4 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-macro-green/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-macro-amber/10 blur-3xl pointer-events-none" />

      <div className="relative flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-macro-green" />
        <span className="hud-text text-[10px] uppercase tracking-[0.22em] text-macro-green">
          Fridge analysis · GPT-5.4
        </span>
      </div>

      <div className="relative grid grid-cols-4 gap-2">
        <SummaryTile
          icon={<Package className="w-3.5 h-3.5" />}
          label="Items"
          value={ingredients.length}
          color="#34E39F"
        />
        <SummaryTile
          icon={<Drumstick className="w-3.5 h-3.5" />}
          label="Protein"
          value={`${totals.p}g`}
          sub="available"
          color="#FFB655"
        />
        <SummaryTile
          icon={<Leaf className="w-3.5 h-3.5" />}
          label="Freshness"
          value={`${freshScore}%`}
          sub={`${avgExp}d avg`}
          color="#5FD8FF"
        />
        <SummaryTile
          icon={<AlertTriangle className="w-3.5 h-3.5" />}
          label="Urgent"
          value={urgent}
          sub="≤ 3 days"
          color={urgent > 0 ? "#FF8F6B" : "#A78BFA"}
        />
      </div>

      <div className="relative mt-3 p-2.5 rounded-xl bg-macro-green/8 border border-macro-green/25 flex items-start gap-2">
        <TrendingUp className="w-3.5 h-3.5 text-macro-green shrink-0 mt-0.5" />
        <p className="text-[11px] text-white/80 leading-snug">
          Enough to cover ~{" "}
          <span className="text-macro-green font-semibold">{meals} high-protein meals</span>{" "}
          · {totals.cal} kcal · {totals.c}g C · {totals.f}g F stored.
        </p>
      </div>
    </div>
  );
}

function SummaryTile({ icon, label, value, sub, color }) {
  return (
    <div
      className="p-2.5 rounded-xl border text-center"
      style={{
        background: `${color}14`,
        borderColor: `${color}35`,
      }}
    >
      <div
        className="w-6 h-6 rounded-lg mx-auto flex items-center justify-center mb-1"
        style={{ background: `${color}24`, color }}
      >
        {icon}
      </div>
      <p className="text-base font-semibold leading-none">{value}</p>
      <p className="text-[9px] uppercase tracking-wider text-white/45 mt-0.5">
        {label}
      </p>
      {sub && <p className="text-[9px] text-white/55 mt-0.5 hud-text">{sub}</p>}
    </div>
  );
}

/* ---------- Freshness + category breakdowns ---------- */
function AnalysisBreakdown({ ingredients }) {
  if (!ingredients.length) return null;

  const fresh = ingredients.filter((i) => (i.exp ?? 99) > 7).length;
  const soon = ingredients.filter((i) => {
    const e = i.exp ?? 99;
    return e > 3 && e <= 7;
  }).length;
  const urgent = ingredients.filter((i) => (i.exp ?? 99) <= 3).length;
  const total = ingredients.length;

  const categories = ["protein", "produce", "dairy", "pantry", "other"].map((k) => ({
    key: k,
    count: ingredients.filter(
      (i) => (i.category || "other").toLowerCase() === k || (k === "other" && !["protein","produce","dairy","pantry"].includes((i.category||"").toLowerCase()))
    ).length,
  })).filter((c) => c.count > 0);

  const catMeta = {
    protein: { label: "Protein", color: "#34E39F", icon: <Beef className="w-3 h-3" /> },
    produce: { label: "Produce", color: "#5FD8FF", icon: <Leaf className="w-3 h-3" /> },
    dairy:   { label: "Dairy",   color: "#A78BFA", icon: <Milk className="w-3 h-3" /> },
    pantry:  { label: "Pantry",  color: "#FFB655", icon: <Wheat className="w-3 h-3" /> },
    other:   { label: "Other",   color: "#94A3B8", icon: <Apple className="w-3 h-3" /> },
  };

  return (
    <div
      className="animate-float-up glass-card p-4 space-y-3.5"
      style={{ animationDelay: "0.1s" }}
    >
      {/* Freshness distribution */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="hud-text text-[10px] uppercase tracking-[0.22em] text-white/55">
            Freshness distribution
          </p>
          <span className="text-[10px] text-white/40 hud-text">{total} items</span>
        </div>
        <div className="h-3 flex rounded-full overflow-hidden bg-white/5 border border-white/8">
          {fresh > 0 && (
            <div
              className="h-full relative group"
              style={{
                width: `${(fresh / total) * 100}%`,
                background: "linear-gradient(90deg, #7BFFD3, #34E39F)",
                boxShadow: "inset 0 0 8px rgba(52,227,159,0.6)",
              }}
            />
          )}
          {soon > 0 && (
            <div
              className="h-full"
              style={{
                width: `${(soon / total) * 100}%`,
                background: "linear-gradient(90deg, #FFD58A, #FFB655)",
              }}
            />
          )}
          {urgent > 0 && (
            <div
              className="h-full"
              style={{
                width: `${(urgent / total) * 100}%`,
                background: "linear-gradient(90deg, #FF8F6B, #FF5B5B)",
                boxShadow: "0 0 12px rgba(255,91,91,0.6)",
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px]">
          <LegendDot color="#34E39F" label="Fresh" count={fresh} />
          <LegendDot color="#FFB655" label="Soon" count={soon} sub="≤7d" />
          <LegendDot color="#FF5B5B" label="Urgent" count={urgent} sub="≤3d" />
        </div>
      </div>

      {/* Category distribution */}
      <div>
        <p className="hud-text text-[10px] uppercase tracking-[0.22em] text-white/55 mb-1.5">
          By category
        </p>
        <div className="space-y-1.5">
          {categories.map((c) => {
            const meta = catMeta[c.key] || catMeta.other;
            const pct = (c.count / total) * 100;
            return (
              <div key={c.key} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}40` }}
                >
                  {meta.icon}
                </div>
                <span className="text-[11px] w-16 text-white/75">{meta.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: meta.color,
                      boxShadow: `0 0 8px ${meta.color}80`,
                    }}
                  />
                </div>
                <span className="hud-text text-[10px] text-white/60 w-8 text-right">
                  {c.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label, count, sub }) {
  return (
    <span className="flex items-center gap-1 text-white/70">
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span className="font-medium">{label}</span>
      <span className="text-white/40">· {count}</span>
      {sub && <span className="text-white/35 ml-0.5 hud-text text-[9px]">{sub}</span>}
    </span>
  );
}

/* ---------- Priority items — what to eat first ---------- */
function PriorityItems({ ingredients }) {
  if (!ingredients.length) return null;
  const sorted = [...ingredients]
    .filter((i) => (i.exp ?? 99) <= 7)
    .sort((a, b) => (a.exp ?? 99) - (b.exp ?? 99))
    .slice(0, 4);

  if (!sorted.length) return null;

  return (
    <div
      className="animate-float-up glass-card p-4"
      style={{ animationDelay: "0.15s" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-macro-amber" />
          <span className="hud-text text-[10px] uppercase tracking-[0.22em] text-macro-amber">
            Use first · by expiry
          </span>
        </div>
        <span className="text-[10px] text-white/40 hud-text">{sorted.length} items</span>
      </div>
      <div className="space-y-1.5">
        {sorted.map((it, i) => {
          const exp = it.exp ?? 7;
          const color = exp <= 2 ? "#FF5B5B" : exp <= 4 ? "#FF8F6B" : "#FFB655";
          return (
            <div
              key={`${it.name}-${i}`}
              className="flex items-center gap-3 p-2 rounded-xl bg-white/4 border border-white/8"
            >
              <span className="text-xl" style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}>
                {it.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate">{it.name}</p>
                <p className="text-[10px] text-white/45 hud-text">{it.qty}</p>
              </div>
              <div
                className="px-2 py-1 rounded-lg text-[10px] font-semibold hud-text"
                style={{
                  background: `${color}20`,
                  color,
                  border: `1px solid ${color}40`,
                }}
              >
                {exp}d left
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Streaming narrative analysis (markdown-ish) ---------- */
function AnalysisNarrative({ text, streaming }) {
  const [open, setOpen] = useState(true);
  if (!text && !streaming) return null;

  return (
    <div
      className="animate-float-up glass-card p-4 relative overflow-hidden"
      style={{ animationDelay: "0.2s" }}
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-macro-cyan/15 blur-3xl pointer-events-none" />
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-macro-cyan" />
          <span className="hud-text text-[10px] uppercase tracking-[0.22em] text-macro-cyan">
            Deep analysis {streaming && "· writing…"}
          </span>
          {streaming && (
            <span className="w-1.5 h-1.5 rounded-full bg-macro-cyan animate-pulse" />
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div className="relative mt-2 text-[12.5px] leading-relaxed text-white/85 whitespace-pre-wrap">
          {renderMarkdownLite(text)}
          {streaming && (
            <span className="inline-block w-1.5 h-4 bg-macro-cyan ml-1 align-middle animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
}

function renderMarkdownLite(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const bold = /\*\*([^*]+)\*\*/g;
    const parts = [];
    let last = 0;
    let m;
    while ((m = bold.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index));
      parts.push(
        <strong key={`${i}-${m.index}`} className="text-macro-green font-semibold">
          {m[1]}
        </strong>
      );
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push(line.slice(last));

    const isHeader = /^\s*(\d\))?\s*\*\*[^*]+\*\*/.test(line) || /^#+\s/.test(line);
    const isBullet = /^\s*[-•]\s/.test(line);
    if (isHeader) {
      return (
        <p key={i} className="mt-2 mb-0.5 text-[11px] hud-text uppercase tracking-wider text-macro-cyan">
          {parts}
        </p>
      );
    }
    if (isBullet) {
      return (
        <div key={i} className="flex gap-2 pl-1">
          <span className="text-macro-green mt-1">·</span>
          <span>{line.replace(/^\s*[-•]\s*/, "")}</span>
        </div>
      );
    }
    return (
      <p key={i} className={line.trim() === "" ? "h-2" : ""}>
        {parts}
      </p>
    );
  });
}

/* ---------- Inventory snapshot (richer post-scan panel) ---------- */
function InventorySnapshot({ ingredients }) {
  const [filter, setFilter] = useState("all");
  const filtered =
    filter === "all"
      ? ingredients
      : filter === "expiring"
      ? ingredients.filter((i) => (i.exp ?? 99) <= 5)
      : ingredients.filter((i) => i.category === filter);

  const counts = {
    all: ingredients.length,
    protein: ingredients.filter((i) => i.category === "protein").length,
    produce: ingredients.filter((i) => i.category === "produce").length,
    pantry: ingredients.filter((i) => i.category === "pantry").length,
    expiring: ingredients.filter((i) => (i.exp ?? 99) <= 5).length,
  };

  return (
    <div
      className="animate-float-up glass-card p-3.5 relative overflow-hidden"
      style={{ animationDelay: "0.35s" }}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-macro-green/20 blur-3xl pointer-events-none" />

      <div className="relative flex items-center gap-2 mb-2">
        <Microscope className="w-3.5 h-3.5 text-macro-green" />
        <span className="hud-text text-[10px] uppercase tracking-[0.22em] text-macro-green">
          Inventory · FooDB linked
        </span>
        <span className="ml-auto text-[10px] text-white/45 hud-text">
          {filtered.length}/{ingredients.length}
        </span>
      </div>

      {/* Filter chips */}
      <div className="relative flex gap-1.5 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        <FilterChip label="All" count={counts.all} active={filter === "all"} onClick={() => setFilter("all")} />
        <FilterChip label="Expiring" count={counts.expiring} tone="amber" active={filter === "expiring"} onClick={() => setFilter("expiring")} />
        <FilterChip label="Protein" count={counts.protein} tone="green" active={filter === "protein"} onClick={() => setFilter("protein")} />
        <FilterChip label="Produce" count={counts.produce} tone="cyan" active={filter === "produce"} onClick={() => setFilter("produce")} />
        <FilterChip label="Pantry" count={counts.pantry} tone="violet" active={filter === "pantry"} onClick={() => setFilter("pantry")} />
      </div>

      {/* Item grid */}
      <div className="relative grid grid-cols-2 gap-1.5 mt-1">
        {filtered.map((it, i) => (
          <InventoryItem key={it.name} item={it} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-6 text-center text-xs text-white/40">
          Nothing in this category
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, count, tone, active, onClick }) {
  const colorMap = {
    green: "#34E39F",
    amber: "#FFB655",
    cyan: "#5FD8FF",
    violet: "#A78BFA",
  };
  const color = colorMap[tone] || "#FFFFFF";
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 border transition ${
        active
          ? "bg-white/10 border-white/20"
          : "bg-white/4 border-white/8 hover:bg-white/8"
      }`}
      style={active && tone ? { borderColor: `${color}60`, color } : undefined}
    >
      {label}
      <span
        className="text-[9px] px-1 py-px rounded-full"
        style={{
          background: tone ? `${color}22` : "rgba(255,255,255,0.1)",
          color: tone ? color : "rgba(255,255,255,0.7)",
        }}
      >
        {count}
      </span>
    </button>
  );
}

function InventoryItem({ item, index }) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const exp = item.exp ?? 30;
  const urgent = exp <= 3;
  const soon = exp > 3 && exp <= 7;
  const freshColor = urgent ? "#FF8F6B" : soon ? "#FFB655" : "#34E39F";
  const freshPct = Math.min(100, Math.max(5, (exp / 14) * 100));

  const onClick = async () => {
    setOpen(true);
    if (details) return;
    setLoading(true);
    const d = await getFoodDetails(item.name);
    setDetails(d);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={onClick}
        className="relative flex items-center gap-2 p-2 rounded-xl bg-white/4 border border-white/8 hover:bg-white/8 hover:border-white/15 transition text-left animate-float-up"
        style={{ animationDelay: `${index * 0.04}s` }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[20px] shrink-0"
          style={{
            background: `${freshColor}15`,
            border: `1px solid ${freshColor}30`,
          }}
        >
          {item.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold truncate">{item.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9px] text-white/45 hud-text truncate">
              {item.qty}
            </span>
            <span
              className="text-[8px] px-1 rounded-full hud-text font-semibold"
              style={{
                background: `${freshColor}20`,
                color: freshColor,
                border: `1px solid ${freshColor}40`,
              }}
            >
              {exp}d
            </span>
          </div>
          {/* Freshness bar */}
          <div className="mt-1 h-[3px] rounded-full bg-white/6 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${freshPct}%`,
                background: freshColor,
                boxShadow: `0 0 6px ${freshColor}80`,
              }}
            />
          </div>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-950/80 backdrop-blur-md p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm glass-strong rounded-[28px] p-5 relative animate-float-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/8 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: `${freshColor}18`,
                  border: `1px solid ${freshColor}40`,
                }}
              >
                {item.emoji}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-macro-green hud-text">
                  FooDB {details?.foodbId || "lookup"}
                </p>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-[11px] text-white/50">
                  {item.qty}
                  <span className="mx-1">·</span>
                  <span style={{ color: freshColor }}>expires in {exp}d</span>
                </p>
              </div>
            </div>

            {loading && <div className="mt-4 h-24 rounded-2xl shimmer" />}

            {details && !loading && (
              <>
                <div className="mt-4 grid grid-cols-4 gap-1.5">
                  <NutriBox label="kcal" v={details.per100g.kcal} />
                  <NutriBox label="protein" v={`${details.per100g.protein}g`} accent />
                  <NutriBox label="carbs" v={`${details.per100g.carbs}g`} />
                  <NutriBox label="fat" v={`${details.per100g.fat}g`} />
                </div>
                <p className="text-[10px] text-white/45 mt-1">per 100g</p>

                {details.compounds?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/50 mb-2">
                      Bioactive compounds
                    </p>
                    <div className="space-y-1.5">
                      {details.compounds.map((c) => (
                        <div
                          key={c.name}
                          className="flex items-center gap-2 text-[12px] p-2 rounded-lg bg-white/4 border border-white/6"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-macro-green shrink-0" />
                          <span className="font-medium">{c.name}</span>
                          <span className="text-white/45 flex-1">{c.role}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/8 border border-white/10">
                            {c.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-macro-green/10 border border-macro-green/30">
                  <Sparkles className="w-3.5 h-3.5 text-macro-green shrink-0 mt-0.5" />
                  <p className="text-[12px] text-white/85 leading-snug">
                    {details.insight}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function IngredientChip({ ingredient }) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setOpen(true);
    if (details) return;
    setLoading(true);
    const d = await getFoodDetails(ingredient.name);
    setDetails(d);
    setLoading(false);
  };

  const hasCompound = details?.compounds?.length > 0;

  return (
    <>
      <button
        onClick={onClick}
        className="text-[11px] glass px-2 py-1 rounded-full flex items-center gap-1 hover:bg-white/8 transition"
      >
        <span>{ingredient.emoji}</span>
        <span className="text-white/80">{ingredient.name}</span>
        <Microscope className="w-2.5 h-2.5 text-macro-green" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-950/80 backdrop-blur-md p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm glass-strong rounded-[28px] p-5 relative animate-float-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/8 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/8 flex items-center justify-center text-3xl">
                {ingredient.emoji}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-macro-green">
                  FooDB {details?.foodbId || "lookup"}
                </p>
                <h3 className="text-lg font-semibold">{ingredient.name}</h3>
                <p className="text-[11px] text-white/50">{ingredient.qty}</p>
              </div>
            </div>

            {loading && (
              <div className="mt-4 h-24 rounded-2xl shimmer" />
            )}

            {details && !loading && (
              <>
                <div className="mt-4 grid grid-cols-4 gap-1.5">
                  <NutriBox label="kcal" v={details.per100g.kcal} />
                  <NutriBox label="protein" v={`${details.per100g.protein}g`} accent />
                  <NutriBox label="carbs" v={`${details.per100g.carbs}g`} />
                  <NutriBox label="fat" v={`${details.per100g.fat}g`} />
                </div>
                <p className="text-[10px] text-white/45 mt-1">per 100g</p>

                {hasCompound && (
                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/50 mb-2">
                      Bioactive compounds
                    </p>
                    <div className="space-y-1.5">
                      {details.compounds.map((c) => (
                        <div
                          key={c.name}
                          className="flex items-center gap-2 text-[12px] p-2 rounded-lg bg-white/4 border border-white/6"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-macro-green shrink-0" />
                          <span className="font-medium">{c.name}</span>
                          <span className="text-white/45 flex-1">{c.role}</span>
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/8 border border-white/10"
                          >
                            {c.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-macro-green/10 border border-macro-green/30">
                  <Sparkles className="w-3.5 h-3.5 text-macro-green shrink-0 mt-0.5" />
                  <p className="text-[12px] text-white/85 leading-snug">
                    {details.insight}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function NutriBox({ label, v, accent }) {
  return (
    <div
      className={`p-2 rounded-lg text-center ${
        accent
          ? "bg-macro-green/15 border border-macro-green/30"
          : "bg-white/5 border border-white/8"
      }`}
    >
      <p
        className={`text-sm font-semibold ${accent ? "text-macro-green" : ""}`}
      >
        {v}
      </p>
      <p className="text-[9px] uppercase tracking-wider text-white/45">
        {label}
      </p>
    </div>
  );
}

function Bubble({ side, delay = 0, children }) {
  const cls =
    side === "agent"
      ? "self-start bubble-agent"
      : "self-end bubble-user";
  return (
    <div
      className={`${cls} px-4 py-2.5 rounded-2xl max-w-[82%] animate-bubble-in shadow-soft`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function RecipeCard({ recipe, onPick }) {
  return (
    <div
      className={`snap-center shrink-0 w-[76%] glass-card overflow-hidden relative`}
      style={{ boxShadow: `0 16px 40px -20px ${recipe.accent}55` }}
    >
      {/* Header */}
      <div
        className={`relative h-36 bg-gradient-to-br ${recipe.tint} flex items-center justify-center overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />
        <span className="text-6xl drop-shadow-lg">{recipe.emoji}</span>
        <div className="absolute top-3 left-3 glass px-2 py-1 rounded-full flex items-center gap-1 text-[10px]">
          <Clock className="w-3 h-3" />
          {recipe.minutes}m · {recipe.difficulty}
        </div>
        <div
          className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-semibold border"
          style={{
            color: recipe.accent,
            borderColor: `${recipe.accent}60`,
            background: `${recipe.accent}18`,
          }}
        >
          <Sparkles className="w-3 h-3 inline mr-0.5" /> Agent pick
        </div>
      </div>

      <div className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-white/40">
          {recipe.subtitle}
        </p>
        <h3 className="text-base font-semibold mt-0.5 leading-tight">
          {recipe.title}
        </h3>

        <div className="flex gap-2 mt-2 flex-wrap">
          {recipe.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-1.5 mt-3 mb-3">
          <MacroPill icon={<Flame className="w-3 h-3" />} value={recipe.calories} label="kcal" />
          <MacroPill icon={<Drumstick className="w-3 h-3" />} value={`${recipe.protein}g`} label="prot" accent />
          <MacroPill value={`${recipe.carbs}g`} label="carb" />
          <MacroPill value={`${recipe.fat}g`} label="fat" />
        </div>

        <p className="text-[11px] text-white/55 leading-relaxed mb-3 line-clamp-2">
          {recipe.why}
        </p>

        <button
          onClick={onPick}
          className="w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-1.5 text-sm active:scale-[0.98] transition shadow-glow"
          style={{
            background: `linear-gradient(135deg, ${recipe.accent}, ${recipe.accent}cc)`,
            color: "#062119",
          }}
        >
          <Zap className="w-4 h-4" /> Cook & Log
        </button>
      </div>
    </div>
  );
}

function MacroPill({ icon, value, label, accent }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg py-1.5 ${
        accent ? "bg-macro-green/15 border border-macro-green/30" : "bg-white/5 border border-white/8"
      }`}
    >
      <div className={`flex items-center gap-0.5 ${accent ? "text-macro-green" : "text-white/80"}`}>
        {icon}
        <span className="text-xs font-semibold">{value}</span>
      </div>
      <span className="text-[9px] text-white/40 uppercase tracking-wider">{label}</span>
    </div>
  );
}

/* ----------- Confirm screen ------------ */
function ConfirmScreen({ recipe }) {
  return (
    <div className="relative h-full flex flex-col items-center justify-center p-8">
      <Confetti />
      <div className="relative z-10 flex flex-col items-center text-center animate-float-up">
        <div className="w-24 h-24 rounded-full bg-macro-green/20 flex items-center justify-center mb-5 animate-pulse-glow">
          <div className="w-16 h-16 rounded-full bg-macro-green flex items-center justify-center shadow-glow">
            <Check className="w-9 h-9 text-ink-950 stroke-[3]" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold">Logged!</h2>
        <p className="text-sm text-white/60 mt-1 max-w-[260px]">
          <span className="text-gradient-green font-medium">{recipe?.title}</span>{" "}
          cooked. Macros synced to today.
        </p>
        <div className="mt-5 flex gap-2">
          <ResultChip label="kcal" value={`+${recipe?.calories}`} />
          <ResultChip label="protein" value={`+${recipe?.protein}g`} accent />
          <ResultChip label="carbs" value={`+${recipe?.carbs}g`} />
          <ResultChip label="fat" value={`+${recipe?.fat}g`} />
        </div>
      </div>
    </div>
  );
}

function ResultChip({ label, value, accent }) {
  return (
    <div
      className={`glass-card px-3 py-2 rounded-2xl text-center ${
        accent ? "shadow-glow" : ""
      }`}
    >
      <p
        className={`text-sm font-semibold ${
          accent ? "text-macro-green" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="text-[9px] uppercase tracking-wider text-white/45">{label}</p>
    </div>
  );
}
