import * as React from "react";
import { cva } from "class-variance-authority";
import { X, CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const VARIANTS = {
  default: { accent: "bg-white/25", Icon: Info, iconClass: "text-white/60" },
  success: { accent: "bg-emerald-500", Icon: CheckCircle2, iconClass: "text-emerald-400" },
  info: { accent: "bg-blue-500", Icon: Info, iconClass: "text-blue-400" },
  information: { accent: "bg-blue-500", Icon: Info, iconClass: "text-blue-400" },
  warning: { accent: "bg-orange-500", Icon: AlertTriangle, iconClass: "text-orange-400" },
  error: { accent: "bg-red-500", Icon: XCircle, iconClass: "text-red-400" },
  destructive: { accent: "bg-red-500", Icon: XCircle, iconClass: "text-red-400" },
};

export function getVariantConfig(variant) {
  return VARIANTS[variant] || VARIANTS.default;
}

export const ToastProvider = ({ children }) => <>{children}</>;

export const ToastViewport = React.forwardRef((props, ref) => null);
ToastViewport.displayName = "ToastViewport";

export const Toast = React.forwardRef(({ className, variant = "default", open = true, onMouseEnter, onMouseLeave, children, ...props }, ref) => {
  const isError = variant === "error" || variant === "destructive";
  return (
    <div
      ref={ref}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border border-white/10 bg-[#16161f]/95 backdrop-blur-xl p-4 pl-5 shadow-2xl",
        open ? "animate-toast-show" : "animate-toast-hide",
        className
      )}
      {...props}
    >
      <div className={cn("absolute left-0 top-0 h-full w-1", getVariantConfig(variant).accent)} />
      {children}
    </div>
  );
});
Toast.displayName = "Toast";

export const ToastClose = React.forwardRef(({ className, onClick, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label="Dismiss notification"
    onClick={onClick}
    className={cn(
      "absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-0",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
));
ToastClose.displayName = "ToastClose";

export const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm font-semibold text-white", className)} {...props} />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-white/60 leading-relaxed", className)} {...props} />
));
ToastDescription.displayName = "ToastDescription";

export const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "mt-2 inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-transparent px-2.5 text-xs font-medium text-white/70 hover:bg-white/10 transition-colors",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export const toastVariants = cva("", {
  variants: { variant: { default: "", success: "", info: "", warning: "", error: "", destructive: "" } },
  defaultVariants: { variant: "default" },
});