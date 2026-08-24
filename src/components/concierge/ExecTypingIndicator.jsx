import React from "react";
import { motion } from "framer-motion";
import ExecConciergeBadge from "./ExecConciergeBadge";

export default function ExecTypingIndicator() {
  return (
    <div className="flex gap-2.5 justify-start">
      <ExecConciergeBadge />
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