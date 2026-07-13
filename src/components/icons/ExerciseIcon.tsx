
interface Props {
  className?: string;
}

export default function ExerciseIcon({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="8"
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

      {/* Left Leg */}
      <g className="svg-joint-left-leg">
        <line x1="100" y1="110" x2="80" y2="148" />
        <line x1="80" y1="148" x2="92" y2="182" />
      </g>

      {/* Right Leg */}
      <g className="svg-joint-right-leg">
        <line x1="100" y1="110" x2="120" y2="148" />
        <line x1="120" y1="148" x2="108" y2="182" />
      </g>

      {/* Left Arm */}
      <g className="svg-joint-left-arm">
        <line x1="100" y1="70" x2="70" y2="92" />
        <line x1="70" y1="92" x2="85" y2="120" />
      </g>

      {/* Right Arm */}
      <g className="svg-joint-right-arm">
        <line x1="100" y1="70" x2="130" y2="92" />
        <line x1="130" y1="92" x2="115" y2="120" />
      </g>

      {/* Torso & Head Group (bobs up and down) */}
      <g className="svg-torso-head">
        <line x1="100" y1="70" x2="100" y2="110" strokeWidth="10" />
        <circle cx="100" cy="44" r="15" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
