import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/fonts.css";
import "./styles/icons.css";
import "./styles/styles.css";

const Admin = lazy(() => import("./pages/Admin.jsx"));
const isAdmin = /^\/admin\/?$/i.test(window.location.pathname);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAdmin ? (
      <Suspense fallback={<div className="boot">Loading…</div>}>
        <Admin />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>
);
