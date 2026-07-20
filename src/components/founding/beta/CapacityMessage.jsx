import React from "react";

/**
 * Smart Capacity Messaging™ — contextual copy based on seats remaining.
 * Messages update automatically from shared metrics.
 */
export function getCapacityMessage(seatsRemaining) {
  if (seatsRemaining <= 0) {
    return { message: "Founding Beta is full. Join the Executive Waitlist.", tone: "full" };
  }
  if (seatsRemaining <= 5) {
    return { message: "Final invitations are now being issued.", tone: "urgent" };
  }
  if (seatsRemaining <= 20) {
    return { message: "Limited Founding Member places remain.", tone: "limited" };
  }
  if (seatsRemaining <= 50) {
    return { message: "More than half of the Founding cohort has been selected.", tone: "progress" };
  }
  return { message: "Applications are open. Founding places are available.", tone: "open" };
}

const TONE_STYLES = {
  open: "text-emerald-300/80",
  progress: "text-amber-300/80",
  limited: "text-amber-400/80",
  urgent: "text-orange-400/80",
  full: "text-red-400/80",
};

export default function CapacityMessage({ seatsRemaining }) {
  const { message, tone } = getCapacityMessage(seatsRemaining);
  return (
    <p className={`text-sm leading-relaxed max-w-xl mx-auto mb-6 ${TONE_STYLES[tone]}`} role="status">
      {message}
    </p>
  );
}