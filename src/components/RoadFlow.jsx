import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Sparkles,
  Star,
  Clock,
  TrendingUp,
  Flame,
  Drumstick,
  Check,
  ShieldCheck,
  X,
  Plus,
} from "lucide-react";
import { venues as fallbackVenues, menus as fallbackMenus } from "../data/mockData.js";
import { api } from "../lib/api.js";
import Confetti from "./Confetti.jsx";

export default function RoadFlow({ onExit, onLog }) {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loggedId, setLoggedId] = useState(null);
  const [venues, setVenues] = useState(fallbackVenues);
  const [menuByVenue, setMenuByVenue] = useState(fallbackMenus);

  useEffect(() => {
    api.venues().then((v) => { if (v?.length) setVenues(v); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedVenue || menuByVenue[selectedVenue.id]?.length) return;
    api.venueMenu(selectedVenue.id)
      .then((items) => setMenuByVenue((prev) => ({ ...prev, [selectedVenue.id]: items })))
      .catch(() => {});
  }, [selectedVenue, menuByVenue]);

  const handleLog = (item) => {
    setLoggedId(item.id);
    setTimeout(() => {
      onLog(item);
      setLoggedId(null);
      setSelectedVenue(null);
      setTimeout(onExit, 600);
    }, 900);
  };

  return (
    <div className="relative h-full bg-ink-950">
      <Map onExit={onExit} />
      <VenueSheet
        venues={venues}
        onSelect={setSelectedVenue}
        hidden={!!selectedVenue}
      />
      {selectedVenue && (
        <MenuOverlay
          venue={selectedVenue}
          items={menuByVenue[selectedVenue.id] || []}
          onClose={() => setSelectedVenue(null)}
          onLog={handleLog}
          loggedId={loggedId}
        />
      )}
    </div>
  );
}

/* ----------- Stylized Map ------------ */
function Map({ onExit }) {
  const pins = [
    { x: "28%", y: "32%", tone: "green", label: "Sweetgreen", match: 92 },
    { x: "58%", y: "26%", tone: "green", label: "Xi'an", match: 88 },
    { x: "42%", y: "58%", tone: "amber", label: "Trader Joe's", match: 81 },
    { x: "72%", y: "64%", tone: "violet", label: "Din Tai Fung", match: 74 },
    { x: "20%", y: "72%", tone: "green", label: "Kaze", match: 86 },
  ];

  return (
    <div className="relative h-full map-roads">
      <div className="absolute inset-0 map-grid" />
      {/* Stylized roads */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 700">
        <defs>
          <linearGradient id="road" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(167,139,250,0.15)" />
            <stop offset="50%" stopColor="rgba(52,227,159,0.25)" />
            <stop offset="100%" stopColor="rgba(95,216,255,0.15)" />
          </linearGradient>
        </defs>
        <path
          d="M-20 180 C 80 120, 200 260, 300 200 S 440 280, 460 240"
          fill="none"
          stroke="url(#road)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M-20 440 C 120 380, 220 520, 300 460 S 440 520, 460 480"
          fill="none"
          stroke="url(#road)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M200 -20 C 160 180, 280 320, 220 520 S 240 700, 220 720"
          fill="none"
          stroke="url(#road)"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      {/* Top chrome */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-3 flex items-center justify-between">
        <button
          onClick={onExit}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="glass-strong px-4 py-2 rounded-full flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-macro-green" />
          <span className="text-xs font-medium">Nearby · 10 min radius</span>
        </div>
        <button className="w-10 h-10 rounded-full glass-strong flex items-center justify-center">
          <Navigation className="w-4 h-4 text-macro-green" />
        </button>
      </div>

      {/* User blue-dot */}
      <div className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <span className="absolute -inset-6 rounded-full bg-macro-cyan/30 blur-xl animate-pulse" />
          <div className="relative w-5 h-5 rounded-full bg-macro-cyan border-2 border-white shadow-[0_0_20px_#5FD8FF]" />
        </div>
      </div>

      {/* Pins */}
      {pins.map((p, i) => (
        <MapPinMarker key={i} {...p} delay={i * 0.1} />
      ))}

      {/* Match summary chip */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 glass-strong px-3 py-2 rounded-2xl flex items-center gap-2 animate-float-up">
        <div className="w-6 h-6 rounded-full bg-macro-green/20 flex items-center justify-center">
          <TrendingUp className="w-3.5 h-3.5 text-macro-green" />
        </div>
        <div className="text-[11px] leading-tight">
          <p className="text-white/80 font-medium">
            7 spots match your protein goal
          </p>
          <p className="text-white/45 text-[10px]">
            Ranked by AI fit · updated 2 min ago
          </p>
        </div>
      </div>
    </div>
  );
}

function MapPinMarker({ x, y, tone, label, match, delay }) {
  const color =
    tone === "green" ? "#34E39F" : tone === "amber" ? "#FFB655" : "#A78BFA";
  return (
    <div
      className="absolute animate-float-up"
      style={{ left: x, top: y, animationDelay: `${delay}s` }}
    >
      <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-full">
        <div className="glass-strong px-2 py-1 rounded-full flex items-center gap-1 mb-1 text-[10px] whitespace-nowrap">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
          <span className="font-medium">{label}</span>
          <span className="text-white/45">· {match}%</span>
        </div>
        <div
          className="w-8 h-8 rounded-full border-2 border-white/80 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}80)`,
            boxShadow: `0 0 18px ${color}, 0 6px 16px rgba(0,0,0,0.5)`,
          }}
        >
          <MapPin className="w-4 h-4 text-white" fill="currentColor" strokeWidth={1.5} />
        </div>
        <div
          className="w-2 h-2 rounded-full mt-0.5"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}

/* ----------- Bottom sheet of venues ------------ */
function VenueSheet({ venues, onSelect, hidden }) {
  return (
    <div
      className={`absolute left-0 right-0 bottom-0 z-30 transition-transform duration-500 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="glass-strong rounded-t-[32px] pt-2 pb-5 px-4 max-h-[58%] overflow-hidden">
        <div className="mx-auto w-10 h-1 rounded-full bg-white/25 mb-3" />
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-lg font-semibold">Near you</h2>
            <p className="text-[11px] text-white/50">
              {venues.length} spots · sorted by macro fit
            </p>
          </div>
          <div className="flex gap-1.5">
            {["All", "Chinese", "Grocery", "$"].map((f, i) => (
              <button
                key={f}
                className={`text-[11px] px-2.5 py-1 rounded-full border ${
                  i === 0
                    ? "bg-macro-green text-ink-950 border-macro-green font-semibold"
                    : "bg-white/5 border-white/10 text-white/70"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2 overflow-y-auto no-scrollbar max-h-[44vh] pb-2">
          {venues.map((v) => (
            <VenueRow key={v.id} venue={v} onClick={() => onSelect(v)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function VenueRow({ venue, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full glass-card bento-hover p-3 flex items-center gap-3 active:scale-[0.99] transition text-left"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center text-2xl">
        {venue.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold truncate">{venue.name}</h3>
          <span className="text-[10px] text-white/40">{venue.price}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/55 mt-0.5">
          <span className="truncate">{venue.type}</span>
          <span className="text-white/25">·</span>
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-macro-amber text-macro-amber" />
            {venue.rating}
          </span>
          <span className="text-white/25">·</span>
          <span>{venue.distance}</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-macro-green/60 to-macro-green"
              style={{
                width: `${venue.match}%`,
                boxShadow: "0 0 8px #34E39F",
              }}
            />
          </div>
          <span className="text-[10px] text-macro-green font-semibold w-10 text-right">
            {venue.match}%
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] text-macro-green flex items-center gap-0.5">
          <Clock className="w-3 h-3" />
          Open
        </span>
        <span className="text-[10px] text-white/45">til {venue.openUntil}</span>
      </div>
    </button>
  );
}

/* ----------- Menu AI Analysis overlay ------------ */
function MenuOverlay({ venue, items, onClose, onLog, loggedId }) {
  return (
    <div className="absolute inset-0 z-40 bg-ink-950 animate-float-up flex flex-col">
      {/* Hero */}
      <div className="relative px-5 pt-4 pb-5 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-macro-green/20 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-macro-green" />
            <span className="text-[11px] font-medium">Menu Agent · analyzing</span>
          </div>
        </div>
        <div className="relative mt-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-[22px] bg-white/8 border border-white/12 flex items-center justify-center text-4xl">
            {venue.emoji}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{venue.name}</h2>
            <p className="text-xs text-white/55 mt-0.5">{venue.type}</p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-white/60">
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-macro-amber text-macro-amber" />
                {venue.rating}
              </span>
              <span className="text-white/25">·</span>
              <span>{venue.distance}</span>
              <span className="text-white/25">·</span>
              <span>{venue.price}</span>
            </div>
          </div>
        </div>

        <div className="relative mt-4 glass-card p-3.5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-macro-green/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-macro-green" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-macro-green">
              Agent insight
            </p>
            <p className="text-sm text-white/85 mt-0.5 leading-snug">
              {venue.id === "v2"
                ? "Swap noodle bowls for meat-forward plates — hits your remaining 45g protein."
                : "Focus on greens + lean protein bowls. Skip carb-heavy sides today."}
            </p>
          </div>
        </div>
      </div>

      {/* Menu list */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        <div className="flex items-center justify-between px-1 mb-2.5">
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-white/50">
            Menu
          </h3>
          <span className="text-[11px] text-macro-green flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {items.filter((i) => i.recommend).length}{" "}
            matches
          </span>
        </div>

        <div className="space-y-2.5">
          {items.map((item, i) => (
            <MenuRow
              key={item.id}
              item={item}
              delay={i * 60}
              onLog={() => onLog(item)}
              logged={loggedId === item.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuRow({ item, delay, onLog, logged }) {
  const match = item.recommend;
  return (
    <div
      className={`relative rounded-2xl border overflow-hidden animate-float-up ${
        match
          ? "bg-gradient-to-br from-macro-green/12 to-transparent border-macro-green/35"
          : "glass border-white/8 opacity-75"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {match && (
        <div className="absolute -top-px left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-macro-green to-transparent" />
      )}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-sm font-semibold ${
                  match ? "text-white" : "text-white/70"
                }`}
              >
                {item.name}
              </h4>
              {match && (
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-macro-green text-ink-950 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  Agent rec
                </span>
              )}
            </div>
            {item.note && (
              <p
                className={`text-[11px] mt-1 leading-snug ${
                  match ? "text-macro-green/90" : "text-white/45"
                }`}
              >
                {item.note}
              </p>
            )}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <Nutri icon={<Flame className="w-3 h-3" />} val={item.cal} label="kcal" />
              <Nutri
                icon={<Drumstick className="w-3 h-3" />}
                val={`${item.p}g`}
                label="protein"
                accent={match}
              />
              <Nutri val={`${item.c}g`} label="carbs" />
              <Nutri val={`${item.f}g`} label="fat" />
            </div>
          </div>
          <button
            onClick={onLog}
            disabled={logged}
            className={`shrink-0 h-9 px-3 rounded-xl font-semibold flex items-center gap-1.5 text-xs transition active:scale-95 ${
              match
                ? "bg-macro-green text-ink-950 shadow-glow"
                : "bg-white/10 text-white/75 border border-white/10"
            }`}
          >
            {logged ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> I ate this
              </>
            )}
          </button>
        </div>
      </div>
      {logged && <Confetti />}
    </div>
  );
}

function Nutri({ icon, val, label, accent }) {
  return (
    <div
      className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] ${
        accent
          ? "bg-macro-green/18 text-macro-green border border-macro-green/30"
          : "bg-white/5 text-white/65 border border-white/8"
      }`}
    >
      {icon}
      <span className="font-semibold">{val}</span>
      <span className="opacity-60">{label}</span>
    </div>
  );
}
