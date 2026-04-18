import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { divisionShapes } from "./divisionShapes";
import baseMapSvg from "@/assets/bangladesh_regions_map.svg?raw";

interface InteractiveMapProps {
  onDivisionSelect: (divisionId: string | null) => void;
  selectedDivision: string | null;
}

const InteractiveMap = ({ onDivisionSelect, selectedDivision }: InteractiveMapProps) => {
  const [hoveredDivision, setHoveredDivision] = useState<string | null>(null);

  // Strip outer <svg ...> wrapper so we can inline the contents inside our own
  // <svg>. This lets `currentColor` (used for the land/landmass fill in the
  // base map) inherit from CSS — making the map respect light/dark themes.
  const baseMapInner = useMemo(
    () => baseMapSvg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, ""),
    []
  );

  return (
    <div className="flex items-center justify-center p-4 text-muted">
      <svg
        viewBox="0 0 1530 2138"
        className="w-full max-w-2xl drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base map (rivers, ocean, neighbouring countries) — inlined so its
            currentColor fills follow the active theme. */}
        <g
          className="pointer-events-none text-muted-foreground/30"
          dangerouslySetInnerHTML={{ __html: baseMapInner }}
        />

        {/* Interactive division overlays — each <g> contains all the
            district paths grouped under one division, painted with the
            division's own colour so that when the group lifts on hover
            the actual map piece appears to rise. */}
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
                  fill={division.color}
                  stroke={
                    isSelected
                      ? "hsl(var(--map-selected))"
                      : isHovered
                      ? "hsl(var(--primary))"
                      : "#000000"
                  }
                  strokeWidth={active ? 3 : 0.5}
                  strokeLinejoin="round"
                  className="transition-[stroke-width] duration-200"
                />
              ))}
              {/* Custom themed division label */}
              <text
                x={division.cx}
                y={division.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none font-display"
                style={{
                  fontSize: 44,
                  fontWeight: 700,
                  fill: "hsl(var(--foreground))",
                  paintOrder: "stroke",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 6,
                  strokeLinejoin: "round",
                  letterSpacing: "0.02em",
                }}
              >
                {division.name}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
};

export default InteractiveMap;
