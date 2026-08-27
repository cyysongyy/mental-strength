import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Modules from "./pages/Modules";
import CognitiveReframe from "./pages/modules/CognitiveReframe";
import CirclesOfControl from "./pages/modules/CirclesOfControl";
import EmotionalTolerance from "./pages/modules/EmotionalTolerance";
import SOS from "./pages/SOS";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import Toughness from "./pages/Toughness";

export default function App() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/modules/reframe" element={<CognitiveReframe />} />
          <Route path="/modules/circles" element={<CirclesOfControl />} />
          <Route path="/modules/tolerance" element={<EmotionalTolerance />} />
          <Route path="/sos" element={<SOS />} />
          <Route path="/report" element={<Report />} />
          <Route path="/toughness" element={<Toughness />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
      <NavBar />
    </div>
  );
}
