import React from "react";

const MARK_URL = "https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/c8da542d1_image.png";
const SIZES = { sm: "h-5", md: "h-7", lg: "h-9", hero: "h-16" };
const VIEWS = {
  horizontal: "0 0 360 64",
  stacked: "0 0 300 140",
  wordmark: "0 0 280 64",
  icon: "0 0 64 64",
};

export default function CanonicalBrandLockup({ variant = "horizontal", size = "md", theme = "dark", className = "" }) {
  const iconOnly = variant === "icon";
  const stacked = variant === "stacked";
  const wordmarkOnly = variant === "wordmark";
  const wordmarkClass = theme === "dark" ? "fill-brand-exec-silver" : "fill-brand-exec-blue";
  const wordX = stacked ? 150 : wordmarkOnly ? 6 : 84;
  const wordY = stacked ? 122 : 43;

  return (
    <svg viewBox={VIEWS[variant]} role="img" aria-label="EXECLEAD.AI" preserveAspectRatio="xMinYMid meet" className={`${SIZES[size]} w-auto max-w-full shrink-0 ${className}`}>
      <title>EXECLEAD.AI</title>
      {!wordmarkOnly && <image href={MARK_URL} x={stacked ? 122 : 4} y={stacked ? 4 : 4} width="56" height="56" preserveAspectRatio="xMidYMid meet" />}
      {variant === "horizontal" && <line x1="71" y1="13" x2="71" y2="51" className="stroke-brand-exec-silver/50" strokeWidth="1" />}
      {!iconOnly && (
        <text x={wordX} y={wordY} textAnchor={stacked ? "middle" : "start"} className="font-display" fontSize="34" fontWeight="800" letterSpacing="1.1">
          <tspan className={wordmarkClass}>EXECLEAD</tspan><tspan className="fill-brand-ai-blue">.AI</tspan>
        </text>
      )}
    </svg>
  );
}