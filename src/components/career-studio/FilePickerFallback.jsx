import React from "react";
import { AlertCircle, FlaskConical } from "lucide-react";

/**
 * Fallback message shown when the testing environment cannot
 * access native file pickers. Displays guidance to use
 * Resume Parser Test Tools™ instead.
 */
export default function FilePickerFallback({ show }) {
  if (!show) return null;

  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
      <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-amber-300/90 font-medium">
          File upload could not be tested because the testing environment restricts native file selection.
        </p>
        <p className="text-xs text-amber-300/60 mt-1 flex items-center gap-1">
          Use <FlaskConical size={11} className="inline" /> Resume Parser Test Tools™ above to validate parser logic.
        </p>
      </div>
    </div>
  );
}