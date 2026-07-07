import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Building2, Users, Package, Brain, Mail, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function ActivationSuccess({ quote, organization, breakdown }) {
  const provisions = [
    { icon: Building2, label: "Organization Created", value: organization?.name || quote.organization_name },
    { icon: Users, label: "Seats Allocated", value: `${breakdown?.seats || quote.expected_active_users || 0} seats` },
    { icon: Package, label: "Modules Enabled", value: `${breakdown?.selectedModules?.length || 0} module(s)` },
    { icon: Brain, label: "AI Package", value: breakdown?.aiPackage?.name || "Standard" },
    { icon: Mail, label: "Welcome Email Sent", value: quote.customer_email || "—" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 size={40} className="text-emerald-400" />
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-2">Welcome to EXECLEAD Enterprise</h2>
        <p className="text-white/50 text-sm mb-6">
          Your organization <span className="text-white/70 font-medium">{quote.organization_name}</span> has been created.
          Your enterprise workspace is provisioned and ready.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
          {provisions.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <p.icon size={14} className="text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-white/30 uppercase tracking-wider">{p.label}</div>
                <div className="text-sm text-white/70 truncate">{p.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 mb-6 text-left">
          <h3 className="text-sm font-semibold text-white mb-1">Next Steps</h3>
          <p className="text-white/40 text-xs mb-4">Complete these steps to set up your organization:</p>
          <div className="space-y-1.5">
            {[
              { label: "Invite Team Members", path: `/portal/${quote.id}` },
              { label: "Configure SSO", path: "/sso" },
              { label: "Assign Seats", path: "/succession-planning" },
              { label: "Create Departments", path: "/hr-dashboard" },
              { label: "Launch Leadership Academy", path: "/academy" },
            ].map((step, i) => (
              <Link key={i} to={step.path} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                </div>
                <span className="text-sm text-white/60 group-hover:text-white/80">{step.label}</span>
                <ArrowRight size={12} className="ml-auto text-white/20 group-hover:text-white/40" />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/enterprise"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
          >
            <Building2 size={16} /> Enter Enterprise Dashboard
            <ArrowRight size={14} />
          </Link>
          <Link
            to={`/portal/${quote.id}`}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
          >
            <Sparkles size={16} /> Access Customer Portal
            <ArrowRight size={14} />
          </Link>
          {quote.contract_url && (
            <a
              href={quote.contract_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
            >
              Download Contract
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}