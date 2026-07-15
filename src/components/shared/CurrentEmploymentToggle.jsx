import React from "react";
import MonthYearPicker from "@/components/shared/MonthYearPicker";

/**
 * CurrentEmploymentToggle™
 *
 * Reusable End Date + "I currently work here" checkbox combo.
 *
 * When checked:
 *   - Disables the End Date picker
 *   - Clears any existing End Date
 *   - Displays "Present" inside the End Date field
 *   - Saves isCurrentEmployer = true, endDate = null
 *
 * Props:
 *   isCurrentEmployer — boolean
 *   endDate           — "YYYY-MM" string or ""
 *   startDate         — "YYYY-MM" string (for validation)
 *   onChange          — ({ isCurrentEmployer, endDate }) => void
 *   label             — string (default "End Date")
 */
export default function CurrentEmploymentToggle({
  isCurrentEmployer = false,
  endDate = "",
  startDate = "",
  onChange,
  label = "End Date",
}) {
  const handleToggle = (checked) => {
    if (checked) {
      onChange({ isCurrentEmployer: true, endDate: "" });
    } else {
      onChange({ isCurrentEmployer: false, endDate: "" });
    }
  };

  const handleEndDateChange = (val) => {
    onChange({ isCurrentEmployer: false, endDate: val });
  };

  // Validation: detect end date earlier than start date
  const isEndBeforeStart = () => {
    if (!endDate || !startDate) return false;
    const [sy, sm] = startDate.split("-").map(Number);
    const [ey, em] = endDate.split("-").map(Number);
    if (ey < sy) return true;
    if (ey === sy && em < sm) return true;
    return false;
  };

  const showRequiredError = !isCurrentEmployer && !endDate;
  const showOrderError = !isCurrentEmployer && isEndBeforeStart();

  return (
    <div>
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">{label}</label>
      <MonthYearPicker
        value={isCurrentEmployer ? "Present" : endDate}
        onChange={handleEndDateChange}
        disabled={isCurrentEmployer}
        placeholder="End date"
      />
      {showOrderError && (
        <p className="text-red-400 text-[11px] mt-1">End date cannot be before start date.</p>
      )}
      {showRequiredError && (
        <p className="text-amber-400/70 text-[11px] mt-1">Select an end date or check "I currently work here."</p>
      )}
      <label className="flex items-center gap-2 text-sm text-white/60 mt-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isCurrentEmployer}
          onChange={e => handleToggle(e.target.checked)}
          className="rounded border-white/20"
        />
        I currently work here
      </label>
    </div>
  );
}