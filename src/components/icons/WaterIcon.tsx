
interface Props {
  className?: string;
}

export default function WaterIcon({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
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

      {/* Falling water drops */}
      <g className="svg-water-drips">
        <path
          d="M 100,12 C 102,22 100,26 100,26 C 100,26 98,22 100,12 Z"
          fill="currentColor"
          stroke="none"
          className="svg-drip svg-drip-1"
        />
        <path
          d="M 100,12 C 102,22 100,26 100,26 C 100,26 98,22 100,12 Z"
          fill="currentColor"
          stroke="none"
          className="svg-drip svg-drip-2"
        />
      </g>

      {/* Cup interior clip path */}
      <defs>
        <clipPath id="cup-clip">
          <path d="M 74.5,53 L 83.5,147 Q 84,153.5 91,153.5 L 109,153.5 Q 116,153.5 116.5,147 L 125.5,53 Z" />
        </clipPath>
      </defs>

      {/* Water inside the cup (clipped) */}
      <g clipPath="url(#cup-clip)">
        {/* Waving water background */}
        <path
          d="M -120,105 Q -90,95 -60,105 T 0,105 T 60,105 T 120,105 T 180,105 T 240,105 T 300,105 L 300,180 L -120,180 Z"
          fill="currentColor"
          opacity="0.35"
          stroke="none"
          className="svg-water-wave svg-wave-back"
        />
        {/* Waving water foreground */}
        <path
          d="M -120,112 Q -90,122 -60,112 T 0,112 T 60,112 T 120,112 T 180,112 T 240,112 T 300,112 L 300,180 L -120,180 Z"
          fill="currentColor"
          opacity="0.8"
          stroke="none"
          className="svg-water-wave svg-wave-front"
        />
        {/* Bubbles rising */}
        <circle cx="88" cy="140" r="3" fill="#ffffff" opacity="0.6" stroke="none" className="svg-bubble svg-bubble-1" />
        <circle cx="102" cy="146" r="2" fill="#ffffff" opacity="0.8" stroke="none" className="svg-bubble svg-bubble-2" />
        <circle cx="112" cy="135" r="3" fill="#ffffff" opacity="0.5" stroke="none" className="svg-bubble svg-bubble-3" />
      </g>

      {/* Glass Outline */}
      <path
        d="M 72,50 L 82,148 Q 83,156 91,156 L 109,156 Q 117,156 118,148 L 128,50"
        strokeWidth="6"
        fill="none"
      />
    </svg>
  );
}
