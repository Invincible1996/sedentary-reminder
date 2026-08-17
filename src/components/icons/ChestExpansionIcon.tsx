import type { CSSProperties } from "react";

interface Props {
  className?: string;
  style?: CSSProperties;
}

export default function ChestExpansionIcon({ className, style }: Props) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ambient background pulsing rings */}
      <circle
        cx="100"
        cy="100"
        r="85"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 8"
        opacity="0.15"
        className="svg-bg-ring-outer"
      />
      <circle
        cx="100"
        cy="100"
        r="65"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.1"
        className="svg-bg-ring-inner"
      />

      {/* Chest Expansion dynamic energy arcs and sparkles */}
      <g className="svg-chest-auras">
        <path
          d="M 52,78 Q 36,78 22,64"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="4 5"
          className="svg-chest-arc svg-chest-arc-left"
        />
        <path
          d="M 148,78 Q 164,78 178,64"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="4 5"
          className="svg-chest-arc svg-chest-arc-right"
        />
        {/* Heart / Chest center expansion ring */}
        <circle
          cx="100"
          cy="80"
          r="15"
          stroke="currentColor"
          strokeWidth="1.5"
          className="svg-chest-center-pulse"
        />
        {/* Lateral expansion accent sparkles */}
        <path
          d="M 18,62 L 18,74 M 12,68 L 24,68"
          stroke="currentColor"
          strokeWidth="2"
          className="svg-chest-sparkle svg-chest-sparkle-l"
        />
        <path
          d="M 182,62 L 182,74 M 176,68 L 188,68"
          stroke="currentColor"
          strokeWidth="2"
          className="svg-chest-sparkle svg-chest-sparkle-r"
        />
      </g>

      {/* Legs & Lower Body */}
      <g className="svg-chest-legs">
        <path d="M 94,116 L 82,148 L 82,178" />
        <path d="M 106,116 L 118,148 L 118,178" />
      </g>

      {/* Torso Spine & Head (expands chest and subtly tilts head) */}
      <g className="svg-chest-body">
        {/* Spine / Torso */}
        <line x1="100" y1="68" x2="100" y2="116" strokeWidth="8" />
        {/* Head */}
        <circle cx="100" cy="46" r="13" fill="currentColor" stroke="none" />
      </g>

      {/* Left Arm Multi-joint System */}
      {/* Upper Arm anchored at Left Shoulder (88, 76) */}
      <g className="svg-chest-arm-l-upper">
        <line x1="88" y1="76" x2="64" y2="82" />
        {/* Elbow Joint (64, 82) */}
        <circle cx="64" cy="82" r="3.5" fill="currentColor" stroke="none" />
        {/* Forearm rotates around elbow (64, 82) */}
        <g className="svg-chest-arm-l-fore">
          <line x1="64" y1="82" x2="96" y2="82" />
          {/* Hand accent */}
          <circle cx="96" cy="82" r="3.5" fill="currentColor" stroke="none" />
        </g>
      </g>

      {/* Right Arm Multi-joint System */}
      {/* Upper Arm anchored at Right Shoulder (112, 76) */}
      <g className="svg-chest-arm-r-upper">
        <line x1="112" y1="76" x2="136" y2="82" />
        {/* Elbow Joint (136, 82) */}
        <circle cx="136" cy="82" r="3.5" fill="currentColor" stroke="none" />
        {/* Forearm rotates around elbow (136, 82) */}
        <g className="svg-chest-arm-r-fore">
          <line x1="136" y1="82" x2="104" y2="82" />
          {/* Hand accent */}
          <circle cx="104" cy="82" r="3.5" fill="currentColor" stroke="none" />
        </g>
      </g>
    </svg>
  );
}
