import React from "react";

export default function ExecleadWordmark({ className = "" }) {
  return (
    <span className={`execlead-wordmark ${className}`} aria-label="EXECLEAD.AI">
      EXECLEAD<span className="execlead-wordmark-ai">.AI</span>
    </span>
  );
}