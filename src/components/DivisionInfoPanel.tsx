import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const DivisionInfoPanel = ({ divisionId, onClose }: DivisionInfoPanelProps) => {
  return (
    <AnimatePresence>
      {divisionId && (
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-card shadow-2xl"
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
            <p className="text-sm text-muted-foreground">
              Select a category to explore detailed information about this division.
              Data will be loaded from Supabase once connected.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                "War History",
                "Rulers",
                "Name Backstory",
                "Liberation War",
                "Historical Places",
                "Water Quality",
                "Common Diseases",
                "Rivers",
                "Famous Food",
                "GDP & Products",
                "Ethnic Groups",
              ].map((cat) => (
                <button
                  key={cat}
                  className="rounded-lg border border-border bg-secondary/50 px-3 py-3 text-left text-sm font-medium text-secondary-foreground transition-all hover:border-primary/30 hover:bg-primary/5"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default DivisionInfoPanel;
