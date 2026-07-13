import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Who can apply?",
    a: "EXECLEAD.AI's Founding Private Beta™ is open to ambitious professionals at every career stage — from students and aspiring leaders to experienced executives, founders, and enterprise organizations. We select based on leadership potential, industry diversity, and genuine commitment to growth.",
  },
  {
    q: "How are members selected?",
    a: "Each application is reviewed personally by our team. We evaluate leadership experience, industry background, motivation for joining, and how well your goals align with the platform's capabilities. Approved applicants receive an invitation via email within 3–5 business days.",
  },
  {
    q: "Is payment required today?",
    a: "No. The Founding Private Beta™ is completely free during the beta period. Pricing shown on this page represents future General Availability positioning. Current beta participants are not charged unless explicitly stated.",
  },
  {
    q: "What happens after approval?",
    a: "Once approved, you'll receive an invitation email with onboarding instructions. After activating your account, you'll gain immediate access to the platform's beta capabilities, the exclusive founding member community, and direct channels to our product team.",
  },
  {
    q: "Can enterprise teams apply?",
    a: "Yes. Enterprise teams can request an Enterprise Beta™ through the application form. Select 'Request Enterprise Beta™' and our team will reach out to discuss team onboarding, seat allocation, and enterprise-specific capabilities.",
  },
  {
    q: "Will pricing change after GA?",
    a: "Pricing may be adjusted when EXECLEAD.AI reaches General Availability. However, founding members who are approved and activated during the beta will benefit from locked-in pricing and lifetime founding member benefits as a thank you for their early support.",
  },
];

export default function BetaFAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-5 text-center">Frequently Asked Questions</h3>
      <div className="space-y-2 max-w-2xl mx-auto">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex items-center justify-between w-full px-5 py-4 text-left"
            >
              <span className="text-white text-sm font-medium">{faq.q}</span>
              <ChevronDown
                size={16}
                className={`text-white/40 transition-transform flex-shrink-0 ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-white/50 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}