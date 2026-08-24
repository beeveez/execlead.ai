import React from "react";

const LEGACY_BADGE_SOURCE = "https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/da8c9265f_exec.png";
const sizes = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-11 h-11" };

export default function ExecConciergeBadge({ size = "sm", className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`${sizes[size] || sizes.sm} rounded-full overflow-hidden shadow-sm flex-shrink-0 ${className}`}
    >
      <svg viewBox="954 513 44 44" className="block w-full h-full" preserveAspectRatio="xMidYMid slice">
        <image href={LEGACY_BADGE_SOURCE} width="1024" height="576" />
      </svg>
    </span>
  );
}