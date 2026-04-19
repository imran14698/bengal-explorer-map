import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type FontRole = "bangla_body" | "bangla_heading" | "english_body" | "english_heading";

export interface FontConfig {
  family: string;
  /** Optional explicit Google Fonts CSS URL. If omitted we build one from family + weights. */
  url?: string;
  /** e.g. "400;500;600;700" */
  weights?: string;
}

export type FontSettings = Record<FontRole, FontConfig>;

export const DEFAULT_FONTS: FontSettings = {
  bangla_body: { family: "Noto Sans Bengali", weights: "400;500;600;700" },
  bangla_heading: { family: "Noto Sans Bengali", weights: "600;700;800" },
  english_body: { family: "Inter", weights: "400;500;600" },
  english_heading: { family: "Plus Jakarta Sans", weights: "600;700;800" },
};

/** Curated Bangla font presets for the admin picker. */
export const BANGLA_PRESETS: { family: string; weights: string; sample?: string }[] = [
  { family: "Noto Sans Bengali", weights: "400;500;600;700;800" },
  { family: "Hind Siliguri", weights: "300;400;500;600;700" },
  { family: "Baloo Da 2", weights: "400;500;600;700;800" },
  { family: "Tiro Bangla", weights: "400" },
  { family: "Galada", weights: "400" },
  { family: "Mina", weights: "400;700" },
  { family: "Atma", weights: "300;400;500;600;700" },
  { family: "Anek Bangla", weights: "400;500;600;700" },
  { family: "Noto Serif Bengali", weights: "400;500;600;700" },
];

export const ENGLISH_PRESETS: { family: string; weights: string }[] = [
  { family: "Inter", weights: "400;500;600;700" },
  { family: "Plus Jakarta Sans", weights: "400;500;600;700;800" },
  { family: "Poppins", weights: "400;500;600;700" },
  { family: "DM Sans", weights: "400;500;700" },
  { family: "Playfair Display", weights: "400;600;700;800" },
  { family: "Space Grotesk", weights: "400;500;600;700" },
  { family: "Manrope", weights: "400;500;600;700;800" },
];

const LINK_ID_PREFIX = "dynamic-font-";

function buildGoogleUrl(cfg: FontConfig): string {
  if (cfg.url) return cfg.url;
  const fam = cfg.family.trim().replace(/\s+/g, "+");
  const weights = cfg.weights || "400;500;600;700";
  return `https://fonts.googleapis.com/css2?family=${fam}:wght@${weights}&display=swap`;
}

function injectFontLink(role: string, cfg: FontConfig) {
  const id = `${LINK_ID_PREFIX}${role}`;
  const url = buildGoogleUrl(cfg);
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (link && link.href === url) return;
  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href = url;
}

function applyCssVars(s: FontSettings) {
  const root = document.documentElement;
  root.style.setProperty("--font-bangla-body", `"${s.bangla_body.family}"`);
  root.style.setProperty("--font-bangla-heading", `"${s.bangla_heading.family}"`);
  root.style.setProperty("--font-english-body", `"${s.english_body.family}"`);
  root.style.setProperty("--font-english-heading", `"${s.english_heading.family}"`);
}

interface FontsContextType {
  fonts: FontSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  saveFont: (role: FontRole, cfg: FontConfig) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const FontsContext = createContext<FontsContextType | undefined>(undefined);

const CACHE_KEY = "lov:font-settings:v1";

function readCache(): FontSettings | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const roles: FontRole[] = ["bangla_body", "bangla_heading", "english_body", "english_heading"];
    const next: FontSettings = { ...DEFAULT_FONTS };
    roles.forEach((r) => {
      if (parsed?.[r]?.family) next[r] = parsed[r];
    });
    return next;
  } catch {
    return null;
  }
}

function writeCache(s: FontSettings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota / privacy mode */
  }
}

export const FontsProvider = ({ children }: { children: ReactNode }) => {
  const [fonts, setFonts] = useState<FontSettings>(() => readCache() || DEFAULT_FONTS);
  const [loading, setLoading] = useState(true);

  const apply = useCallback((s: FontSettings) => {
    (Object.keys(s) as FontRole[]).forEach((role) => injectFontLink(role, s[role]));
    applyCssVars(s);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["bangla_body", "bangla_heading", "english_body", "english_heading"]);
      if (error) throw error;

      const next: FontSettings = { ...DEFAULT_FONTS };
      (data || []).forEach((row: any) => {
        if (row.key in next && row.value?.family) {
          next[row.key as FontRole] = row.value as FontConfig;
        }
      });
      setFonts(next);
      apply(next);
      writeCache(next);
    } catch (err) {
      // Table may not exist yet — fall back to cached/defaults silently.
      const cached = readCache();
      apply(cached || DEFAULT_FONTS);
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    // Apply cached (or default) fonts immediately to avoid FOUT, then fetch overrides.
    apply(readCache() || DEFAULT_FONTS);
    refresh();
  }, [apply, refresh]);

  const saveFont = useCallback(
    async (role: FontRole, cfg: FontConfig) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: role, value: cfg, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
      const next = { ...fonts, [role]: cfg };
      setFonts(next);
      apply(next);
      writeCache(next);
    },
    [fonts, apply]
  );

  const resetToDefaults = useCallback(async () => {
    const roles: FontRole[] = ["bangla_body", "bangla_heading", "english_body", "english_heading"];
    const rows = roles.map((r) => ({
      key: r,
      value: DEFAULT_FONTS[r] as any,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;
    setFonts(DEFAULT_FONTS);
    apply(DEFAULT_FONTS);
    writeCache(DEFAULT_FONTS);
  }, [apply]);

  return (
    <FontsContext.Provider value={{ fonts, loading, refresh, saveFont, resetToDefaults }}>
      {children}
    </FontsContext.Provider>
  );
};

export const useFonts = () => {
  const ctx = useContext(FontsContext);
  if (!ctx) throw new Error("useFonts must be used inside FontsProvider");
  return ctx;
};

/** Parse a pasted Google Fonts URL into FontConfig (best-effort). */
export function parseGoogleFontsUrl(url: string): FontConfig | null {
  try {
    const u = new URL(url);
    const fam = u.searchParams.get("family");
    if (!fam) return null;
    // family looks like "Noto+Sans+Bengali:wght@400;700" possibly with multiple `family` params
    const [namePart, axisPart] = fam.split(":");
    const family = namePart.replace(/\+/g, " ");
    let weights: string | undefined;
    if (axisPart) {
      const m = axisPart.match(/wght@([\d;,]+)/);
      if (m) weights = m[1].replace(/,/g, ";");
    }
    return { family, weights, url };
  } catch {
    return null;
  }
}
