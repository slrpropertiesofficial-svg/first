import { info } from "../../src/utils/categories.js";
import { areaOf, propertyPath } from "../../src/utils/property.js";
import { collectionPath } from "../../src/utils/routes.js";

export function affectedPaths(p) {
  const { g, sub } = info(p.category);
  const paths = ["/", "/properties", propertyPath(p)];
  if (g) {
    paths.push(collectionPath({ group: g.id }));
    if (g.subs.includes(sub)) paths.push(collectionPath({ group: g.id, sub }));
  }
  const area = areaOf(p);
  if (area) paths.push(collectionPath({ area }));
  return [...new Set(paths)];
}

export function pingIndexNow(env, origin, paths) {
  const key = env.INDEXNOW_KEY;
  if (!key || !/^[A-Za-z0-9-]{8,128}$/.test(key)) return Promise.resolve();
  return fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(origin).host, key, keyLocation: `${origin}/${key}.txt`, urlList: paths.map((p) => origin + p) }),
  }).catch(() => {});
}
