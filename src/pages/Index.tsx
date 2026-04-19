import { useState } from "react";
import { motion } from "framer-motion";
import InteractiveMap from "@/components/InteractiveMap";
import DivisionInfoPanel from "@/components/DivisionInfoPanel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <Navbar />

      <main className="flex-1 bg-[#f0f3f1] dark:bg-background">
        <div className="container py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-8 sm:mb-10 mx-auto max-w-2xl text-center px-2"
        >
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Explore{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Bangladesh
            </span>
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Hover over a division to highlight it. Click to explore detailed information
            about geography, culture, and more.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <InteractiveMap selectedDivision={selectedDivision} onDivisionSelect={setSelectedDivision} />
        </motion.div>
        </div>
      </main>

      <DivisionInfoPanel divisionId={selectedDivision} onClose={() => setSelectedDivision(null)} />
      <Footer />
    </div>
  );
};

export default Index;
