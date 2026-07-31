import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, ArrowRight } from "lucide-react";

export default function LandingBetaCTA({ authed }) {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="relative rounded-3xl bg-gradient-to-br from-accent-orange/12 via-amber-500/[0.06] to-transparent border border-accent-orange/25 p-8 md:p-12 text-center overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-orange/15 border border-accent-orange/30 rounded-full text-[11px] text-accent-orange font-semibold mb-4">
            <Rocket size={12} /> FOUNDING PRIVATE BETA™ · Invitation Only
          </div>
          <h2 className="text-2xl md:text-4xl font-bold mb-3">Why Join Now?</h2>
          <p className="text-white/55 max-w-xl mx-auto mb-6 text-sm md:text-base leading-relaxed">
            Founding Members lock in lifetime pricing, shape the platform's direction, and receive priority access
            to every new executive capability. Spots are limited.
          </p>
          <Link to={authed ? "/assessment" : "/beta"} className="inline-flex items-center gap-2 bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25">
            {authed ? "Take the Assessment" : "Apply for Private Beta™"} <ArrowRight size={17} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}