import { useState } from "react";
import InteractiveMap from "@/components/InteractiveMap";
import DivisionInfoPanel from "@/components/DivisionInfoPanel";
import { MapPin } from "lucide-react";

const Index = () => {
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">
                Bangladesh InfoMap
              </h1>
              <p className="text-xs text-muted-foreground">
                Explore divisions interactively
              </p>
            </div>
          </div>

          <nav className="flex gap-4">
            <span className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors">
              Map
            </span>
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Blog
            </span>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-12">
        <div className="mx-auto max-w-2xl text-center mb-8">
          <h2 className="font-heading text-3xl font-bold text-foreground animate-fade-in">
            Explore Bangladesh
          </h2>
          <p className="mt-2 text-muted-foreground animate-fade-in">
            Hover over a division to highlight it. Click to explore detailed information.
          </p>
        </div>

        <InteractiveMap
          selectedDivision={selectedDivision}
          onDivisionSelect={setSelectedDivision}
        />
      </main>

      {/* Side panel */}
      <DivisionInfoPanel
        divisionId={selectedDivision}
        onClose={() => setSelectedDivision(null)}
      />
    </div>
  );
};

export default Index;
