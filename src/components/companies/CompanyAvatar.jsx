import React from "react";
import CompanyLogo from "@/components/companies/CompanyLogo";

export default function CompanyAvatar({ company, size = "md", className = "" }) {
  return <CompanyLogo company={company} size={size} className={className} />;
}