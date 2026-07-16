import React from "react";

/**
 * ExecutiveMark™ — The official EXECLEAD.AI logo mark.
 *
 * A custom Executive "E" monogram with an integrated upward arrow.
 *
 * The Executive "E" represents:
 *   • Executive Leadership
 *   • Excellence
 *   • Execution
 *   • Empowerment
 *
 * The upward arrow represents:
 *   • Leadership Growth
 *   • Career Progression
 *   • Continuous Learning
 *   • Promotion
 *   • Executive Impact
 *
 * Together, the mark symbolizes the journey from ambitious
 * technology professional to executive leader.
 */
export default function ExecutiveMark({
  size = 32,
  className = "",
  color = "currentColor",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="EXECLEAD.AI Executive Mark"
    >
      {/* Executive E — vertical spine + three horizontal bars */}
      <g fill={color}>
        <rect x="6" y="8" width="7" height="48" rx="3.5" />
        <rect x="6" y="8" width="22" height="7" rx="3.5" />
        <rect x="6" y="28.5" width="18" height="7" rx="3.5" />
        <rect x="6" y="49" width="22" height="7" rx="3.5" />
      </g>
      {/* Upward Arrow — growth, progression, promotion */}
      <path
        d="M44 56 L44 14 M36 22 L44 14 L52 22"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}