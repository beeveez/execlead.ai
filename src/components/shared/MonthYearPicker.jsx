import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, Calendar } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * MonthYearPicker™ — Standard Month-Year picker across EXECLEAD.AI
 *
 * Props:
 *   value        — "YYYY-MM" string (e.g. "2015-06"), "YYYY" for year-only, "Present", or ""
 *   minYear      — number (default 1980)
 *   maxYear      — number (default: current year + 5 if allowFuture, else current year)
 *   allowFuture  — boolean (default true)
 *   allowPresent — boolean — shows "Present" quick-select (default false)
 *   onChange      — (value: string) => void
 *   mode         — "month-year" (default) | "year-only"
 *   placeholder  — string
 */
export default function MonthYearPicker({
  value,
  minYear = 1980,
  maxYear,
  allowFuture = true,
  allowPresent = false,
  onChange,
  mode = "month-year",
  placeholder = "Select date",
  disabled = false,
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const effectiveMaxYear = maxYear || (allowFuture ? currentYear + 5 : currentYear);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(mode === "year-only" ? "years" : "months");
  const [browseYear, setBrowseYear] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef(null);
  const gridRef = useRef(null);

  const parsed = useMemo(() => {
    if (!value || value === "Present") return { year: null, month: null, isPresent: value === "Present" };
    const parts = String(value).split("-");
    return { year: parseInt(parts[0]) || null, month: parseInt(parts[1]) || null, isPresent: false };
  }, [value]);

  const activeYear = browseYear ?? parsed.year ?? currentYear;

  const years = useMemo(() => {
    const arr = [];
    for (let y = effectiveMaxYear; y >= minYear; y--) arr.push(y);
    return arr;
  }, [minYear, effectiveMaxYear]);

  const showSearch = years.length > 30;

  const filteredYears = useMemo(() => {
    if (!searchQuery) return years;
    return years.filter(y => String(y).includes(searchQuery));
  }, [years, searchQuery]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) handleClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open && view === "years" && gridRef.current) {
      const sel = gridRef.current.querySelector('[data-selected="true"]');
      if (sel) { sel.scrollIntoView({ block: "center", behavior: "auto" }); return; }
      const cur = gridRef.current.querySelector('[data-current="true"]');
      if (cur) cur.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }, [open, view, searchQuery]);

  const handleClose = () => {
    setOpen(false);
    setView(mode === "year-only" ? "years" : "months");
    setBrowseYear(null);
    setSearchQuery("");
  };

  const handleYearSelect = (year) => {
    if (mode === "year-only") {
      onChange(String(year));
      handleClose();
      return;
    }
    setBrowseYear(year);
    setView("months");
  };

  const handleMonthSelect = (monthIdx) => {
    if (!allowFuture && activeYear === currentYear && monthIdx > currentMonth) return;
    onChange(`${activeYear}-${String(monthIdx + 1).padStart(2, "0")}`);
    handleClose();
  };

  const handlePresent = () => { onChange("Present"); handleClose(); };
  const handleClear = () => { onChange(""); handleClose(); };

  const displayValue = useMemo(() => {
    if (!value) return "";
    if (value === "Present") return "Present";
    if (mode === "year-only") return String(value);
    if (parsed.year && parsed.month) return `${MONTHS[parsed.month - 1]} ${parsed.year}`;
    if (parsed.year) return String(parsed.year);
    return "";
  }, [value, parsed, mode]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={displayValue ? "text-white/90" : "text-white/20"}>{displayValue || placeholder}</span>
        <Calendar size={14} className="text-white/30 flex-shrink-0 ml-2" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 left-0 bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl p-3 w-64">
          {view === "months" && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setView("years")}
                  className="text-sm font-semibold text-white/80 hover:text-indigo-400 transition-colors"
                >
                  {activeYear}
                </button>
                <div className="flex items-center gap-1">
                  {allowPresent && (
                    <button
                      type="button"
                      onClick={handlePresent}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${parsed.isPresent ? "bg-indigo-500/20 text-indigo-400" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}
                    >
                      Present
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs px-2 py-1 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {MONTHS.map((m, idx) => {
                  const isSelected = parsed.year === activeYear && parsed.month === idx + 1;
                  const isCurrent = activeYear === currentYear && idx === currentMonth;
                  const isDisabled = !allowFuture && activeYear === currentYear && idx > currentMonth;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleMonthSelect(idx)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-indigo-500 text-white"
                          : isCurrent
                          ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20"
                          : isDisabled
                          ? "text-white/15 cursor-not-allowed"
                          : "text-white/60 hover:bg-white/10 hover:text-white/90"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {view === "years" && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Select Year</span>
                {mode !== "year-only" && (
                  <button
                    type="button"
                    onClick={() => setView("months")}
                    className="text-xs text-white/40 hover:text-white/70 transition-colors"
                  >
                    Back
                  </button>
                )}
              </div>
              {showSearch && (
                <div className="relative mb-2">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="Search year..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>
              )}
              <div ref={gridRef} className="max-h-48 overflow-y-auto grid grid-cols-3 gap-1">
                {filteredYears.map(y => {
                  const isSelected = (mode === "year-only" && String(value) === String(y)) || (mode !== "year-only" && parsed.year === y);
                  const isCurrent = y === currentYear;
                  return (
                    <button
                      key={y}
                      type="button"
                      data-selected={isSelected}
                      data-current={isCurrent}
                      onClick={() => handleYearSelect(y)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-indigo-500 text-white"
                          : isCurrent
                          ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20"
                          : "text-white/60 hover:bg-white/10 hover:text-white/90"
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
                {filteredYears.length === 0 && (
                  <div className="col-span-3 text-center text-white/30 text-xs py-4">No years found</div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}