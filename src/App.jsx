import { useEffect } from "react";
import { AppProvider } from "./context/AppContext.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Favorites from "./pages/Favorites.jsx";
import PropertyDetails from "./pages/PropertyDetails.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import NotFound from "./pages/NotFound.jsx";
import { navigate, useLocation } from "./utils/router.jsx";
import { idFromSlug } from "./utils/property.js";

function Routes() {
  const loc = useLocation();

  // Old shareable links (/#property-12) -> /property/12
  useEffect(() => {
    const m = loc.hash.match(/^#property-(\d+)$/);
    if (m) navigate(`/property/${m[1]}`, { replace: true });
  }, [loc]);

  // Scroll to the section in the URL hash, otherwise to the top of the new page.
  useEffect(() => {
    if (loc.hash && !/^#property-/.test(loc.hash)) {
      const t = setTimeout(() => document.getElementById(loc.hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0 });
  }, [loc.key]);

  let page;
  const m = loc.path.match(/^\/property\/([^/]+)$/);
  if (loc.path === "/") page = <Home />;
  else if (loc.path === "/privacy") page = <Privacy />;
  else if (loc.path === "/terms") page = <Terms />;
  else if (loc.path === "/favorites") page = <Favorites />;
  else if (m && idFromSlug(m[1])) page = <PropertyDetails id={idFromSlug(m[1])} />;
  else page = <NotFound />;
  return <Layout>{page}</Layout>;
}

export default function App() {
  return <AppProvider><Routes /></AppProvider>;
}
