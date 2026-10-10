// Font Awesome icon: <Icon name="phone" /> or <Icon name="whatsapp" brand />
export default function Icon({ name, brand = false, className = "" }) {
  return <i className={`fa-${brand ? "brands" : "solid"} fa-${name} ${className}`.trim()} aria-hidden="true" />;
}
