export function captureDiagnostics(user, profile, subscription) {
  const nav = navigator;
  const ua = nav.userAgent || "";

  let browser = "Unknown";
  if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  let device = "Desktop";
  if (ua.includes("iPhone") || ua.includes("Android")) device = "Mobile";
  else if (ua.includes("iPad")) device = "Tablet";

  return {
    current_url: window.location.href,
    current_route: window.location.pathname,
    page: document.title,
    user_id: user?.id || null,
    user_email: user?.email || null,
    timestamp: new Date().toISOString(),
    app_version: "4.0",
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    organization_id: profile?.organization_id || null,
    subscription_plan: profile?.subscription_plan || "free",
    user_role: user?.role || "customer",
    browser,
    operating_system: os,
    device,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: nav.language,
    online: nav.onLine,
    cookies_enabled: nav.cookieEnabled,
  };
}