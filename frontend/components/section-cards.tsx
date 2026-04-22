"use client";

import { TrendingUp, Users, ClipboardList, FileCheck, Award } from "lucide-react";

import { useSiswaList } from "@/lib/hooks/useSiswa";
import { useUkkList } from "@/lib/hooks/useUkk";
import { useNilaiList } from "@/lib/hooks/useNilai";
import { useSertifikatList } from "@/lib/hooks/useSertifikat";
import { Badge } from "@/components/ui/badge-2";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  title,
  value,
  isLoading,
  icon: Icon,
  footer,
  badge,
}: {
  title: string;
  value: number | undefined;
  isLoading: boolean;
  icon: React.ElementType;
  footer?: string;
  badge?: { label: string; variant?: "primary" | "secondary" | "success" | "warning" | "info" | "destructive" | "outline" };
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription className="flex items-center gap-1.5">
          <Icon className="size-4" />
          {title}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isLoading ? <Skeleton className="h-8 w-20" /> : (value ?? 0).toLocaleString("id-ID")}
        </CardTitle>
        {badge && (
          <CardAction>
            <Badge variant={badge.variant ?? "secondary"} appearance="light">{badge.label}</Badge>
          </CardAction>
        )}
      </CardHeader>
      {footer && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">{footer}</div>
        </CardFooter>
      )}
    </Card>
  );
}

export function SectionCards() {
  const { data: siswaData, isLoading: siswaLoading } = useSiswaList({ per_page: 1 });
  const { data: ukkData, isLoading: ukkLoading } = useUkkList({ per_page: 1 });
  const { data: nilaiData, isLoading: nilaiLoading } = useNilaiList({ per_page: 1 });
  const { data: sertifikatData, isLoading: sertifikatLoading } = useSertifikatList({ per_page: 1 });

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCard
        title="Total Siswa"
        value={siswaData?.total}
        isLoading={siswaLoading}
        icon={Users}
        footer="Jumlah seluruh siswa terdaftar"
      />
      <StatCard
        title="Data UKK"
        value={ukkData?.total}
        isLoading={ukkLoading}
        icon={ClipboardList}
        badge={ukkData && ukkData.total > 0 ? { label: "Aktif", variant: "success" } : undefined}
        footer="Total UKK yang tersedia"
      />
      <StatCard
        title="Nilai Diinput"
        value={nilaiData?.total}
        isLoading={nilaiLoading}
        icon={FileCheck}
        footer="Total nilai yang telah diinput"
      />
      <StatCard
        title="Sertifikat Diterbitkan"
        value={sertifikatData?.total}
        isLoading={sertifikatLoading}
        icon={Award}
        footer="Total sertifikat yang diterbitkan"
      />
    </div>
  );
}
