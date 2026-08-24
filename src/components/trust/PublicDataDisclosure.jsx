import React from "react";
import { Link } from "react-router-dom";

const CORE_DATA = [
  "Profile and career information",
  "Assessment responses and leadership activity",
  "AI coaching conversations",
  "Professional materials you choose to upload",
  "Billing information when applicable",
];

export default function PublicDataDisclosure() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="text-sm font-semibold text-white">Information used by the core platform</h3>
        <ul className="mt-3 space-y-2 text-xs text-white/55">
          {CORE_DATA.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="text-sm font-semibold text-white">Professional account access</h3>
        <p className="mt-3 text-xs leading-6 text-white/55">Core leadership development does not require access to unrelated professional accounts. Any supported third-party integration is optional and requires separate authorization.</p>
        <Link to="/legal#privacy-policy" className="mt-4 inline-block text-xs font-medium text-indigo-300 hover:text-indigo-200">Read the Privacy Policy</Link>
      </div>
    </div>
  );
}