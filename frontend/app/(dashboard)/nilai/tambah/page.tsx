'use client';

import { useRouter } from 'next/navigation';
import { NilaiForm } from '@/components/forms/NilaiForm';
import { useCreateNilai } from '@/lib/hooks/useNilai';
import { useSiswaList } from '@/lib/hooks/useSiswa';
import { useUkkList } from '@/lib/hooks/useUkk';
import { NilaiFormValues } from '@/lib/validations/nilaiSchema';

export default function TambahNilaiPage() {
  const router = useRouter();
  const { mutate: create, isPending, error } = useCreateNilai();
  const { data: siswaData } = useSiswaList({ per_page: 100 });
  const { data: ukkData } = useUkkList({ per_page: 100 });

  const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  const handleSubmit = (values: NilaiFormValues) => {
    create(values, { onSuccess: () => router.push('/nilai') });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Input Nilai</h1>

      {apiError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
          {apiError}
        </p>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <NilaiForm
          siswaList={siswaData?.data ?? []}
          ukkList={ukkData?.data ?? []}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </div>
    </div>
  );
}
