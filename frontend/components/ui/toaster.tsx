"use client";

import { Toast, Toaster as ArkToaster } from "@ark-ui/react/toast";
import { Portal } from "@ark-ui/react/portal";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X, Trash2 } from "lucide-react";

import { toaster } from "@/lib/toast";
import { cn } from "@/lib/utils";

const typeConfig = {
  success: {
    icon: CheckCircle,
    className: "border-l-4 border-green-500 bg-green-50 text-green-900",
    iconClassName: "text-green-500",
  },
  error: {
    icon: AlertCircle,
    className: "border-l-4 border-red-500 bg-red-50 text-red-900",
    iconClassName: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-l-4 border-yellow-500 bg-yellow-50 text-yellow-900",
    iconClassName: "text-yellow-500",
  },
  info: {
    icon: Info,
    className: "border-l-4 border-blue-500 bg-blue-50 text-blue-900",
    iconClassName: "text-blue-500",
  },
};

export function Toaster() {
  return (
    <Portal>
      <ArkToaster toaster={toaster}>
        {(toast) => {
          const type = (toast.type as keyof typeof typeConfig) ?? "info";
          const config = typeConfig[type] ?? typeConfig.info;
          const Icon = config.icon;
          const isConfirm = toast.meta?.isConfirm as boolean | undefined;
          const onConfirm = toast.meta?.onConfirm as (() => void) | undefined;
          const confirmLabel = (toast.meta?.confirmLabel as string) ?? "Hapus";

          return (
            <Toast.Root
              className={cn(
                "min-w-80 max-w-sm rounded-lg shadow-lg p-4 relative",
                "transition-all duration-300 will-change-transform",
                "h-(--height) opacity-(--opacity) translate-x-(--x) translate-y-(--y) scale-(--scale) z-(--z-index)",
                isConfirm
                  ? "bg-white border border-gray-200 text-gray-900"
                  : config.className,
              )}
            >
              <div className="flex items-start gap-3 pr-6">
                {!isConfirm && (
                  <Icon className={cn("size-4 mt-0.5 shrink-0", config.iconClassName)} />
                )}
                <div className="flex-1 min-w-0">
                  <Toast.Title className="font-semibold text-sm leading-snug">
                    {toast.title}
                  </Toast.Title>
                  {toast.description && (
                    <Toast.Description className="text-xs mt-0.5 opacity-80">
                      {toast.description}
                    </Toast.Description>
                  )}

                  {isConfirm && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          onConfirm?.();
                          toaster.dismiss(toast.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="size-3" />
                        {confirmLabel}
                      </button>
                      <button
                        onClick={() => toaster.dismiss(toast.id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Toast.CloseTrigger className="absolute top-3 right-3 p-0.5 rounded hover:bg-black/10 transition-colors opacity-50 hover:opacity-100">
                <X className="size-3.5" />
              </Toast.CloseTrigger>
            </Toast.Root>
          );
        }}
      </ArkToaster>
    </Portal>
  );
}
