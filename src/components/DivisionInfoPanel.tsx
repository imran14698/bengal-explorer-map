import { X, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import barishalMap from "@/assets/divisions/barishal.png";
import chattogramMap from "@/assets/divisions/chattogram.png";
import dhakaMap from "@/assets/divisions/dhaka.png";
import khulnaMap from "@/assets/divisions/khulna.png";
import mymensinghMap from "@/assets/divisions/mymensingh.png";
import rajshahiMap from "@/assets/divisions/rajshahi.png";
import rangpurMap from "@/assets/divisions/rangpur.png";
import sylhetMap from "@/assets/divisions/sylhet.png";

interface DivisionInfoPanelProps {
  divisionId: string | null;
  onClose: () => void;
}

const divisionNames: Record<string, { en: string; bn: string }> = {
  dhaka: { en: "Dhaka", bn: "ঢাকা" },
  chattogram: { en: "Chattogram", bn: "চট্টগ্রাম" },
  rajshahi: { en: "Rajshahi", bn: "রাজশাহী" },
  khulna: { en: "Khulna", bn: "খুলনা" },
  barishal: { en: "Barishal", bn: "বরিশাল" },
  sylhet: { en: "Sylhet", bn: "সিলেট" },
  rangpur: { en: "Rangpur", bn: "রংপুর" },
  mymensingh: { en: "Mymensingh", bn: "ময়মনসিংহ" },
};

// Eagerly load all images in src/assets/divisions so users can drop in
// any extension (png/jpg/jpeg/webp/svg) named after the division slug.
const divisionImageModules = import.meta.glob(
  "@/assets/divisions/*.{png,jpg,jpeg,webp,svg,PNG,JPG,JPEG,WEBP,SVG}",
  { eager: true, import: "default" }
) as Record<string, string>;

const divisionMaps: Record<string, string> = {
  dhaka: dhakaMap,
  chattogram: chattogramMap,
  rajshahi: rajshahiMap,
  khulna: khulnaMap,
  barishal: barishalMap,
  sylhet: sylhetMap,
  rangpur: rangpurMap,
  mymensingh: mymensinghMap,
};

// Override defaults with anything found via glob (lets user replace the image
// just by saving a file like `dhaka.jpg` or `dhaka.svg` into the folder).
for (const [path, url] of Object.entries(divisionImageModules)) {
  const file = path.split("/").pop() || "";
  const slug = file.replace(/\.[^.]+$/, "").toLowerCase();
  if (slug in divisionMaps || slug in divisionNames) {
    divisionMaps[slug] = url;
  }
}

interface CategoryInfo {
  categoryName: string;
  items: { en: string; bn: string | null }[];
}

type Lang = "en" | "bn";

const uiText = {
  en: {
    division: "Division",
    noInfo: "No information available for this division yet.",
    close: "Close",
    switchTo: "বাংলা",
  },
  bn: {
    division: "বিভাগ",
    noInfo: "এই বিভাগের জন্য এখনো কোনো তথ্য নেই।",
    close: "বন্ধ করুন",
    switchTo: "English",
  },
};

const DivisionInfoPanel = ({ divisionId, onClose }: DivisionInfoPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CategoryInfo[]>([]);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    if (!divisionId) {
      setData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: divData } = await supabase
          .from("divisions")
          .select("id")
          .eq("slug", divisionId)
          .single();

        if (!divData) {
          setData([]);
          return;
        }

        const { data: rows, error } = await supabase
          .from("division_info")
          .select("content, bn_content, categories(name)")
          .eq("division_id", divData.id);

        if (error) {
          console.error("Error fetching division info:", error);
          setData([]);
          return;
        }

        const grouped: Record<string, { en: string; bn: string | null }[]> = {};
        (rows || []).forEach((row: any) => {
          const catName = row.categories?.name || "Other";
          if (!grouped[catName]) grouped[catName] = [];
          grouped[catName].push({ en: row.content, bn: row.bn_content ?? null });
        });

        const result: CategoryInfo[] = Object.entries(grouped).map(
          ([categoryName, items]) => ({ categoryName, items })
        );
        setData(result);
      } catch (err) {
        console.error("Fetch error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [divisionId]);

  // Lock body scroll + ESC to close
  useEffect(() => {
    if (!divisionId) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [divisionId, onClose]);

  const t = uiText[lang];
  const divName = divisionId ? divisionNames[divisionId] : null;

  return (
    <AnimatePresence>
      {divisionId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          {/* Blurry backdrop */}
          <div className="absolute inset-0 bg-background/40 backdrop-blur-xl" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex w-full max-w-6xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 dark:bg-white/5 shadow-2xl backdrop-blur-2xl"
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            {/* Decorative gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

            {/* Header */}
            <div className="relative flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
              <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-foreground drop-shadow-sm truncate">
                {divName ? (lang === "bn" ? divName.bn : divName.en) : divisionId}{" "}
                <span className="text-sm sm:text-base font-normal text-muted-foreground">
                  {t.division}
                </span>
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLang((p) => (p === "en" ? "bn" : "en"))}
                  className="rounded-full border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 text-xs sm:text-sm"
                >
                  <Languages className="mr-1 h-4 w-4" />
                  {t.switchTo}
                </Button>
                <button
                  onClick={onClose}
                  aria-label={t.close}
                  className="rounded-full border border-white/20 bg-white/10 p-2 text-foreground backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content: grid with map + info — MIN-H-0 is critical so child can scroll */}
            <div className="relative grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2 overflow-hidden">
              {/* Map side */}
              <div className="relative flex min-h-0 items-center justify-center overflow-hidden border-b border-white/10 bg-white/5 p-4 lg:border-b-0 lg:border-r">
                <motion.img
                  key={divisionId}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
                  src={divisionMaps[divisionId]}
                  alt={`${divName?.en ?? divisionId} division map`}
                  className="h-full max-h-[35vh] w-full object-contain drop-shadow-2xl lg:max-h-full"
                />
              </div>

              {/* Info side - scrollable */}
              <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
                {loading ? (
                  <div className="space-y-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : data.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.noInfo}</p>
                ) : (
                  <div className="space-y-4 pb-4">
                    {data.map((cat) => (
                      <div
                        key={cat.categoryName}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                      >
                        <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">
                          {cat.categoryName}
                        </h3>
                        <ul className="list-disc space-y-1 pl-5">
                          {cat.items.map((item, idx) => {
                            const text =
                              lang === "bn" && item.bn && item.bn.trim()
                                ? item.bn
                                : item.en;
                            return (
                              <li
                                key={idx}
                                className="text-sm text-foreground/90 leading-relaxed"
                              >
                                {text}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DivisionInfoPanel;
