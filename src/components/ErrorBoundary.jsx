import React from "react";
import { AlertTriangle, RefreshCw, Copy, ChevronDown, ChevronUp, Bug } from "lucide-react";

/**
 * Enhanced Error Boundary — displays the actual runtime exception
 * instead of hiding it behind a generic "Something went wrong" page.
 *
 * Shows: error message, stack trace, component stack, and provides
 * copy-to-clipboard for fast debugging.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Runtime exception caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleCopy = () => {
    const { error, errorInfo } = this.state;
    const text = [
      `Error: ${error?.message || String(error)}`,
      ``,
      `Stack Trace:`,
      error?.stack || "N/A",
      ``,
      `Component Stack:`,
      errorInfo?.componentStack || "N/A",
    ].join("\n");
    try {
      navigator.clipboard?.writeText(text);
    } catch {}
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, errorInfo, showDetails } = this.state;
    const errorName = error?.name || "Error";
    const errorMessage = error?.message || "An unexpected error occurred.";

    // Try to extract component name and file from the stack
    const stackLines = (error?.stack || "").split("\n");
    const firstUserFrame = stackLines.find((l) => l.includes(".jsx") || l.includes(".js")) || "";
    const componentStack = errorInfo?.componentStack || "";
    const firstComponent = componentStack.split("\n").find((l) => l.trim()) || "";

    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center p-6 overflow-auto">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Bug className="text-red-400" size={28} />
            </div>
            <div className="text-red-400 text-xs font-mono uppercase tracking-widest mb-2">{errorName}</div>
            <h1 className="text-xl font-bold text-white mb-2">Runtime Exception</h1>
            <p className="text-white/50 text-sm mb-1 break-words font-mono">{errorMessage}</p>
            {firstComponent && (
              <p className="text-white/30 text-xs mt-1 font-mono">{firstComponent.trim()}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <RefreshCw size={14} /> Refresh Page
            </button>
            <button
              onClick={() => this.setState({ showDetails: !showDetails })}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showDetails ? "Hide" : "Show"} Details
            </button>
            <button
              onClick={this.handleCopy}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Copy size={14} /> Copy Error
            </button>
          </div>

          {showDetails && (
            <div className="space-y-3">
              {stackLines.length > 0 && (
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 overflow-auto max-h-64">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2 font-semibold">Stack Trace</div>
                  <pre className="text-xs text-red-400/80 whitespace-pre-wrap font-mono break-all">
                    {error?.stack || String(error)}
                  </pre>
                </div>
              )}
              {componentStack && (
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 overflow-auto max-h-64">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2 font-semibold">Component Stack</div>
                  <pre className="text-xs text-white/50 whitespace-pre-wrap font-mono">
                    {componentStack}
                  </pre>
                </div>
              )}
              {firstUserFrame && (
                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2 font-semibold">Likely Source</div>
                  <p className="text-xs text-amber-400/80 font-mono break-all">{firstUserFrame.trim()}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}