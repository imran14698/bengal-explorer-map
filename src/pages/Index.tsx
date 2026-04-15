import { useState } from "react";
import InteractiveMap from "@/components/InteractiveMap";
import DivisionInfoPanel from "@/components/DivisionInfoPanel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <Navbar />

      <main className="container flex-1 py-12">
        <div className="mb-10 mx-auto max-w-2xl text-center">
          <h2 className="animate-fade-in font-heading text-4xl font-extrabold tracking-tight text-foreground">
            Explore Bangladesh
          </h2>
          <p className="mt-3 animate-fade-in text-base text-muted-foreground">
            Hover over a division to highlight it. Click to explore detailed information.
          </p>
        </div>

        <InteractiveMap selectedDivision={selectedDivision} onDivisionSelect={setSelectedDivision} />
      </main>

      <DivisionInfoPanel divisionId={selectedDivision} onClose={() => setSelectedDivision(null)} />
      <Footer />
    </div>
  );
};

export default Index;
