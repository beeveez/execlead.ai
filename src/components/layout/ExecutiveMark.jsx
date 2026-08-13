import React from "react";
import { BrandRegistry } from "@/lib/brandRegistry";

/** Official EXECLEAD.AI E↗ mark. All surfaces use this single vector asset. */
export default function ExecutiveMark({ size = 32, className = "" }) {
  return (
    <img
      src={BrandRegistry.logo.icon}
      width={size}
      height={size}
      alt="EXECLEAD.AI Executive Mark"
      className={className}
      style={{ display: "inline-block", objectFit: "contain" }}
    />
  );
}