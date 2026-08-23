import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Menu, X, Crown } from "lucide-react";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import WorkspaceSwitcher from "@/components/layout/WorkspaceSwitcher";
import ShareButton from "@/components/social/ShareButton";
import Logo from "@/components/layout/Logo";

// Bottom-nav tab roots — these are NOT "deep" pages (no Back button).
const BOTTOM_NAV_PATHS = ["/home", "/dashboard", "/academy", "/network", "/profile"];

const ROUTE_TITLES = {
  "/dashboard": "Home",
  "/coach": "Coach",
  "/network": "Network",
  "/settings": "Settings",
  "/academy": "Academy",
  "/companies": "Companies",
  "/companies/compare": "Compare",
  "/career": "Career",
  "/career-studio": "Career Studio",
  "/resume": "Resume Intelligence",
  "/metrics": "Metrics",
  "/analytics": "Analytics",
  "/journal": "Journal",
  "/profile": "Profile",
  "/billing": "Billing",
  "/organization/billing": "Org Billing",
  "/notifications": "Notifications",
  "/marketplace": "Marketplace",
  "/challenge": "Daily Challenge",
  "/simulator": "Simulator",
  "/debate": "Debate",
  "/council": "Executive Council",
  "/leadership-dna": "Leadership DNA",
  "/executive-legacy": "Executive Legacy",
  "/enterprise": "Enterprise",
  "/enterprise/chro-dashboard": "CHRO Dashboard",
  "/enterprise/talent-analytics": "Talent Analytics",
  "/enterprise/promotion-forecasts": "Promotion Forecasts",
  "/enterprise/succession": "Succession Intelligence",
  "/enterprise/high-potential": "High-Potential Watchlist",
  "/hr-dashboard": "HR Dashboard",
  "/succession-planning": "Succession",
  "/promotion-readiness": "Promotion Readiness",
  "/learning-assignments": "Learning",
  "/sso": "SSO Identity",
  "/ai-command-center": "AI Command Center",
  "/ai-usage": "AI Usage",
  "/wallet": "Wallet",
  "/referrals": "Referrals",
  "/compare-plans": "Compare Plans",
  "/security": "Security",
  "/connected-accounts": "Connected Accounts",
  "/concierge": "Concierge",
  "/feedback": "Feedback",
  "/brand-center": "Brand Center",
  "/executive/rankings": "Rankings",
  "/guardian": "Guardian",
  "/founder": "Founder Portal",
  "/founder/benefits": "Benefits",
  "/founder/community": "Community",
  "/founder/events": "Events",
  "/founder/roadmap": "Roadmap",
  "/founder/referrals": "Referrals",
  "/founder/rewards": "Rewards",
  "/founder/certificates": "Certificates",
  "/founder/timeline": "Timeline",
  "/founder/settings": "Settings",
  "/network/directory": "Directory",
  "/network/discussions": "Discussions",
  "/network/circles": "Circles",
  "/network/events": "Events",
  "/network/mentorship": "Mentorship",
  "/network/careers": "Careers",
  "/network/partnerships": "Partnerships",
  "/network/founding-lounge": "Founding Lounge",
  "/network/c": "Community",
  "/developer": "Developer",
  "/developer/product": "Product",
  "/developer/audit-logs": "Audit Logs",
  "/developer/system-health": "System Health",
  "/developer/api-keys": "API Keys",
  "/developer/database": "Database",
  "/developer/migrations": "Migrations",
  "/developer/deployments": "Deployments",
  "/developer/organizations": "Organizations",
  "/cpq": "CPQ",
  "/cpq-dashboard": "CPQ Dashboard",
  "/cpq/quotes": "My Quotes",
  "/company-admin": "Company Admin",
  "/email-settings": "Email Settings",
  "/organization/users": "Users",
  "/portal": "Portal",
};

function deriveTitle(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  const segments = pathname.split("/").filter(Boolean);
  // Try progressively shorter prefixes (handles dynamic sub-pages like /academy/:slug)
  for (let i = segments.length; i >= 1; i--) {
    const prefix = "/" + segments.slice(0, i).join("/");
    if (ROUTE_TITLES[prefix]) return ROUTE_TITLES[prefix];
  }
  // Fallback: capitalize first segment, replace hyphens
  if (segments.length > 0) {
    const first = segments[0].replace(/-/g, " ");
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
  return "Home";
}

export default function MobileHeader({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscription, loading: loadingSub } = useSubscription();
  const { activeWorkspace } = useWorkspace();

  const pathname = location.pathname;
  const isDeepPage = !BOTTOM_NAV_PATHS.includes(pathname);
  const title = deriveTitle(pathname);

  return (
    <header
      className="mobile-header md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0d0d14]/95 backdrop-blur-xl border-b border-white/5"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {isDeepPage ? (
            <>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-11 h-11 -ml-1 text-white/70 hover:text-white transition-colors flex-shrink-0"
                aria-label="Go back"
              >
                <ChevronLeft size={22} />
              </button>
              <h1 className="text-base font-semibold text-white truncate">{title}</h1>
            </>
          ) : (
            <Logo size="sm" />
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <WorkspaceSwitcher compact />
          <Link
            to={activeWorkspace === "enterprise" ? "/organization/billing" : "/billing"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 min-h-[44px]"
          >
            {loadingSub ? (
              <span className="text-xs text-white/20">···</span>
            ) : activeWorkspace === "enterprise" ? (
              <span className="text-xs font-medium text-cyan-400">Enterprise</span>
            ) : (
              <>
                <span className="text-xs">{subscription.icon}</span>
                <span className="text-xs font-medium" style={{ color: subscription.color }}>
                  {subscription.planName}
                </span>
              </>
            )}
          </Link>
          <Link to="/brand-center" className="text-white/60 p-2 tap-target flex items-center justify-center">
            <Crown size={18} className="text-amber-400" />
          </Link>
          <ShareButton variant="icon" shareType="landing" iconSize={16} />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white/60 p-2 tap-target flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}