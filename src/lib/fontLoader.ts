/** Inject a Google Fonts <link> on demand for any family. Safe to call repeatedly. */
export function ensureFontLink(family: string, weights = "400;500;600;700") {
  if (typeof document === "undefined" || !family) return;
  const clean = family.trim().replace(/^["']|["']$/g, "");
  if (!clean) return;
  const id = `editor-font-${clean.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const fam = clean.replace(/\s+/g, "+");
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fam}:wght@${weights}&display=swap`;
  document.head.appendChild(link);
}

/** Scan an HTML string for inline font-family declarations and preload them. */
export function preloadFontsFromHtml(html: string) {
  if (!html) return;
  const re = /font-family\s*:\s*([^;"']+)/gi;
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const first = m[1].split(",")[0].trim().replace(/^["']|["']$/g, "");
    if (first && !seen.has(first)) {
      seen.add(first);
      ensureFontLink(first);
    }
  }
}
