import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api.js";
import { store } from "../utils/format.js";
import { DEFAULT_FILTERS } from "../utils/filters.js";
import { navigate } from "../utils/router.jsx";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [all, setAll] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [saved, setSaved] = useState(() => store.get("slr_saved", []));
  const [enquiry, setEnquiry] = useState(null);

  useEffect(() => {
    api.properties()
      .then((r) => { if (!r.ok) return setState("error"); setAll(r.data.data); setState("ready"); })
      .catch(() => setState("error"));
  }, []);

  const toggleSaved = useCallback((id) => {
    setSaved((s) => {
      const n = s.includes(id) ? s.filter((x) => x !== id) : [...s, id];
      store.set("slr_saved", n);
      return n;
    });
  }, []);

  // Apply filters and jump to the listings section on the home page.
  const applyFilters = useCallback((patch, scroll = false) => {
    setFilters((f) => ({ ...f, ...patch }));
    if (scroll) navigate("/#properties");
  }, []);
  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const value = useMemo(() => ({
    all, state, filters, applyFilters, resetFilters, saved, toggleSaved, enquiry, setEnquiry,
  }), [all, state, filters, applyFilters, resetFilters, saved, toggleSaved, enquiry]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
