import React from "react";

/**
 * ExecutiveMark™ — The official EXECLEAD.AI logo mark.
 *
 * A stylized capital letter "E" combined with an upward-pointing arrow.
 *
 * Structure:
 *   • Spine — vertical bar on the left with rounded corners
 *   • Bottom bar — horizontal segment with rounded exterior edge
 *   • Middle bar — angles upward toward the right
 *   • Top bar — sharp-tipped arrow pointing diagonally upward to the right
 *
 * Color: Gold/bronze gradient (#D4B483 → #A68759)
 *
 * The Executive "E" represents Executive Leadership, Excellence,
 * Execution, and Empowerment.
 *
 * The upward arrow represents Leadership Growth, Career Progression,
 * Continuous Learning, Promotion, and Executive Impact.
 */
export default function ExecutiveMark({ size = 32, className = "", color }) {
  const gradientId = React.useId();
  const fill = color || `url(#${gradientId})`;

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
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4B483" />
          <stop offset="100%" stopColor="#A68759" />
        </linearGradient>
      </defs>
      {/* Spine — vertical bar with rounded corners */}
      <rect x="10" y="10" width="8" height="44" rx="4" fill={fill} />
      {/* Bottom bar — horizontal, rounded exterior edge */}
      <rect x="10" y="46" width="28" height="8" rx="4" fill={fill} />
      {/* Middle bar — angles upward toward the right */}
      <path d="M10 38 L10 30 L34 26 L34 34 Z" fill={fill} />
      {/* Top bar + Arrowhead — diagonal up-right, sharp tip */}
      <path d="M10 22 L10 14 L36 10 L52 6 L42 16 L36 18 Z" fill={fill} />
    </svg>
  );
}