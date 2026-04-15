import { useState } from "react";
import InteractiveMap from "@/components/InteractiveMap";
import DivisionInfoPanel from "@/components/DivisionInfoPanel";
import Navbar from "@/components/Navbar";

const Index = () => {
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />

      <main className="container py-12">
        <div className="mx-auto max-w-2xl text-center mb-10">
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-foreground animate-fade-in">
            Explore Bangladesh
          </h2>
          <p className="mt-3 text-muted-foreground animate-fade-in text-base">
            Hover over a division to highlight it. Click to explore detailed information.
          </p>
        </div>

        <InteractiveMap
          selectedDivision={selectedDivision}
          onDivisionSelect={setSelectedDivision}
        />
      </main>

      <DivisionInfoPanel
        divisionId={selectedDivision}
        onClose={() => setSelectedDivision(null)}
      />
    </div>
  );
};

export default Index;
