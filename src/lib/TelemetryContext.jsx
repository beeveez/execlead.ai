/**
 * TelemetryProvider — wraps the app and auto-captures:
 *   • Navigation events (route changes)
 *   • Errors (window.onerror + unhandled rejections)
 *   • Platform events (repairs, verifications, deployments)
 *   • Session duration (login → logout)
 *   • Workspace changes
 *
 * Exposes useTelemetry() hook for components to track custom events.
 */
import React, { createContext, useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  track, initTelemetry, setTelemetryEnabled, getTelemetryConsent,
} from "./telemetryEngine";
import { subscribeAll } from "./platformEventBus";
import { useAuth } from "./AuthContext";
import { useWorkspace } from "./WorkspaceContext";

const TelemetryContext = createContext(null);

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  return ctx || { track: () => {} };
}

function deriveModuleFromPath(path) {
  if (path.startsWith("/coach")) return "coach";
  if (path.startsWith("/simulator")) return "simulator";
  if (path.startsWith("/challenge")) return "challenge";
  if (path.startsWith("/debate")) return "debate";
  if (path.startsWith("/academy")) return "academy";
  if (path.startsWith("/companies")) return "companies";
  if (path.startsWith("/career")) return "career";
  if (path.startsWith("/resume")) return "resume";
  if (path.startsWith("/council")) return "council";
  if (path.startsWith("/legacy")) return "legacy";
  if (path.startsWith("/developer")) return "other";
  if (path.startsWith("/enterprise")) return "other";
  return "other";
}

export function TelemetryProvider({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const lastPath = useRef(null);
  const sessionStart = useRef(Date.now());

  useEffect(() => {
    setTelemetryEnabled(!!user);
    if (user && getTelemetryConsent()) {
      initTelemetry();
      track("login", { module: "other", status: "info" });
    }
  }, [user]);

  useEffect(() => {
    if (!user || !getTelemetryConsent()) return;
    if (lastPath.current !== null && lastPath.current !== location.pathname) {
      track("navigation", {
        page_path: location.pathname,
        module: deriveModuleFromPath(location.pathname),
        workspace: activeWorkspace,
      });
    }
    lastPath.current = location.pathname;
  }, [location.pathname, user, activeWorkspace]);

  useEffect(() => {
    if (!user || !getTelemetryConsent() || !activeWorkspace) return;
    track("workspace_change", { workspace: activeWorkspace, page_path: location.pathname });
  }, [activeWorkspace, user]);

  useEffect(() => {
    if (!user || !getTelemetryConsent()) return;
    const unsub = subscribeAll((eventName, payload) => {
      if (eventName === "SelfHealingCompleted") {
        track("repair", { module: "guardian", status: "success", ...payload });
      } else if (eventName === "GuardianCompleted") {
        track("verification", { module: "guardian", status: "info" });
      } else if (eventName === "DeploymentCompleted") {
        track("report_generation", { module: "developer", status: "info" });
      } else if (eventName === "RegistrySynchronizationCompleted") {
        track("verification", { module: "developer", status: "info" });
      }
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    const handleError = (event) => {
      track("error", {
        module: "other",
        page_path: window.location.pathname,
        status: "error",
        message: event.message?.substring(0, 500),
        filename: event.filename?.substring(0, 200),
        lineno: event.lineno,
      });
    };
    const handleRejection = (event) => {
      track("error", {
        module: "other",
        page_path: window.location.pathname,
        status: "error",
        reason: String(event.reason)?.substring(0, 500),
      });
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (user) {
        const duration = Date.now() - sessionStart.current;
        track("session_duration", { duration_ms: duration, status: "info" });
        track("logout", { module: "other", status: "info" });
      }
    };
  }, [user]);

  return (
    <TelemetryContext.Provider value={{ track }}>
      {children}
    </TelemetryContext.Provider>
  );
}