import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, FileCheck, UserCheck, Mail, UserPlus, Crown } from "lucide-react";
import BetaApplicationForm from "@/components/beta/BetaApplicationForm";

const STATUS_STEPS = [
  { icon: ClipboardList, label: "Applied", desc: "Application submitted" },
  { icon: FileCheck, label: "Under Review", desc: "Team reviewing your profile" },
  { icon: UserCheck, label: "Approved", desc: "You've been selected" },
  { icon: Mail, label: "Invitation Sent", desc: "Check your email" },
  { icon: UserPlus, label: "Activated", desc: "Account created" },
  { icon: Crown, label: "Founding Member", desc: "Lifetime benefits unlocked" },
];

export default function ApplicationFlow() {
  return (
    <div id="beta-apply" className="scroll-mt-20 space-y-8">
      {/* Status Timeline */}
      <div>
        <h3 className="text-white font-semibold text-lg mb-2">Application Status</h3>
        <p className="text-white/40 text-sm mb-6">Every applicant moves through these stages:</p>
        <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-0">
          {STATUS_STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex-1 flex flex-col items-center text-center px-3 py-4 bg-white/[0.03] border border-white/5 rounded-xl md:rounded-l-none md:border-l-0"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2">
                  <step.icon size={16} className="text-amber-400" />
                </div>
                <div className="text-white text-xs font-medium">{step.label}</div>
                <div className="text-white/30 text-[10px] mt-0.5">{step.desc}</div>
              </motion.div>
              {i < STATUS_STEPS.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-1">
                  <div className="w-4 h-px bg-amber-500/20" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Application Form */}
      <div className="bg-amber-500/[0.04] border border-amber-500/15 rounded-2xl p-6 md:p-8">
        <div className="text-center mb-6">
          <h3 className="text-white font-bold text-xl mb-1">Apply for Founding Private Beta™</h3>
          <p className="text-white/40 text-sm">Fill out the form below. Our team reviews each application personally.</p>
        </div>
        <BetaApplicationForm defaultTier="founding_beta" />
      </div>
    </div>
  );
}