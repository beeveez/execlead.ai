import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/**
 * SubHeader — consistent top bar for child/detail/edit screens.
 * Features an explicit back button calling navigate(-1) (or navigate(backTo)
 * when a specific destination is provided). Renders on all screen sizes.
 */
export default function SubHeader({ title, subtitle, actions, backTo }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 mb-4">
      <button
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors flex-shrink-0"
        aria-label="Go back"
      >
        <ChevronLeft size={18} />
        <span className="hidden sm:inline">Back</span>
      </button>
      <div className="h-5 w-px bg-white/10 hidden sm:block" />
      <div className="flex-1 min-w-0">
        {title && <h2 className="text-base font-semibold text-white truncate">{title}</h2>}
        {subtitle && <p className="text-xs text-white/40 truncate">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
    </div>
  );
}