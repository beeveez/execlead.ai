import React from "react";
import KeepAliveOutlet from "@/components/KeepAliveOutlet";

/**
 * PageTransition — wraps the routed Outlet. Core tab pages (Dashboard,
 * Coach, Academy, Profile) are kept alive in the DOM via KeepAliveOutlet;
 * all other pages use the animated slide transition.
 */
export default function PageTransition() {
  return <KeepAliveOutlet />;
}