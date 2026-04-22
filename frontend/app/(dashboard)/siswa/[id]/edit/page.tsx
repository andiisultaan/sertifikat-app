'use client';

import { useParams, useRouter } from 'next/navigation';
import { SiswaForm } from '@/components/forms/SiswaForm';
import { useSiswa, useUpdateSiswa } from '@/lib/hooks/useSiswa';
import { SiswaFormValues } from '@/lib/validations/siswaSchema';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditSiswaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: siswa, isLoading } = useSiswa(Number(id));
  const { mutate: update, isPending, error } = useUpdateSiswa(Number(id));

  const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  const handleSubmit = (values: SiswaFormValues) => {
    update(values, { onSuccess: () => router.push('/siswa') });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Edit Siswa</h1>

      {apiError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
          {apiError}
        </p>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
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
          <SiswaForm defaultValues={siswa} onSubmit={handleSubmit} isPending={isPending} />
        )}
      </div>
    </div>
  );
}
