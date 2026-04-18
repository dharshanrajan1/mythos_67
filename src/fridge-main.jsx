import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Backdrop from "./components/Backdrop.jsx";
import HomeFlow from "./components/HomeFlow.jsx";
import Toast from "./components/Toast.jsx";

function FridgeApp() {
  const [toast, setToast] = useState(null);
  const [sessionKey, setSessionKey] = useState(0);

  return (
    <div className="relative min-h-screen w-full bg-ink-950 text-white overflow-hidden">
      <Backdrop />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HomeFlow
          key={sessionKey}
          onExit={() => setSessionKey((k) => k + 1)}
          onLog={(recipe) =>
            setToast({
              id: Date.now(),
              text: `Logged · ${recipe.title} · +${recipe.protein}g protein`,
            })
          }
        />
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FridgeApp />
  </StrictMode>
);
