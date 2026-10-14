import { useEffect, useMemo } from "react";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Layout from "./components/Layout.jsx";
import Splash from "./components/Splash.jsx";
import Home from "./pages/Home.jsx";
import Collection from "./pages/Collection.jsx";
import Favorites from "./pages/Favorites.jsx";
import PropertyDetails from "./pages/PropertyDetails.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import NotFound from "./pages/NotFound.jsx";
import { navigate, useLocation } from "./utils/router.jsx";
import { matchRoute } from "./utils/routes.js";

function Routes() {
  const loc = useLocation();
  const { all, state } = useApp();

  useEffect(() => {
    const m = loc.hash.match(/^#property-(\d+)$/);
    if (m) navigate(`/property/${m[1]}`, { replace: true });
  }, [loc]);

  useEffect(() => {
    if (loc.hash && !/^#property-/.test(loc.hash)) {
      const t = setTimeout(() => document.getElementById(loc.hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0 });
  }, [loc.key]);

  const route = useMemo(() => matchRoute(loc.path, all), [loc.path, all]);
  const waiting = state === "loading" && (route.type === "property" || route.type === "collection" || route.type === "notfound");

  let page;
  if (waiting) page = <section className="page"><div className="wrap"><div className="skel tall" /></div></section>;
  else if (route.type === "home") page = <Home />;
  else if (route.type === "collection") page = <Collection route={route} />;
  else if (route.type === "property") page = <PropertyDetails p={route.p} />;
  else if (route.type === "privacy") page = <Privacy />;
  else if (route.type === "terms") page = <Terms />;
  else if (route.type === "favorites") page = <Favorites />;
  else page = <NotFound />;
  return <Layout>{page}</Layout>;
}

export default function App() {
  return <AppProvider><Splash /><Routes /></AppProvider>;
}
