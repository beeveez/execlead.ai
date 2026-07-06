import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/pricingContent";

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className={`text-sm font-medium transition-colors ${isOpen ? "text-indigo-400" : "text-white/70 group-hover:text-white/90"}`}>
          {item.q}
        </span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 transition-all ${isOpen ? "text-indigo-400 rotate-180" : "text-white/30"}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-white/40 text-sm leading-relaxed pb-5 pr-8">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-6">
        {FAQ_ITEMS.map((item, i) => (
          <FaqItem
            key={i}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </div>
  );
}