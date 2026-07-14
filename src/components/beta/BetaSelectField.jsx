import React, { useMemo } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

/**
 * Reusable accessible select field for the Beta Application form.
 *
 * • Uses shadcn Select (Radix UI) — dark-mode safe, keyboard accessible.
 * • Filters out null / undefined / empty / whitespace-only options.
 * • Auto-sizes dropdown height to the number of valid options.
 * • Shows "No options available" empty-state when zero valid options exist.
 */
export default function BetaSelectField({
  label,
  value,
  onValueChange,
  options = [],
  placeholder = "Select...",
  required = false,
  className,
}) {
  const validOptions = useMemo(
    () =>
      (Array.isArray(options) ? options : []).filter(
        (opt) =>
          opt &&
          opt.value != null &&
          String(opt.value).length > 0 &&
          String(opt.label || "").trim().length > 0
      ),
    [options]
  );

  return (
    <div>
      <label className="block text-[11px] font-medium text-white/60 mb-1.5">
        {label}
        {required && <span className="text-white/30 ml-0.5">*</span>}
      </label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger
          className={`w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white data-[placeholder]:text-white/30 focus:outline-none focus:border-indigo-500/40 transition-colors h-auto ${className || ""}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {validOptions.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-white/40">
              No options available
            </div>
          ) : (
            validOptions.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}