let boot;

export function readBoot() {
  if (boot !== undefined) return boot;
  boot = null;
  try {
    const el = document.getElementById("slr-boot");
    if (el) boot = JSON.parse(el.textContent);
  } catch {
    boot = null;
  }
  return boot;
}

export const siteOrigin = () => readBoot()?.site || location.origin;
