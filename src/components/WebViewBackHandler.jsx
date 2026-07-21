import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * WebViewBackHandler — listens for the native Android hardware back button
 * ('backbutton' event from Cordova/Capacitor WebView). If there is history
 * to go back to in the react-router stack, navigates back; otherwise exits
 * the application. No-op in a regular browser (event never fires).
 */
export default function WebViewBackHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);
  navigateRef.current = navigate;
  locationRef.current = location;

  useEffect(() => {
    const onBackButton = (e) => {
      e.preventDefault();

      // If we have history to go back to, navigate back in the router
      if (window.history.length > 1) {
        navigateRef.current(-1);
      } else {
        // No history — exit the native app
        if (window.navigator?.app?.exitApp) {
          window.navigator.app.exitApp();
        } else if (window.Capacitor?.App?.exitApp) {
          window.Capacitor.App.exitApp();
        }
      }
    };

    document.addEventListener("backbutton", onBackButton, false);
    return () => document.removeEventListener("backbutton", onBackButton, false);
  }, []);

  return null;
}