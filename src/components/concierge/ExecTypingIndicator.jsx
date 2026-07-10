import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ExecTypingIndicator() {
  return (
    <div className="flex gap-2.5 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Sparkles size={16} className="text-white" />
      </div>
      <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-4 py-4 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground/60"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}