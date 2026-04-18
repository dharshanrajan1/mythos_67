import { useState } from "react";
import Backdrop from "./components/Backdrop.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TabBar from "./components/TabBar.jsx";
import TopHeader from "./components/TopHeader.jsx";
import TodayScreen from "./components/TodayScreen.jsx";
import MealsScreen from "./components/MealsScreen.jsx";
import AgentScreen from "./components/AgentScreen.jsx";
import TrendsScreen from "./components/TrendsScreen.jsx";
import ProfileScreen from "./components/ProfileScreen.jsx";
import HomeFlow from "./components/HomeFlow.jsx";
import RoadFlow from "./components/RoadFlow.jsx";
import Toast from "./components/Toast.jsx";
import FlowModal from "./components/FlowModal.jsx";
import { AppStateProvider, useAppState } from "./lib/AppState.jsx";

function Shell() {
  const [tab, setTab] = useState("today");
  const [flow, setFlow] = useState(null);
  const { user, meals, addMeal, toast, closeToast, showToast } = useAppState();

  return (
    <div className="relative min-h-screen w-full bg-ink-950 text-white overflow-hidden">
      <Backdrop />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar tab={tab} onTab={setTab} onFlow={setFlow} user={user} />

        <main className="flex-1 relative min-w-0">
          <TopHeader user={user} tab={tab} />

          <div className="relative pb-28 lg:pb-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 lg:pt-4">
              {tab === "today" && (
                <TodayScreen user={user} meals={meals} onFlow={setFlow} onTab={setTab} />
              )}
              {tab === "meals" && <MealsScreen meals={meals} onFlow={setFlow} />}
              {tab === "agent" && <AgentScreen onFlow={setFlow} user={user} />}
              {tab === "trends" && <TrendsScreen user={user} />}
              {tab === "profile" && <ProfileScreen user={user} />}
            </div>
          </div>
        </main>
      </div>

      <TabBar tab={tab} onTab={setTab} onFlow={setFlow} />

      <FlowModal open={flow !== null} onClose={() => setFlow(null)}>
        {flow === "home" && (
          <HomeFlow
            onExit={() => setFlow(null)}
            onLog={(recipe) => {
              addMeal({
                calories: recipe.calories,
                protein: recipe.protein,
                carbs: recipe.carbs,
                fat: recipe.fat,
                name: recipe.title,
                emoji: recipe.emoji,
                slot: "Dinner",
                source: "agent",
              });
              showToast(`Macros updated · +${recipe.protein}g protein`);
            }}
          />
        )}
        {flow === "road" && (
          <RoadFlow
            onExit={() => setFlow(null)}
            onLog={(item) => {
              addMeal({
                calories: item.cal,
                protein: item.p,
                carbs: item.c,
                fat: item.f,
                name: item.name,
                emoji: "🍽️",
                slot: "Restaurant",
                source: "restaurant",
              });
              showToast(`Logged · ${item.name}`);
            }}
          />
        )}
      </FlowModal>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}
