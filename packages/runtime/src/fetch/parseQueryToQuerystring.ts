import type { Querystring } from "../types/request";

export function parseQueryToQuerystring(query: Querystring) {
  let url = "?";
  for (const k in query) {
    const val = query[k];
    if (typeof val !== "undefined") {
      const key = encodeURIComponent(k) + "=";
      if (Array.isArray(val)) {
        for (const v of val) {
          url += key + encodeURIComponent(v);
          url += "&";
        }
      } else {
        url += key + encodeURIComponent(val);
        url += "&";
      }
    }
  }
  if (url.endsWith("&")) {
    url = url.substr(0, url.length - 1);
  }
  return url;
}
