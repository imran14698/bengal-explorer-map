import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

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
        // First get the division id from slug
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

        // Group by category
        const grouped: Record<string, string[]> = {};
        (rows || []).forEach((row: any) => {
          const catName = row.categories?.name || "Other";
          if (!grouped[catName]) grouped[catName] = [];
          grouped[catName].push(row.info);
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

  return (
    <AnimatePresence>
      {divisionId && (
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-card shadow-2xl overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              {divisionNames[divisionId] || divisionId}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
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
                  <div key={cat.categoryName}>
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">
                      {cat.categoryName}
                    </h3>
                    <ul className="list-disc space-y-1 pl-5">
                      {cat.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-foreground/90"
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
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default DivisionInfoPanel;
