import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * Drill-down breadcrumb. The last item is the current context;
 * earlier items link back to their filtered dataset.
 */
export default function DrillBreadcrumb({ items }) {
  return (
    <div className="flex items-center gap-1.5 text-sm flex-wrap">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={12} className="text-white/20" />}
          {item.to && i < items.length - 1 ? (
            <Link
              to={item.to}
              title={`Go to ${item.label}`}
              aria-label={`Go to ${item.label}`}
              className="text-white/40 hover:text-white/80 hover:underline underline-offset-2 decoration-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-400/50 focus:rounded transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white/80 font-medium" aria-current="page">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}