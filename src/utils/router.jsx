import { useEffect, useState } from "react";

export function navigate(to, { replace = false } = {}) {
  history[replace ? "replaceState" : "pushState"](null, "", to);
  window.dispatchEvent(new Event("slr:nav"));
}

const read = () => ({ path: location.pathname.replace(/\/+$/, "") || "/", hash: location.hash, key: Math.random() });

export function useLocation() {
  const [loc, setLoc] = useState(read);
  useEffect(() => {
    const f = () => setLoc(read());
    addEventListener("popstate", f);
    addEventListener("slr:nav", f);
    return () => { removeEventListener("popstate", f); removeEventListener("slr:nav", f); };
  }, []);
  return loc;
}

export function Link({ to, onClick, children, ...rest }) {
  const handle = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === "_blank") return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={handle} {...rest}>{children}</a>;
}
