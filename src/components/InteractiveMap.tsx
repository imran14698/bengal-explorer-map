import { useState } from "react";
import { motion } from "framer-motion";
import { divisionShapes } from "./divisionShapes";

interface InteractiveMapProps {
  onDivisionSelect: (divisionId: string | null) => void;
  selectedDivision: string | null;
}

const InteractiveMap = ({ onDivisionSelect, selectedDivision }: InteractiveMapProps) => {
  const [hoveredDivision, setHoveredDivision] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-center p-4">
      <svg
        viewBox="0 0 1530 2138"
        className="w-full max-w-2xl drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base map (rivers, ocean, neighbouring countries, region labels) */}
        <image
          href="/assets/bangladesh_regions_map.svg"
          x="0"
          y="0"
          width="1530"
          height="2138"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none"
        />

        {/* Interactive division overlays — each <g> contains all the
            district paths grouped under one division. Transparent until
            hovered/selected so the base map shows through. */}
        {divisionShapes.map((division) => {
          const isHovered = hoveredDivision === division.id;
          const isSelected = selectedDivision === division.id;
          const active = isHovered || isSelected;

          return (
            <motion.g
              key={division.id}
              className="cursor-pointer"
              initial={false}
              animate={{
                y: isHovered ? -28 : 0,
                filter: active
                  ? "drop-shadow(0 18px 24px rgba(0,0,0,0.35))"
                  : "drop-shadow(0 0 0 rgba(0,0,0,0))",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onMouseEnter={() => setHoveredDivision(division.id)}
              onMouseLeave={() => setHoveredDivision(null)}
              onClick={() =>
                onDivisionSelect(selectedDivision === division.id ? null : division.id)
              }
            >
              {division.paths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill={
                    isSelected
                      ? "hsl(var(--map-selected))"
                      : isHovered
                      ? "hsl(var(--map-hover))"
                      : "hsl(var(--map-default))"
                  }
                  fillOpacity={isSelected ? 0.8 : isHovered ? 0.7 : 0}
                  stroke={active ? "hsl(var(--map-selected))" : "transparent"}
                  strokeWidth={active ? 3 : 0}
                  className="transition-all duration-200"
                />
              ))}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
};

export default InteractiveMap;
