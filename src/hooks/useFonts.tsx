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

export interface TypeScale {
  /** font-size multiplier on html (default 1) */
  scale: number;
  /** body line-height (default 1.55) */
  leading: number;
  /** body weight, e.g. 400 */
  weightBody: number;
  /** heading weight, e.g. 700 */
  weightHeading: number;
}

export const DEFAULT_TYPE_SCALE: TypeScale = {
  scale: 1,
  leading: 1.55,
  weightBody: 400,
  weightHeading: 700,
};

export const SCALE_PRESETS: { id: "tighter" | "normal" | "loose"; label: string; scale: TypeScale }[] = [
  { id: "tighter", label: "Tighter", scale: { scale: 0.9375, leading: 1.4, weightBody: 400, weightHeading: 700 } },
  { id: "normal", label: "Normal", scale: DEFAULT_TYPE_SCALE },
  { id: "loose", label: "Loose", scale: { scale: 1.0625, leading: 1.7, weightBody: 400, weightHeading: 700 } },
];

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

function applyScaleVars(t: TypeScale) {
  const root = document.documentElement;
  root.style.setProperty("--type-scale", String(t.scale));
  root.style.setProperty("--type-leading", String(t.leading));
  root.style.setProperty("--type-weight-body", String(t.weightBody));
  root.style.setProperty("--type-weight-heading", String(t.weightHeading));
}

interface FontsContextType {
  fonts: FontSettings;
  scale: TypeScale;
  loading: boolean;
  refresh: () => Promise<void>;
  saveFont: (role: FontRole, cfg: FontConfig) => Promise<void>;
  resetRole: (role: FontRole) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  saveScale: (t: TypeScale) => Promise<void>;
  resetScale: () => Promise<void>;
}

const FontsContext = createContext<FontsContextType | undefined>(undefined);

const CACHE_KEY = "lov:font-settings:v1";
const SCALE_CACHE_KEY = "lov:type-scale:v1";
const SCALE_SETTING_KEY = "type_scale";

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

function readScaleCache(): TypeScale | null {
  try {
    const raw = localStorage.getItem(SCALE_CACHE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.scale !== "number") return null;
    return { ...DEFAULT_TYPE_SCALE, ...p };
  } catch {
    return null;
  }
}

function writeScaleCache(t: TypeScale) {
  try {
    localStorage.setItem(SCALE_CACHE_KEY, JSON.stringify(t));
  } catch {
    /* ignore */
  }
}

export const FontsProvider = ({ children }: { children: ReactNode }) => {
  const [fonts, setFonts] = useState<FontSettings>(() => readCache() || DEFAULT_FONTS);
  const [scale, setScale] = useState<TypeScale>(() => readScaleCache() || DEFAULT_TYPE_SCALE);
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
        .in("key", ["bangla_body", "bangla_heading", "english_body", "english_heading", SCALE_SETTING_KEY]);
      if (error) throw error;

      const next: FontSettings = { ...DEFAULT_FONTS };
      let nextScale: TypeScale = DEFAULT_TYPE_SCALE;
      (data || []).forEach((row: any) => {
        if (row.key === SCALE_SETTING_KEY && row.value && typeof row.value.scale === "number") {
          nextScale = { ...DEFAULT_TYPE_SCALE, ...row.value };
        } else if (row.key in next && row.value?.family) {
          next[row.key as FontRole] = row.value as FontConfig;
        }
      });
      setFonts(next);
      setScale(nextScale);
      apply(next);
      applyScaleVars(nextScale);
      writeCache(next);
      writeScaleCache(nextScale);
    } catch (err) {
      const cached = readCache();
      const cachedScale = readScaleCache();
      apply(cached || DEFAULT_FONTS);
      applyScaleVars(cachedScale || DEFAULT_TYPE_SCALE);
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    apply(readCache() || DEFAULT_FONTS);
    applyScaleVars(readScaleCache() || DEFAULT_TYPE_SCALE);
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

  const resetRole = useCallback(
    async (role: FontRole) => {
      await saveFont(role, DEFAULT_FONTS[role]);
    },
    [saveFont]
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

  const saveScale = useCallback(async (t: TypeScale) => {
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: SCALE_SETTING_KEY, value: t as any, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
    if (error) throw error;
    setScale(t);
    applyScaleVars(t);
    writeScaleCache(t);
  }, []);

  const resetScale = useCallback(async () => {
    await saveScale(DEFAULT_TYPE_SCALE);
  }, [saveScale]);

  return (
    <FontsContext.Provider
      value={{ fonts, scale, loading, refresh, saveFont, resetRole, resetToDefaults, saveScale, resetScale }}
    >
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
