import React, { useState, useRef, useEffect } from "react";
import { Loader2, ArrowDown } from "lucide-react";

const THRESHOLD = 70;
const MAX_PULL = 100;

/**
 * PullToRefresh — native-style pull-to-refresh gesture wrapper.
 * Activates only when the page is scrolled to the top and the user
 * drags downward. Calls `onRefresh` (async) when the pull exceeds
 * the threshold. No-op on desktop (no touch events).
 */
export default function PullToRefresh({ onRefresh, children, className }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const startY = useRef(0);
  const pulling = useRef(false);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const containerRef = useRef(null);

  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);
  useEffect(() => { refreshingRef.current = refreshing; }, [refreshing]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e) => {
      if (refreshingRef.current) return;
      if (window.scrollY > 5) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    };

    const handleTouchMove = (e) => {
      if (!pulling.current || refreshingRef.current) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) return;
      // Apply resistance so the pull feels elastic, not 1:1
      const resisted = Math.min(MAX_PULL, delta * 0.5);
      pullRef.current = resisted;
      setPullDistance(resisted);
      if (resisted > 5) e.preventDefault();
    };

    const handleTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;
      const distance = pullRef.current;

      if (distance >= THRESHOLD && !refreshingRef.current) {
        setRefreshing(true);
        refreshingRef.current = true;
        setPullDistance(THRESHOLD);
        try {
          await onRefreshRef.current();
        } finally {
          setRefreshing(false);
          refreshingRef.current = false;
          setPullDistance(0);
          pullRef.current = 0;
        }
      } else {
        setPullDistance(0);
        pullRef.current = 0;
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const progress = Math.min(1, pullDistance / THRESHOLD);
  const isAnimating = !pulling.current;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isAnimating ? "transform 0.3s ease" : "none",
      }}
    >
      {/* Refresh indicator — grows with pull, spins while refreshing */}
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{
          height: pullDistance > 0 ? pullDistance : 0,
          transition: isAnimating ? "height 0.3s ease" : "none",
        }}
      >
        {refreshing ? (
          <Loader2 size={20} className="text-indigo-400 animate-spin" />
        ) : (
          <ArrowDown
            size={20}
            className="text-indigo-400"
            style={{
              transform: `rotate(${progress * 180}deg)`,
              opacity: progress,
            }}
          />
        )}
      </div>
      {children}
    </div>
  );
}