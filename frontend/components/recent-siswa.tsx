"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useSiswaList } from "@/lib/hooks/useSiswa";
import { Badge } from "@/components/ui/badge-2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function RecentSiswa() {
  const { data, isLoading } = useSiswaList({ per_page: 8, page: 1 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Siswa Terdaftar</CardTitle>
        <CardDescription>{isLoading ? "Memuat data..." : `Menampilkan ${data?.data?.length ?? 0} dari ${data?.total ?? 0} siswa`}</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/siswa" />}>
            Lihat Semua
            <ArrowRight className="ml-1 size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">NISN</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Jurusan</TableHead>
              <TableHead>Tahun Masuk</TableHead>
              <TableHead className="pr-6">Jenis Kelamin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="pr-6">
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              : data?.data?.map(siswa => (
                  <TableRow key={siswa.id}>
                    <TableCell className="pl-6 font-mono text-sm">{siswa.nisn}</TableCell>
                    <TableCell className="font-medium">{siswa.nama}</TableCell>
                    <TableCell className="text-muted-foreground">{siswa.jurusan}</TableCell>
                    <TableCell className="text-muted-foreground">{siswa.tahun_masuk}</TableCell>
                    <TableCell className="pr-6">
                      <Badge variant={siswa.jenis_kelamin === "L" ? "info" : "warning"} appearance="light">
                        {siswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && (!data?.data || data.data.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Belum ada data siswa
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
