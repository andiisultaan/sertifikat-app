'use client';

import { useRouter } from 'next/navigation';
import { SiswaForm } from '@/components/forms/SiswaForm';
import { useCreateSiswa } from '@/lib/hooks/useSiswa';
import { SiswaFormValues } from '@/lib/validations/siswaSchema';

export default function TambahSiswaPage() {
  const router = useRouter();
  const { mutate: create, isPending, error } = useCreateSiswa();

  const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  const handleSubmit = (values: SiswaFormValues) => {
    create(values, { onSuccess: () => router.push('/siswa') });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Tambah Siswa</h1>

      {apiError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
          {apiError}
        </p>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <SiswaForm onSubmit={handleSubmit} isPending={isPending} />
      </div>
    </div>
  );
}
