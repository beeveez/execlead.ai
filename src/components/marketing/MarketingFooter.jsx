import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/layout/Logo";
import { LEGAL_STATUS } from "@/lib/legalCompliance";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <Link to="/"><Logo aiTagClass="ml-1" /></Link>
            <p className="text-white/50 text-sm font-medium mt-2">One Leadership Journey. One AI Platform.</p>
            <p className="text-white/25 text-xs mt-1">Developing executive leaders through AI-powered coaching, assessments, simulations, reputation, and lifelong learning.</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link to="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
            <a href="/#features" className="hover:text-white/60 transition-colors">Features</a>
            <Link to="/about" className="hover:text-white/60 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
            <Link to="/trust-center" className="hover:text-white/60 transition-colors">Trust Center</Link>
            <Link to="/login" className="hover:text-white/60 transition-colors">Sign In</Link>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/25 mb-4">
            <Link to="/legal#legal-notice" className="hover:text-white/50 transition-colors">Legal Notice</Link>
            <Link to="/legal#trademark-notice" className="hover:text-white/50 transition-colors">Trademark Notice</Link>
            <Link to="/legal#copyright-policy" className="hover:text-white/50 transition-colors">Copyright Policy</Link>
            <Link to="/legal#dmca-policy" className="hover:text-white/50 transition-colors">DMCA Policy</Link>
            <Link to="/legal#fair-use" className="hover:text-white/50 transition-colors">Fair Use Statement</Link>
            <Link to="/legal#privacy-policy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
            <Link to="/legal#terms-of-service" className="hover:text-white/50 transition-colors">Terms of Service</Link>
            <Link to="/legal#report" className="hover:text-white/50 transition-colors">Report Incorrect Information</Link>
            <Link to="/legal#claim" className="hover:text-white/50 transition-colors">Claim Company Profile</Link>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 text-center text-white/20 text-xs space-y-1">
          <p className="text-white/30 font-medium">EXECLEAD.AI Early Access</p>
          <p className="text-white/20">Powered by Base44 during our beta phase.</p>
          <p className="text-white/25">Official custom domain coming soon.</p>
          <p className="pt-2 mt-2 border-t border-white/5">{LEGAL_STATUS.copyright}</p>
          <p className="text-white/20">{LEGAL_STATUS.description}</p>
          <p className="text-white/15">{LEGAL_STATUS.trademark}</p>
        </div>
      </div>
    </footer>
  );
}