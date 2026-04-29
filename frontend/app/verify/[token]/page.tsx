import { CheckCircle2, XCircle, ShieldCheck, ShieldAlert, ShieldX, Calendar, User, Hash, BookOpen, Award, Clock } from "lucide-react";

interface DigitalSignatureInfo {
  status: "valid" | "invalid" | "error" | "not_signed";
  is_signed: boolean;
  algorithm: string | null;
  fingerprint: string | null;
}

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
  signer_role?: "kepsek" | "penguji_eksternal";
  signer_jabatan?: string;
  signer_nama?: string;
  signer_nip?: string | null;
  digital_signature?: DigitalSignatureInfo;
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

              {/* Signer Block */}
              {data.signer_jabatan && (
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Penanda Tangan</p>
                  <InfoRow icon={User} label={data.signer_jabatan} value={data.signer_nama} />
                  {data.signer_nip && <InfoRow icon={Hash} label="NIP" value={data.signer_nip} mono />}
                </div>
              )}

              {/* Digital Signature Block */}
              <DigitalSignatureBlock sig={data.digital_signature} />
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

function DigitalSignatureBlock({ sig }: { sig?: DigitalSignatureInfo }) {
  if (!sig) return null;

  const isValid = sig.status === "valid";
  const isSigned = sig.is_signed;
  const isInvalid = sig.status === "invalid";

  const bgClass = isValid ? "bg-emerald-50 border-emerald-200" : isInvalid ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200";
  const textClass = isValid ? "text-emerald-700" : isInvalid ? "text-red-700" : "text-slate-500";
  const labelClass = isValid ? "text-emerald-800" : isInvalid ? "text-red-800" : "text-slate-600";

  const statusLabel = isValid
    ? "Tanda Tangan Digital Valid"
    : isInvalid
      ? "Tanda Tangan Digital Tidak Valid (Dokumen Mungkin Diubah)"
      : sig.status === "error"
        ? "Gagal Memverifikasi Tanda Tangan (Masalah Key)"
        : "Dokumen Belum Ditandatangani Digital";

  const Icon = isValid ? ShieldCheck : isInvalid ? ShieldX : ShieldAlert;

  // Format fingerprint: XXXXXXXX XXXXXXXX XXXXXXXX XXXXXXXX
  const fp = sig.fingerprint ? sig.fingerprint.match(/.{1,8}/g)?.join(" ") : null;

  return (
    <div className="border-t border-slate-100 pt-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Tanda Tangan Digital</p>
      <div className={`rounded-xl border p-4 ${bgClass}`}>
        <div className="flex items-start gap-3">
          <Icon className={`size-5 mt-0.5 shrink-0 ${textClass}`} />
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className={`text-sm font-semibold ${labelClass}`}>{statusLabel}</p>
            {fp && (
              <div className="mt-1">
                <p className="text-xs text-slate-400 mb-0.5">Fingerprint</p>
                <p className="font-mono text-xs text-slate-600 tracking-wide break-all">{fp}</p>
              </div>
            )}
            {!isSigned && <p className="text-xs text-slate-400 italic">Sertifikat ini belum memiliki tanda tangan digital. Hubungi administrator sekolah.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
