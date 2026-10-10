import { useEffect, useMemo, useState } from "react";
import { gallery as galleryOf, isVideo } from "../utils/property.js";

export default function Gallery({ p }) {
  const items = useMemo(() => galleryOf(p), [p]);
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const n = items.length;
  const go = (d) => setI((x) => (x + d + n) % n);

  useEffect(() => setI(0), [p.id]);
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") setZoom(false);
      if (n > 1 && e.key === "ArrowRight") go(1);
      if (n > 1 && e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [n]);

  if (!n) return <div className="stage empty-stage"><i className="fa-regular fa-image" /></div>;
  const cur = items[i];
  const view = (
    <>
      {isVideo(cur) ? <video key={cur} src={cur} controls playsInline /> : <img key={cur} src={cur} alt={`${p.title} - photo ${i + 1}`} onClick={() => setZoom(true)} style={{ cursor: "zoom-in" }} />}
      {n > 1 && <>
        <button type="button" className="nav-arrow l" onClick={() => go(-1)} aria-label="Previous"><i className="fa-solid fa-chevron-left" /></button>
        <button type="button" className="nav-arrow r" onClick={() => go(1)} aria-label="Next"><i className="fa-solid fa-chevron-right" /></button>
        <span className="counter">{i + 1} / {n}</span></>}
    </>
  );
  return (
    <div className="gallery">
      <div className="stage">{view}</div>
      {n > 1 && (
        <div className="thumbs">
          {items.map((u, k) => (
            <button type="button" key={u + k} className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={`Show media ${k + 1}`}>
              {isVideo(u) ? <><video src={`${u}#t=0.1`} muted preload="metadata" /><i className="fa-solid fa-play" /></> : <img src={u} alt="" loading="lazy" />}
            </button>))}
        </div>
      )}
      {zoom && !isVideo(cur) && (
        <div className="modal show lightbox" role="dialog" aria-modal="true" aria-label="Enlarged photo" onClick={() => setZoom(false)}>
          <button type="button" className="x" aria-label="Close" onClick={() => setZoom(false)}><i className="fa-solid fa-xmark" /></button>
          <div className="stage big" onClick={(e) => e.stopPropagation()}>{view}</div>
        </div>
      )}
    </div>
  );
}
