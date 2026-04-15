import { useState } from "react";
import { motion } from "framer-motion";

interface Division {
  id: string;
  name: string;
  path: string;
}

// Placeholder divisions — replace paths with actual SVG path data
const divisions: Division[] = [
  { id: "dhaka", name: "Dhaka", path: "M200,250 L220,200 L260,210 L270,260 L240,280 Z" },
  { id: "chattogram", name: "Chattogram", path: "M270,260 L290,220 L330,250 L320,310 L280,300 Z" },
  { id: "rajshahi", name: "Rajshahi", path: "M100,180 L140,150 L180,170 L170,220 L120,220 Z" },
  { id: "khulna", name: "Khulna", path: "M120,250 L160,230 L200,250 L190,300 L140,300 Z" },
  { id: "barishal", name: "Barishal", path: "M190,300 L220,280 L250,310 L230,350 L200,340 Z" },
  { id: "sylhet", name: "Sylhet", path: "M260,140 L300,120 L330,150 L310,190 L270,180 Z" },
  { id: "rangpur", name: "Rangpur", path: "M130,80 L170,60 L200,90 L190,140 L140,140 Z" },
  { id: "mymensingh", name: "Mymensingh", path: "M190,140 L230,120 L260,150 L250,200 L200,200 Z" },
];

interface InteractiveMapProps {
  onDivisionSelect: (divisionId: string | null) => void;
  selectedDivision: string | null;
}

const InteractiveMap = ({ onDivisionSelect, selectedDivision }: InteractiveMapProps) => {
  const [hoveredDivision, setHoveredDivision] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-center p-8">
      <svg
        viewBox="50 30 330 360"
        className="w-full max-w-lg drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {divisions.map((division) => {
          const isHovered = hoveredDivision === division.id;
          const isSelected = selectedDivision === division.id;

          return (
            <motion.path
              key={division.id}
              d={division.path}
              fill={
                isSelected
                  ? "hsl(var(--map-selected))"
                  : isHovered
                  ? "hsl(var(--map-hover))"
                  : "hsl(var(--map-default))"
              }
              stroke="hsl(var(--background))"
              strokeWidth={2}
              className="cursor-pointer"
              initial={false}
              animate={{
                y: isHovered ? -15 : 0,
                filter: isHovered
                  ? "drop-shadow(0 12px 16px rgba(0,0,0,0.25))"
                  : "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onMouseEnter={() => setHoveredDivision(division.id)}
              onMouseLeave={() => setHoveredDivision(null)}
              onClick={() =>
                onDivisionSelect(
                  selectedDivision === division.id ? null : division.id
                )
              }
            />
          );
        })}

        {/* Division labels */}
        {divisions.map((division) => {
          // Calculate rough center from path for label placement
          const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
          pathEl.setAttribute("d", division.path);
          // We'll use a simple approach: extract coordinates and average them
          const coords = division.path.match(/[\d.]+/g)?.map(Number) || [];
          const xs = coords.filter((_, i) => i % 2 === 0);
          const ys = coords.filter((_, i) => i % 2 === 1);
          const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
          const cy = ys.reduce((a, b) => a + b, 0) / ys.length;

          return (
            <motion.text
              key={`label-${division.id}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              className="pointer-events-none select-none fill-primary-foreground font-body text-[8px] font-semibold"
              animate={{
                y: hoveredDivision === division.id ? cy - 15 : cy,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {division.name}
            </motion.text>
          );
        })}
      </svg>
    </div>
  );
};

export default InteractiveMap;
