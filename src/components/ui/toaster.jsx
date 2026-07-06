import React from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastTitle,
  ToastDescription,
  getVariantConfig,
} from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss, pause, resume } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-[100] flex w-full flex-col gap-2 p-4 sm:max-w-[400px]">
      {toasts.map(({ id, title, description, variant, open, action }) => {
        const { Icon, iconClass } = getVariantConfig(variant);
        return (
          <Toast
            key={id}
            variant={variant}
            open={open}
            onMouseEnter={() => pause(id)}
            onMouseLeave={() => resume(id)}
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} />
            <div className="min-w-0 flex-1 pr-6">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
              {action}
            </div>
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        );
      })}
    </div>
  );
}