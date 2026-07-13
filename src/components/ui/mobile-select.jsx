import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle,
} from "@/components/ui/drawer";
import { Check, ChevronDown } from "lucide-react";

/**
 * MobileSelect — responsive select that uses a vaul bottom-sheet Drawer
 * on mobile and a native <select> on desktop. Drop-in replacement that
 * accepts options as [{value, label}] and calls onChange with a synthetic
 * { target: { value } } event for backward compatibility with native handlers.
 */
export default function MobileSelect({ options, value, onChange, placeholder, className }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (!isMobile) {
    return (
      <select value={value} onChange={onChange} className={className}>
        {placeholder && <option value="" className="bg-[#0d0d14]">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0d0d14]">{opt.label}</option>
        ))}
      </select>
    );
  }

  const selected = options.find((o) => o.value === value);
  const handleSelect = (val) => {
    onChange({ target: { value: val } });
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className={`${className} text-left flex items-center justify-between`}
        >
          <span className={selected ? "text-white" : "text-white/20"}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-[#0d0d14] border-white/10">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-sm text-white">{placeholder || "Select an option"}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] max-h-[50vh] overflow-y-auto space-y-1">
          {placeholder && (
            <button
              type="button"
              onClick={() => handleSelect("")}
              className="flex items-center w-full min-h-[44px] px-3 py-2.5 rounded-lg text-sm text-left text-white/40 hover:bg-white/5 transition-colors"
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className="flex items-center justify-between w-full min-h-[44px] px-3 py-2.5 rounded-lg text-sm text-left text-white hover:bg-white/5 transition-colors"
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check className="h-4 w-4 text-indigo-400 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}