import React from "react";
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle } from "@/components/ui/drawer";

/**
 * Reusable mobile bottom sheet built on vaul.
 * Renders a polished bottom sheet with safe-area-inset-bottom padding,
 * drag handle, and dark-theme styling matching EXECLEAD.AI.
 * Used to replace dropdown selectors on mobile for a native iOS WebView feel.
 */
export default function MobileBottomSheet({ open, onOpenChange, trigger, title, children }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DrawerTrigger asChild>
          {trigger}
        </DrawerTrigger>
      )}
      <DrawerContent
        className="bg-[#0d0d14] border-white/10"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <DrawerTitle className="sr-only">{title || "Select option"}</DrawerTitle>
        {title && (
          <div className="px-4 py-3 border-b border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{title}</span>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}