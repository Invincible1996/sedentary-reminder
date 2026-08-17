import type { CSSProperties } from "react";
import ChestExpansionIcon from "./ChestExpansionIcon";

export type ExerciseVariant = "overhead" | "chest";

interface Props {
  className?: string;
  style?: CSSProperties;
  variant?: ExerciseVariant;
}

export { ChestExpansionIcon };

export default function ExerciseIcon({ className, style, variant = "overhead" }: Props) {
  if (variant === "chest") {
    return <ChestExpansionIcon className={className} style={style} />;
  }

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
      {/* Background glowing rings */}
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

      {/* Stretching Sparkles at overhead stretch peak */}
      <g className="svg-stretch-sparkles">
        {/* Top central sparkle */}
        <path
          d="M 100,8 L 100,22 M 93,15 L 107,15"
          stroke="currentColor"
          strokeWidth="3"
          className="svg-sparkle svg-sparkle-main"
        />
        {/* Ambient mini sparkles */}
        <circle cx="80" cy="16" r="2" fill="currentColor" stroke="none" className="svg-sparkle svg-sparkle-left" />
        <circle cx="120" cy="16" r="2" fill="currentColor" stroke="none" className="svg-sparkle svg-sparkle-right" />
        <circle cx="100" cy="5" r="1.5" fill="currentColor" stroke="none" className="svg-sparkle svg-sparkle-top" />
      </g>

      {/* Upward gentle stretch aura lines */}
      <g className="svg-stretch-auras">
        <path d="M 64,90 Q 58,68 66,46" stroke="currentColor" strokeWidth="2" strokeDasharray="3 6" opacity="0.4" className="svg-aura svg-aura-left" />
        <path d="M 136,90 Q 142,68 134,46" stroke="currentColor" strokeWidth="2" strokeDasharray="3 6" opacity="0.4" className="svg-aura svg-aura-right" />
      </g>

      {/* Legs & Stance */}
      <g className="svg-stretch-legs">
        <path d="M 94,116 L 84,148 L 84,178" />
        <path d="M 106,116 L 116,148 L 116,178" />
      </g>

      {/* Torso & Head (lifts upward gently with deep inhale) */}
      <g className="svg-stretch-body">
        {/* Spine */}
        <line x1="100" y1="68" x2="100" y2="116" strokeWidth="8" />
        {/* Head */}
        <circle cx="100" cy="46" r="13" fill="currentColor" stroke="none" />
      </g>

      {/* Left Arm: Shoulder (88, 76), Elbow (70, 98), Hand (58, 124) */}
      <g className="svg-stretch-arm-l-upper">
        <line x1="88" y1="76" x2="70" y2="98" />
        <circle cx="70" cy="98" r="3.5" fill="currentColor" stroke="none" />
        <g className="svg-stretch-arm-l-fore">
          <line x1="70" y1="98" x2="58" y2="124" />
          <circle cx="58" cy="124" r="3.5" fill="currentColor" stroke="none" />
        </g>
      </g>

      {/* Right Arm: Shoulder (112, 76), Elbow (130, 98), Hand (142, 124) */}
      <g className="svg-stretch-arm-r-upper">
        <line x1="112" y1="76" x2="130" y2="98" />
        <circle cx="130" cy="98" r="3.5" fill="currentColor" stroke="none" />
        <g className="svg-stretch-arm-r-fore">
          <line x1="130" y1="98" x2="142" y2="124" />
          <circle cx="142" cy="124" r="3.5" fill="currentColor" stroke="none" />
        </g>
      </g>
    </svg>
  );
}
