/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080F",
          900: "#0B0E1A",
          800: "#111527",
          700: "#1A1F35",
          600: "#252A44",
        },
        macro: {
          green: "#34E39F",
          greenDeep: "#0F8A5F",
          mint: "#7BFFD3",
          amber: "#FFB655",
          peach: "#FF8F6B",
          cyan: "#5FD8FF",
          violet: "#A78BFA",
        },
      },
      fontFamily: {
        sf: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass: "0 20px 60px -20px rgba(52, 227, 159, 0.25)",
        soft: "0 10px 40px rgba(7, 8, 15, 0.5)",
        glow: "0 0 0 1px rgba(52, 227, 159, 0.4), 0 0 40px rgba(52, 227, 159, 0.25)",
        glowAmber: "0 0 0 1px rgba(255, 182, 85, 0.4), 0 0 40px rgba(255, 182, 85, 0.2)",
      },
      animation: {
        "aurora": "aurora 18s ease-in-out infinite",
        "float-particle": "floatParticle 14s ease-in-out infinite",
        "scan-line": "scanLine 2.2s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.2s ease-in-out infinite",
        "bubble-in": "bubbleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "float-up": "floatUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "confetti-fall": "confettiFall 2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "typing": "typing 1.4s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "fridge-chill": "fridgeChill 6s ease-in-out infinite",
        "chill-rise": "chillRise 7s ease-in-out infinite",
        "scan-sweep": "scanSweep 2.4s linear infinite",
        "reticle": "reticle 2.8s ease-in-out infinite",
        "count-blink": "countBlink 1.6s ease-in-out infinite",
        "dash": "dash 1.8s linear infinite",
      },
      keyframes: {
        aurora: {
          "0%, 100%": { transform: "translate(0%, 0%) rotate(0deg)", opacity: "0.7" },
          "33%": { transform: "translate(10%, -8%) rotate(30deg)", opacity: "0.9" },
          "66%": { transform: "translate(-8%, 6%) rotate(-20deg)", opacity: "0.6" },
        },
        floatParticle: {
          "0%, 100%": { transform: "translateY(0) translateX(0)", opacity: "0.4" },
          "50%": { transform: "translateY(-40px) translateX(20px)", opacity: "0.8" },
        },
        scanLine: {
          "0%, 100%": { transform: "translateY(-80%)", opacity: "1" },
          "50%": { transform: "translateY(80%)", opacity: "0.9" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(52, 227, 159, 0.55)" },
          "50%": { boxShadow: "0 0 0 22px rgba(52, 227, 159, 0)" },
        },
        bubbleIn: {
          "0%": { transform: "translateY(10px) scale(0.94)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        floatUp: {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        confettiFall: {
          "0%": { transform: "translateY(-40px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(540px) rotate(720deg)", opacity: "0" },
        },
        typing: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        fridgeChill: {
          "0%, 100%": { opacity: "0.35", transform: "translate(0,0) scale(1)" },
          "50%": { opacity: "0.7", transform: "translate(4px,-6px) scale(1.04)" },
        },
        chillRise: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "30%": { opacity: "0.7" },
          "100%": { transform: "translateY(-80px)", opacity: "0" },
        },
        scanSweep: {
          "0%": { transform: "translateY(-10%)", opacity: "0.2" },
          "50%": { transform: "translateY(100%)", opacity: "0.9" },
          "100%": { transform: "translateY(-10%)", opacity: "0.2" },
        },
        reticle: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        countBlink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        dash: {
          "0%": { strokeDashoffset: "0" },
          "100%": { strokeDashoffset: "-40" },
        },
      },
    },
  },
  plugins: [],
};
