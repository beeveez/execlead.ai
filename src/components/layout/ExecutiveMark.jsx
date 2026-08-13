import React from "react";

/**
 * ExecutiveMark™ — The official EXECLEAD.AI logo mark.
 *
 * A custom Executive "E" monogram with an integrated upward arrow.
 *
 * The Executive "E" represents Executive Leadership, Excellence,
 * Execution, and Empowerment.
 *
 * The upward arrow represents Leadership Growth, Career Progression,
 * Continuous Learning, Promotion, and Executive Impact.
 */
const LOGO_URL =
  "https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/c8da542d1_image.png";

export default function ExecutiveMark({ size = 32, className = "" }) {
  return (
    <img
      src={LOGO_URL}
      width={size}
      height={size}
      alt="EXECLEAD.AI"
      className={className}
      style={{ display: "inline-block", objectFit: "contain" }}
    />
  );
}