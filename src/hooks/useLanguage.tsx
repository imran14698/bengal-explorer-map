import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "bn";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("lang");
    return stored === "bn" ? "bn" : "en";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleLang = () => setLangState((l) => (l === "en" ? "bn" : "en"));

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

/** Pick BN or EN value with fallback to the other side. */
export const pickLang = <T extends string | null | undefined>(
  lang: Lang,
  bn: T,
  en: T
): string => {
  if (lang === "bn") return (bn && bn.trim() ? bn : en) || "";
  return (en && en.trim() ? en : bn) || "";
};
