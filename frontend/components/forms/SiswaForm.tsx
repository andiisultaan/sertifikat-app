'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siswaSchema, SiswaFormValues } from '@/lib/validations/siswaSchema';
import { Siswa } from '@/services/api/siswaService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  defaultValues?: Partial<Siswa>;
  onSubmit: (values: SiswaFormValues) => void;
  isPending: boolean;
}

export function SiswaForm({ defaultValues, onSubmit, isPending }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiswaFormValues>({
    resolver: zodResolver(siswaSchema),
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        nis: defaultValues.nis ?? '',
        nama: defaultValues.nama ?? '',
        tempat_lahir: defaultValues.tempat_lahir ?? '',
        tanggal_lahir: defaultValues.tanggal_lahir
          ? defaultValues.tanggal_lahir.toString().slice(0, 10)
          : '',
        jenis_kelamin: defaultValues.jenis_kelamin,
        jurusan: defaultValues.jurusan ?? '',
        tahun_masuk: defaultValues.tahun_masuk,
      });
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="nis">NIS</Label>
          <Input id="nis" {...register('nis')} placeholder="1234567890" />
          {errors.nis && <p className="text-xs text-red-500">{errors.nis.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="nama">Nama Lengkap</Label>
          <Input id="nama" {...register('nama')} placeholder="Nama siswa" />
          {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
          <Input id="tempat_lahir" {...register('tempat_lahir')} placeholder="Kota" />
          {errors.tempat_lahir && (
            <p className="text-xs text-red-500">{errors.tempat_lahir.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
          <Input id="tanggal_lahir" type="date" {...register('tanggal_lahir')} />
          {errors.tanggal_lahir && (
            <p className="text-xs text-red-500">{errors.tanggal_lahir.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Jenis Kelamin</Label>
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                value="L"
                {...register('jenis_kelamin')}
                className="accent-primary"
              />
              Laki-laki
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                value="P"
                {...register('jenis_kelamin')}
                className="accent-primary"
              />
              Perempuan
            </label>
          </div>
          {errors.jenis_kelamin && (
            <p className="text-xs text-red-500">{errors.jenis_kelamin.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="jurusan">Jurusan</Label>
          <Input id="jurusan" {...register('jurusan')} placeholder="RPL, TKJ, dll" />
          {errors.jurusan && <p className="text-xs text-red-500">{errors.jurusan.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="tahun_masuk">Tahun Masuk</Label>
          <Input
            id="tahun_masuk"
            type="number"
            {...register('tahun_masuk', { valueAsNumber: true })}
            placeholder="2023"
          />
          {errors.tahun_masuk && (
            <p className="text-xs text-red-500">{errors.tahun_masuk.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
