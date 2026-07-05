import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

const VISIBLE_COUNT = 5;

export default function ExpandableFeatureList({ features }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? features : features.slice(0, VISIBLE_COUNT);
  const remaining = features.length - VISIBLE_COUNT;
  const hasMore = remaining > 0;

  return (
    <div>
      <ul className="space-y-1.5 mb-3">
        {visible.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-white/50">
            <Check size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <AnimatePresence initial={false}>
        {hasMore && (
          <motion.button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? `Show fewer features` : `Show ${remaining} more features`}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {expanded ? (
              <>
                <ChevronUp size={12} /> Show Less
              </>
            ) : (
              <>
                <ChevronDown size={12} /> Show {remaining} More {remaining === 1 ? "Feature" : "Features"}
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}