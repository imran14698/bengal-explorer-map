import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

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

const divisionNames: Record<string, string> = {
  dhaka: "Dhaka",
  chattogram: "Chattogram",
  rajshahi: "Rajshahi",
  khulna: "Khulna",
  barishal: "Barishal",
  sylhet: "Sylhet",
  rangpur: "Rangpur",
  mymensingh: "Mymensingh",
};

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

interface CategoryInfo {
  categoryName: string;
  items: string[];
}

const DivisionInfoPanel = ({ divisionId, onClose }: DivisionInfoPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CategoryInfo[]>([]);

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
          .select("content, categories(name)")
          .eq("division_id", divData.id);

        if (error) {
          console.error("Error fetching division info:", error);
          setData([]);
          return;
        }

        const grouped: Record<string, string[]> = {};
        (rows || []).forEach((row: any) => {
          const catName = row.categories?.name || "Other";
          if (!grouped[catName]) grouped[catName] = [];
          grouped[catName].push(row.content);
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

  // Lock body scroll when modal open
  useEffect(() => {
    if (divisionId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [divisionId]);

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
            className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 bg-white/10 dark:bg-white/5 shadow-2xl backdrop-blur-2xl"
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            {/* Decorative gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-4 backdrop-blur-md">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground drop-shadow-sm">
                {divisionNames[divisionId] || divisionId}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  Division
                </span>
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-full border border-white/20 bg-white/10 p-2 text-foreground backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content: grid with map + info */}
            <div className="relative grid max-h-[calc(90vh-72px)] grid-cols-1 lg:grid-cols-2 overflow-hidden">
              {/* Map side */}
              <div className="relative flex items-center justify-center overflow-hidden border-b border-white/10 bg-white/5 p-4 lg:border-b-0 lg:border-r">
                <div className="relative h-full w-full max-h-[40vh] lg:max-h-[calc(90vh-100px)]">
                  <img
                    src={divisionMaps[divisionId]}
                    alt={`${divisionNames[divisionId]} division map`}
                    className="h-full w-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

              {/* Info side */}
              <div className="overflow-y-auto p-6 max-h-[50vh] lg:max-h-[calc(90vh-72px)]">
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
                  <p className="text-sm text-muted-foreground">
                    No information available for this division yet.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {data.map((cat) => (
                      <div
                        key={cat.categoryName}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                      >
                        <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">
                          {cat.categoryName}
                        </h3>
                        <ul className="list-disc space-y-1 pl-5">
                          {cat.items.map((item, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-foreground/90 leading-relaxed"
                            >
                              {item}
                            </li>
                          ))}
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
