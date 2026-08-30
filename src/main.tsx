import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { applyFontScale, readStoredFontScale } from "./lib/fontScale";
import { registerServiceWorker } from "./lib/pwa";

// Before the first paint, so someone using the large setting never sees the
// app render at 100% and then resize under them.
applyFontScale(readStoredFontScale());

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
