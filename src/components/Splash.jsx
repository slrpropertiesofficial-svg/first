import { useEffect, useState } from "react";
import logo from "../assets/logo-full.png";

// The site opens through the logo: shown once per visit, then fades away.
export default function Splash() {
  const seen = (() => { try { return sessionStorage.getItem("slr-splash") === "1"; } catch { return false; } })();
  const [phase, setPhase] = useState(seen ? "gone" : "show");
  useEffect(() => {
    if (phase === "gone") return;
    try { sessionStorage.setItem("slr-splash", "1"); } catch { /* private mode */ }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t1 = setTimeout(() => setPhase("out"), reduce ? 700 : 1800);
    const t2 = setTimeout(() => setPhase("gone"), reduce ? 900 : 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (phase === "gone") return null;
  return <div className={`splash ${phase === "out" ? "out" : ""}`} aria-hidden="true"><img src={logo} alt="" /></div>;
}
