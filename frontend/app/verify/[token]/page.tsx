import { CheckCircle2, XCircle, ShieldCheck, Calendar, User, Hash, BookOpen, Award, Clock } from "lucide-react";

interface VerifyResult {
  valid: boolean;
  message: string;
  nomor_sertifikat?: string;
  nama?: string;
  nis?: string;
  jurusan?: string;
  nama_ukk?: string;
  predikat?: string;
  nilai_akhir?: number;
  tanggal_terbit?: string;
  masa_berlaku?: string;
}

async function verifySertifikat(token: string): Promise<VerifyResult> {
  try {
    // Server components use internal Docker URL to avoid going through public internet
    const apiUrl = process.env.NEXT_INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
    const res = await fetch(`${apiUrl}/verify/${token}`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { valid: false, message: "Gagal menghubungi server verifikasi." };
  }
}

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await verifySertifikat(token);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-slate-500 text-sm mb-2">
            <ShieldCheck className="size-4" />
            <span>Sistem Verifikasi Sertifikat UKK</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          {/* Status Banner */}
          <div className={`px-6 py-5 flex items-center gap-4 ${data.valid ? "bg-emerald-500" : "bg-red-500"}`}>
            {data.valid ? <CheckCircle2 className="size-10 text-white shrink-0" /> : <XCircle className="size-10 text-white shrink-0" />}
            <div>
              <p className="text-white font-bold text-lg leading-tight">{data.valid ? "Sertifikat Valid" : "Sertifikat Tidak Valid"}</p>
              <p className="text-white/80 text-sm mt-0.5">{data.message}</p>
            </div>
          </div>

          {/* Detail */}
          {data.valid && (
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Informasi Sertifikat</p>

              <InfoRow icon={Hash} label="Nomor Sertifikat" value={data.nomor_sertifikat} mono />
              <InfoRow icon={User} label="Nama Peserta" value={data.nama} />
              <InfoRow icon={Hash} label="NISN" value={data.nis} mono />
              <InfoRow icon={BookOpen} label="Kompetensi Keahlian" value={data.jurusan} />
              {data.nama_ukk && <InfoRow icon={BookOpen} label="Nama UKK" value={data.nama_ukk} />}

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Hasil Penilaian</p>
                <InfoRow icon={Award} label="Predikat" value={data.predikat} highlight />
                <InfoRow icon={Award} label="Nilai Akhir" value={String(data.nilai_akhir)} />
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Masa Berlaku</p>
                <InfoRow icon={Calendar} label="Tanggal Terbit" value={data.tanggal_terbit} />
                <InfoRow icon={Clock} label="Berlaku Hingga" value={data.masa_berlaku} />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">Verifikasi dilakukan secara otomatis &bull; Sertifikat UKK &copy; {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono = false, highlight = false }: { icon: React.ElementType; label: string; value?: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 size-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="size-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-sm font-medium truncate ${mono ? "font-mono text-slate-700" : "text-slate-800"} ${highlight ? "text-emerald-600 font-bold" : ""}`}>{value ?? "-"}</p>
      </div>
    </div>
  );
}
