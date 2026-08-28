import { Route, Routes, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Modules from "./pages/Modules";
import CognitiveReframe from "./pages/modules/CognitiveReframe";
import CirclesOfControl from "./pages/modules/CirclesOfControl";
import EmotionalTolerance from "./pages/modules/EmotionalTolerance";
import SOS from "./pages/SOS";
import Memory from "./pages/Memory";
import Records from "./pages/Records";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import Toughness from "./pages/Toughness";

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Keyed by path so navigating away from a crashed page always
            gets a fresh mount instead of being stuck on the fallback. */}
        <ErrorBoundary key={location.pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/modules/reframe" element={<CognitiveReframe />} />
            <Route path="/modules/circles" element={<CirclesOfControl />} />
            <Route path="/modules/tolerance" element={<EmotionalTolerance />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/report" element={<Report />} />
            <Route path="/memory" element={<Memory />} />
            <Route path="/records" element={<Records />} />
            <Route path="/toughness" element={<Toughness />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </ErrorBoundary>
      </div>
      <NavBar />
    </div>
  );
}
