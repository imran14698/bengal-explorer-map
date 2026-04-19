import { useState } from "react";
import { motion } from "framer-motion";
import { divisionShapes } from "./divisionShapes";
import { useTheme } from "@/hooks/useTheme";

interface InteractiveMapProps {
  onDivisionSelect: (divisionId: string | null) => void;
  selectedDivision: string | null;
}

const InteractiveMap = ({ onDivisionSelect, selectedDivision }: InteractiveMapProps) => {
  const [hoveredDivision, setHoveredDivision] = useState<string | null>(null);
  const { theme } = useTheme();
  const baseMapSrc =
    theme === "dark"
      ? "/assets/bangladesh_regions_map_dark.svg"
      : "/assets/bangladesh_regions_map_light.svg";

  return (
    <div className="flex items-center justify-center p-4">
      <svg
        viewBox="0 0 1530 2138"
        className="w-full max-w-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base map (rivers, ocean, neighbouring countries, region labels) */}
        <image
          href={baseMapSrc}
          key={baseMapSrc}
          x="0"
          y="0"
          width="1530"
          height="2138"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none"
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

        {/* Bay of Bengal label */}
        <text
          x="950"
          y="1980"
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none select-none font-display"
          style={{
            fontSize: 64,
            fontWeight: 700,
            fill: "#1e3a5f",
            fontStyle: "italic",
            letterSpacing: "0.1em",
          }}
        >
          Bay of Bengal
        </text>
      </svg>
    </div>
  );
};

export default InteractiveMap;
