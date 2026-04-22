"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound } from "lucide-react";
import { useChangePassword } from "@/lib/hooks/useAuth";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const schema = z
  .object({
    current_password: z.string().min(1, "Password lama wajib diisi."),
    new_password: z.string().min(8, "Password baru minimal 8 karakter."),
    new_password_confirmation: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine(d => d.new_password === d.new_password_confirmation, {
    message: "Konfirmasi password tidak cocok.",
    path: ["new_password_confirmation"],
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: Props) {
  const { mutate: changePassword, isPending, error } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  const onSubmit = (values: FormValues) => {
    changePassword(values, {
      onSuccess: () => {
        toast.success("Password berhasil diubah.");
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-4" />
            Ganti Password
          </DialogTitle>
        </DialogHeader>

        {apiError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{apiError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="current_password">Password Lama</Label>
            <Input id="current_password" type="password" autoComplete="current-password" {...register("current_password")} />
            {errors.current_password && <p className="text-xs text-red-500">{errors.current_password.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="new_password">Password Baru</Label>
            <Input id="new_password" type="password" autoComplete="new-password" {...register("new_password")} />
            {errors.new_password && <p className="text-xs text-red-500">{errors.new_password.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="new_password_confirmation">Konfirmasi Password Baru</Label>
            <Input id="new_password_confirmation" type="password" autoComplete="new-password" {...register("new_password_confirmation")} />
            {errors.new_password_confirmation && <p className="text-xs text-red-500">{errors.new_password_confirmation.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
