"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { UkkForm } from "@/components/forms/UkkForm";
import { useUkk, useUpdateUkk } from "@/lib/hooks/useUkk";
import { UkkFormValues } from "@/lib/validations/ukkSchema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";

export default function EditUkkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: ukk, isLoading } = useUkk(Number(id));
  const { mutate: update, isPending, error } = useUpdateUkk(Number(id));

  const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  const handleSubmit = (values: UkkFormValues) => {
    update(values, {
      onSuccess: () => {
        toast.success("UKK berhasil diperbarui");
        router.push("/ukk");
      },
      onError: () => toast.error("Gagal memperbarui UKK"),
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/ukk")} className="shrink-0">
          <ChevronLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit UKK</h1>
          <p className="text-sm text-muted-foreground">{isLoading ? "Memuat data..." : (ukk?.nama ?? "")}</p>
        </div>
      </div>

      {apiError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">{apiError}</p>}

      <div className="bg-white rounded-xl border shadow-sm p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        ) : (
          <UkkForm defaultValues={ukk} onSubmit={handleSubmit} isPending={isPending} mode="edit" />
        )}
      </div>
    </div>
  );
}
