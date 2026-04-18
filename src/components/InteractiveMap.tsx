import { useState } from "react";
import { motion } from "framer-motion";

interface DivisionHotspot {
  id: string;
  name: string;
  // Coordinates in the source SVG's coordinate system (1530 x 2138).
  cx: number;
  cy: number;
  // Click radius (also drives label/highlight size).
  r: number;
}

const divisions: DivisionHotspot[] = [
  { id: "rangpur",    name: "Rangpur",    cx: 250,  cy: 258,  r: 150 },
  { id: "mymensingh", name: "Mymensingh", cx: 740,  cy: 593,  r: 130 },
  { id: "rajshahi",   name: "Rajshahi",   cx: 327,  cy: 661,  r: 180 },
  { id: "sylhet",     name: "Sylhet",     cx: 1190, cy: 730,  r: 170 },
  { id: "dhaka",      name: "Dhaka",      cx: 756,  cy: 942,  r: 160 },
  { id: "khulna",     name: "Khulna",     cx: 428,  cy: 1333, r: 200 },
  { id: "chattogram", name: "Chattogram", cx: 1296, cy: 1400, r: 200 },
  { id: "barishal",   name: "Barisal",    cx: 763,  cy: 1503, r: 150 },
];

interface InteractiveMapProps {
  onDivisionSelect: (divisionId: string | null) => void;
  selectedDivision: string | null;
}

const InteractiveMap = ({ onDivisionSelect, selectedDivision }: InteractiveMapProps) => {
  const [hoveredDivision, setHoveredDivision] = useState<string | null>(null);

  // Source SVG native size — we use it as our viewBox so hotspot coords match exactly.
  const VB = "0 0 1530 2138";

  return (
    <div className="flex items-center justify-center p-4">
      <svg
        viewBox={VB}
        className="w-full max-w-2xl drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base map — full uploaded SVG (rivers, ocean, borders, region fills, labels) */}
        <image
          href="/assets/bangladesh_regions_map.svg"
          x="0"
          y="0"
          width="1530"
          height="2138"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none"
        />

        {/* Clickable division hotspots overlaid on top of the map */}
        {divisions.map((d) => {
          const isHovered = hoveredDivision === d.id;
          const isSelected = selectedDivision === d.id;
          const active = isHovered || isSelected;

          return (
            <motion.g
              key={d.id}
              className="cursor-pointer"
              initial={false}
              animate={{
                scale: active ? 1.08 : 1,
              }}
              style={{ transformOrigin: `${d.cx}px ${d.cy}px`, transformBox: "fill-box" } as React.CSSProperties}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onMouseEnter={() => setHoveredDivision(d.id)}
              onMouseLeave={() => setHoveredDivision(null)}
              onClick={() =>
                onDivisionSelect(selectedDivision === d.id ? null : d.id)
              }
            >
              {/* Hit area + visual highlight */}
              <circle
                cx={d.cx}
                cy={d.cy}
                r={d.r}
                fill={
                  isSelected
                    ? "hsl(var(--map-selected))"
                    : isHovered
                    ? "hsl(var(--map-hover))"
                    : "hsl(var(--map-default))"
                }
                fillOpacity={isSelected ? 0.55 : isHovered ? 0.4 : 0}
                stroke={
                  active ? "hsl(var(--map-selected))" : "transparent"
                }
                strokeWidth={active ? 6 : 0}
                className="transition-all duration-200"
              />
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
};

export default InteractiveMap;
