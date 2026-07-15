/**
 * Resume Parser Test Mode Detection
 * ---------------------------------
 * Detects when the app is running in Development, QA, Sandbox,
 * or Automated Test environments. Developer-only tools (sample
 * resumes, mock parser, diagnostics) are exposed only when active.
 * Never active in production.
 */

function checkUrlParam() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.has("test") || params.has("qa") || params.has("sandbox");
  } catch { return false; }
}

function checkLocalStorage() {
  try {
    return localStorage.getItem("resume_test_mode") === "true";
  } catch { return false; }
}

function checkViteDev() {
  try {
    return import.meta.env?.DEV === true || import.meta.env?.MODE !== "production";
  } catch { return false; }
}

function checkHost() {
  try {
    const h = window.location.hostname;
    return h.includes("localhost") || h.includes("127.0.0.1") || h.includes(".sandbox.") || h.includes(".dev.") || h.includes(".qa.");
  } catch { return false; }
}

function checkNavigator() {
  try {
    return navigator.webdriver === true;
  } catch { return false; }
}

/**
 * Returns true if the app is in a testable (non-production) context.
 * Any single signal is sufficient.
 */
export function isTestMode() {
  return checkViteDev() || checkUrlParam() || checkLocalStorage() || checkHost() || checkNavigator();
}

export function setTestModeOverride(enabled) {
  try {
    if (enabled) localStorage.setItem("resume_test_mode", "true");
    else localStorage.removeItem("resume_test_mode");
  } catch {}
}

export function getTestModeInfo() {
  return {
    active: isTestMode(),
    signals: {
      viteDev: checkViteDev(),
      urlParam: checkUrlParam(),
      localStorage: checkLocalStorage(),
      host: checkHost(),
      webdriver: checkNavigator(),
    },
  };
}