import React from "react";
import { motion } from "framer-motion";
import Logo from "@/components/layout/Logo";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen bg-[#08080d] text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <p className="text-white/40 text-xs font-medium tracking-wide mb-6">One Leadership Journey. One AI Platform.</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="text-white/40 text-sm mt-2">{subtitle}</p>}
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-white/30 mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}