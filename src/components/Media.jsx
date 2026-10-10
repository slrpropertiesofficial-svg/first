import { isVideo, safeUrl } from "../utils/property.js";

export default function Media({ u }) {
  u = safeUrl(u);
  return isVideo(u)
    ? <video src={`${u}#t=0.1`} muted playsInline preload="metadata" />
    : <img src={u} alt="" loading="lazy" decoding="async" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />;
}
