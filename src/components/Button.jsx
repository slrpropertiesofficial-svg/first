import Icon from "./Icon.jsx";
import { Link } from "../utils/router.jsx";

export default function Button({ variant = "primary", icon, brand, to, href, children, className = "", ...rest }) {
  const cls = `btn ${variant === "ghost" ? "ghost" : variant === "wa" ? "wa-btn" : ""} ${className}`.trim();
  const inner = <>{icon && <Icon name={icon} brand={brand} />}{children}</>;
  if (to) return <Link className={cls} to={to} {...rest}>{inner}</Link>;
  if (href) return <a className={cls} href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>{inner}</a>;
  return <button type="button" className={cls} {...rest}>{inner}</button>;
}
