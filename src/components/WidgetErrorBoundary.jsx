import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Widget Error Boundary — isolates individual widget failures.
 *
 * Wrap each section/widget so one failure never crashes the entire page.
 * Shows a compact inline error with a Retry button.
 */
export default class WidgetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[WidgetErrorBoundary:${this.props.name}]`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { name } = this.props;
      return (
        <div className="bg-red-500/[0.03] border border-red-500/10 rounded-xl p-6 text-center">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="text-red-400/60" size={18} />
          </div>
          <p className="text-white/60 text-sm font-medium">
            {name || "Widget"} failed to load
          </p>
          <p className="text-white/30 text-xs mt-1 mb-3 font-mono break-words max-w-md mx-auto">
            {this.state.error?.message || String(this.state.error)}
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-medium transition-all"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}