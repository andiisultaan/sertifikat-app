import { createToaster } from "@ark-ui/react/toast";

export const toaster = createToaster({
  placement: "top-end",
  gap: 12,
  overlap: false,
});

export function toast(options: {
  title: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
}) {
  toaster.create({
    title: options.title,
    description: options.description,
    type: options.type ?? "info",
  });
}

toast.success = (title: string, description?: string) =>
  toaster.create({ title, description, type: "success" });

toast.error = (title: string, description?: string) =>
  toaster.create({ title, description, type: "error" });

toast.warning = (title: string, description?: string) =>
  toaster.create({ title, description, type: "warning" });

toast.info = (title: string, description?: string) =>
  toaster.create({ title, description, type: "info" });

/** Show a confirmation toast with Konfirmasi/Batal buttons */
export function confirmToast(options: {
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmLabel?: string;
}) {
  toaster.create({
    title: options.title,
    description: options.description,
    type: "info",
    meta: {
      onConfirm: options.onConfirm,
      confirmLabel: options.confirmLabel ?? "Hapus",
      isConfirm: true,
    },
  });
}
