/**
 * EXECLEAD.AI — Open Graph Image helpers (frontend)
 * Builds URLs to the server-side OG image API and sets social meta tags.
 */

export function getOGImageUrl(type, id, version) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://execlead.ai";
  const params = new URLSearchParams({ type });
  if (id) params.set("id", id);
  if (version) params.set("v", String(version));
  return `${origin}/functions/og-image?${params.toString()}`;
}

function setMeta(selectorAttr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${selectorAttr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(selectorAttr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Sets og:image, twitter:card, twitter:image (+ optional title/description)
 * to a dynamically-generated branded card for the given resource.
 */
export function setOGMeta({ type, id, title, description, version }) {
  const img = getOGImageUrl(type, id, version);
  setMeta("property", "og:image", img);
  setMeta("property", "og:image:width", "1200");
  setMeta("property", "og:image:height", "630");
  setMeta("property", "og:image:type", "image/png");
  setMeta("property", "og:image:alt", title || "EXECLEAD.AI");
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:image", img);
  if (title) {
    setMeta("property", "og:title", title);
    setMeta("name", "twitter:title", title);
  }
  if (description) {
    setMeta("property", "og:description", description);
    setMeta("name", "twitter:description", description);
  }
}