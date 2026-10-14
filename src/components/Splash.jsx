import { useEffect, useState } from "react";
import logo from "../assets/logo-full.webp";

const onHome = () => location.pathname.replace(/\/+$/, "") === "";

export default function Splash() {
  const seen = (() => { try { return sessionStorage.getItem("slr-splash") === "1"; } catch { return false; } })();
  const [phase, setPhase] = useState(seen || !onHome() ? "gone" : "show");
  useEffect(() => {
    if (phase === "gone") return;
    try { sessionStorage.setItem("slr-splash", "1"); } catch { }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t1 = setTimeout(() => setPhase("out"), reduce ? 400 : 1100);
    const t2 = setTimeout(() => setPhase("gone"), reduce ? 600 : 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (phase === "gone") return null;
  return <div className={`splash ${phase === "out" ? "out" : ""}`} aria-hidden="true"><img src={logo} alt="" width="520" height="337" /></div>;
}
