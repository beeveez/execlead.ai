import React from "react";
import MarketingNav from "./MarketingNav";
import MarketingFooter from "./MarketingFooter";

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#08080d] text-white overflow-x-hidden">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}